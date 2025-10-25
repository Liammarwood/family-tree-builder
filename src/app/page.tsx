"use client";

import FamilyTree from "@/components/FamilyTree";
import { RequireAuth } from "@/components/RequireAuth";
import { FamilyTreeProvider } from "@/hooks/FamilyTreeContextProvider";
import { ConfigurationProvider } from "@/hooks/useConfiguration";
import { ErrorProvider } from "@/hooks/useError";

export default function Home() {

  return (
    <ErrorProvider>
      <RequireAuth>
        <ConfigurationProvider>
          <FamilyTreeProvider>
            <FamilyTree />
          </FamilyTreeProvider>
        </ConfigurationProvider>
      </RequireAuth>
    </ErrorProvider>);
}
