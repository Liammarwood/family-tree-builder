"use client";

import FamilyTree from "@/components/FamilyTree";
import { FamilyTreeProvider } from "@/hooks/FamilyTreeContextProvider";
import { ConfigurationProvider } from "@/hooks/useConfiguration";

export default function Home() {
  return (<ConfigurationProvider>
    <FamilyTreeProvider>
      <FamilyTree />
    </FamilyTreeProvider>
  </ConfigurationProvider>);
}
