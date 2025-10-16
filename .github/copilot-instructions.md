This repository is a small Next.js (app router) React application that renders and edits family trees using React Flow and ELK for layout.

Key goals for an AI coding agent working here:
- Preserve the app's client-side React Flow + ELK layout contract when changing node/edge data shapes or layout logic.
- Keep UI behavior consistent: selection -> left-side details pane handled by `FamilyDetailsPane`, toolbar actions in `Toolbar.tsx`, and `FamilyTree.tsx` orchestrates tree state.

Quick architecture and important files
- `src/components/FamilyTree.tsx` — main client component. Central state (FamilyTreeData) lives here, nodes/edges are derived for React Flow, and edit/save/export logic is implemented here. Prefer edits here for global behaviors and for wiring UI actions.
- `src/libs/familyTreeUtils.ts` — data model (FamilyNodeType, FamilyTreeData), ID generation, initial tree, and `computeGenerations`. Any change to node shape must update usages in components and tests.
- `src/components/FamilyNode.tsx` — custom React Flow node rendering, handles and visual styling. Node dimensions (NODE_WIDTH, NODE_HEIGHT) are authoritative for layout code.
- `src/components/autoLayout.ts` — transforms React Flow nodes/edges into ELK graph and returns positioned nodes. It contains layout heuristics (partner/sibling grouping, dummy alignment nodes). Keep ELK options and fallback behavior in mind when modifying layout.
- `src/libs/treeToFlow.ts` — lighter converter used in some flows/tests; mirrors logic in `FamilyTree.tsx` but simpler.
- `src/components/Toolbar.tsx` — toolbar actions and the list of supported actions (add parent/child/partner/sibling, export PNG/PDF, auto-layout, etc.). When adding new UI actions, wire them here and in `FamilyTree.tsx`.

Data shapes and contracts
- FamilyNodeType keys: id, name, dob, countryOfBirth?, gender?, occupation?, dod?, maidenName?, photo?, parentIds?, children, partners?, createdAt?, x?, y?. See `familyTreeUtils.ts`.
- React Flow nodes: type `family`, data shaped as `FamilyNodeData` (see `FamilyNode.tsx`). NODE_WIDTH / NODE_HEIGHT are used by ELK so keep them in sync.
- Edge labels are used by `autoLayout.ts` to identify relationships: use labels 'Parent', 'Partner', 'Sibling' for parent/partner/sibling relationships respectively. The layout code expects parent edges to have source=parent and target=child.

Developer workflows (commands discovered in README)
- Start dev server: `npm run dev` (Next.js on port 3000).
- Run tests: `npm run test`. The repo uses Jest + ts-jest; tests live in `src/components/__tests__` (e.g., `autoLayout.test.ts`). If running tests locally, ensure dev dependencies include `jest ts-jest @types/jest jsdom @types/jsdom`.

Project-specific patterns and pitfalls
- Multiple parents supported: parentIds is an array. Shared-parent groups are collapsed into a dummy parent node in the React Flow graph — don't break the parent-group keying (implemented by sorting/joining parent IDs).
- Partners are stored bidirectionally (each node lists partners). Code often checks ordering (node.id < partnerId) when emitting partner edges to avoid duplicates.
- When adding/removing nodes, `FamilyTree.tsx` updates related arrays (children, parentIds, partners) across affected nodes. Keep updates atomic to avoid inconsistent graphs.
- Auto-layout: ELK is used synchronously (bundled). Changes to node sizes, labels, or the way groups are created must be reflected in `autoLayout.ts` so partner/sibling alignment remains stable. The function returns nodes with `data.autoPositioned` true when layout applied.

Testing hints
- Tests focus on layout behavior (`getElkLayout`). Use minimal Node/Edge fixtures with labels ('Parent','Partner','Sibling') to exercise layout heuristics.
- When modifying data shapes, update tests and `treeToFlow.ts`.

When editing code, prefer small, well-scoped PRs that:
- Preserve existing runtime behavior (run `npm run dev` and `npm run test`).
- Update `NODE_WIDTH`/`NODE_HEIGHT` and `autoLayout.ts` together when changing node visuals.
- Keep React Flow node/edge id determinism where tests rely on ordering (sort ids before making keys when grouping).

Examples from codebase (quick references)
- Creating a partner edge (avoids duplicates): see partner edge creation in `FamilyTree.tsx` where it checks `if (node.id < partnerId)`.
- Parent-group dummy node id key: `parentgroup-${parents.join(",")}` used to collapse shared parents into a single invisible node.
- ELK layout fallback: `autoLayout.ts` catches errors and returns original nodes unchanged — keep this behavior unless intentionally changing failover semantics.

If anything is unclear or you'd like more details (e.g., expand on tests, CI, or add more examples), tell me which areas to expand and I'll iterate.
