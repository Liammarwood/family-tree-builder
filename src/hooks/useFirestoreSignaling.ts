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
  DocumentReference,
  CollectionReference,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentChange,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useError } from "@/hooks/useError";

/** ----- Types for Firestore schema ----- */
interface IceCandidateData extends RTCIceCandidateInit {
  createdAt?: Date;
}

interface OfferAnswer {
  sdp: string;
  type: RTCSdpType;
}

interface CallDocument {
  offer?: OfferAnswer;
  answer?: OfferAnswer;
  createdAt?: Date;
  answeredAt?: Date;
}

/** ----- Cleanup Logic ----- */
let lastCleanup = 0; // throttle cleanup to once every 5 min

async function cleanupOldCalls(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  try {
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000);
    const callsRef = collection(db, "calls") as CollectionReference<CallDocument>;
    const q = query(callsRef, where("createdAt", "<", tenMinutesAgo));
    const snap = await getDocs(q);

    const deletions = snap.docs.map((docSnap: QueryDocumentSnapshot<CallDocument>) =>
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletions);

    if (snap.size > 0) {
      console.log(`🧹 Cleaned up ${snap.size} old call(s)`);
    }
  } catch (err) {
    console.warn("Cleanup skipped (no permission or offline):", err);
  }
}

/** ----- Firestore WebRTC Signaling Hook ----- */
export function useFirestoreSignaling() {
  const { showError } = useError();

  const createOffer = async (pc: RTCPeerConnection): Promise<string> => {
    if (pc.signalingState === "closed") {
      throw new Error("RTCPeerConnection was closed before offer creation");
    }

    await cleanupOldCalls();

    const callDoc = doc(collection(db, "calls")) as DocumentReference<CallDocument>;
    const offerCandidates = collection(
      callDoc,
      "offerCandidates"
    ) as CollectionReference<IceCandidateData>;
    const answerCandidates = collection(
      callDoc,
      "answerCandidates"
    ) as CollectionReference<IceCandidateData>;

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        addDoc(offerCandidates, {
          ...event.candidate.toJSON(),
          createdAt: serverTimestamp() as unknown as Date,
        });
      }
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer: OfferAnswer = {
      sdp: offerDescription.sdp ?? "",
      type: offerDescription.type,
    };

    await setDoc(callDoc, {
      offer,
      createdAt: serverTimestamp() as unknown as Date,
    });

    // Listen for answer
    onSnapshot(callDoc, (snapshot: DocumentSnapshot<CallDocument>) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot: QuerySnapshot<IceCandidateData>) => {
      snapshot.docChanges().forEach((change: DocumentChange<IceCandidateData>) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });

    return callDoc.id;
  };

  const joinCall = async (pc: RTCPeerConnection, callId: string): Promise<void> => {
    await cleanupOldCalls();

    const callDoc = doc(db, "calls", callId) as DocumentReference<CallDocument>;
    const offerCandidates = collection(
      callDoc,
      "offerCandidates"
    ) as CollectionReference<IceCandidateData>;
    const answerCandidates = collection(
      callDoc,
      "answerCandidates"
    ) as CollectionReference<IceCandidateData>;

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        addDoc(answerCandidates, {
          ...event.candidate.toJSON(),
          createdAt: serverTimestamp() as unknown as Date,
        });
      }
    };

    const callSnap = await getDoc(callDoc);
    const callData = callSnap.data();
    if (!callData?.offer) {
      showError("Invalid call ID or offer not found");
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer: OfferAnswer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp ?? "",
    };

    await updateDoc(callDoc, {
      answer,
      answeredAt: serverTimestamp() as unknown as Date,
    });

    // Listen for ICE candidates from offerer
    onSnapshot(offerCandidates, (snapshot: QuerySnapshot<IceCandidateData>) => {
      snapshot.docChanges().forEach((change: DocumentChange<IceCandidateData>) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  return { createOffer, joinCall };
}