import FamilyTree from "@/components/FamilyTree";
import { ConfigurationProvider } from "@/hooks/useConfiguration";

export default function Home() {
  return     <ConfigurationProvider>
<FamilyTree />
</ConfigurationProvider>;
}
