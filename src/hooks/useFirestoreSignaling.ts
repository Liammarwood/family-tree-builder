import {
  collection,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";

let lastCleanup = 0; // throttle cleanup to once every 5 min

async function cleanupOldCalls() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return; // only run every 5 min
  lastCleanup = now;

  try {
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
    const callsRef = collection(db, "calls");
    const q = query(callsRef, where("createdAt", "<", tenMinutesAgo));
    const snap = await getDocs(q);

    const batch = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(batch);

    if (snap.size > 0) {
      console.log(`🧹 Cleaned up ${snap.size} old call(s)`);
    }
  } catch (err) {
    console.warn("Cleanup skipped (no permission or offline):", err);
  }
}

export function useFirestoreSignaling() {
  const { showError } = useError(); 

  const createOffer = async (pc: RTCPeerConnection) => {
    // 🔹 Run cleanup before creating a new call
    await cleanupOldCalls();

    const callDoc = doc(collection(db, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    // Listen for ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, {
          ...event.candidate.toJSON(),
          createdAt: serverTimestamp(),
        });
      }
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, {
      offer,
      createdAt: serverTimestamp(), // TTL field equivalent
    });

    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // Add ICE candidates from the other peer
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    return callDoc.id;
  };

  const joinCall = async (pc: RTCPeerConnection, callId: string) => {
    // 🔹 Also run cleanup here (e.g., before joining)
    await cleanupOldCalls();

    const callDoc = doc(db, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, {
          ...event.candidate.toJSON(),
          createdAt: serverTimestamp(),
        });
      }
    };

    const callData = (await getDoc(callDoc)).data();
    if (!callData?.offer) {
      showError("Invalid call ID or offer not found");
      return;
    }

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, {
      answer,
      answeredAt: serverTimestamp(),
    });

    // Listen for ICE candidates from offerer
    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  return { createOffer, joinCall };
}