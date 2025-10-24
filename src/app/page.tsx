"use client";

import FamilyTree from "@/components/FamilyTree";
import { RequireAuth } from "@/components/RequireAuth";
import { FamilyTreeProvider } from "@/hooks/FamilyTreeContextProvider";
import { ConfigurationProvider } from "@/hooks/useConfiguration";

export default function Home() {
  return (<RequireAuth>
    <ConfigurationProvider>
      <FamilyTreeProvider>
        <FamilyTree />
      </FamilyTreeProvider>
    </ConfigurationProvider>
  </RequireAuth>);
}
