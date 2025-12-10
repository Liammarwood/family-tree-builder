# Multi-Mode Tree Creator

This document describes the multi-mode scaffolding added to the Family Tree Builder application, enabling it to function as a General Tree Creator that can switch between different tree types.

## Overview

The application now supports three modes:

1. **Family Tree** (`family`) - Traditional family tree with parents, children, and partners
2. **Organization Chart** (`org`) - Organizational hierarchy (coming soon)
3. **Generic Tree** (`generic`) - Generic tree structure (coming soon)

The default mode is `family` to preserve existing behavior and ensure backward compatibility.

## Architecture

### Mode Context (`src/contexts/ModeContext.tsx`)

The mode system is built around a React Context that provides:

- **Mode Type**: A union type `'family' | 'org' | 'generic'`
- **ModeProvider**: React context provider component
- **useMode Hook**: Hook to access and update the current mode
- **MODE_LABELS**: Display names for each mode

**Example Usage:**

```tsx
import { useMode, MODE_LABELS } from '@/contexts/ModeContext';

function MyComponent() {
  const { mode, setMode } = useMode();
  
  return (
    <div>
      <p>Current mode: {MODE_LABELS[mode]}</p>
      <button onClick={() => setMode('org')}>Switch to Org</button>
    </div>
  );
}
```

### GenericNode Wrapper (`src/components/reactflow/GenericNode.tsx`)

A wrapper component that renders different node types based on the current mode:

- Currently renders `AltFamilyTreeNode` for all modes to preserve existing behavior
- Future PRs can add mode-specific node components (e.g., `OrgNode`, `GenericTreeNode`)
- Maintains NODE_WIDTH and NODE_HEIGHT constants for layout compatibility

**Node Type Resolution:**

```tsx
// In constants.ts
export const NODE_TYPES = { family: GenericNode };

// GenericNode internally switches based on mode:
switch (mode) {
  case 'family':
    return <AltFamilyTreeNode {...props} />;
  case 'org':
    // TODO: return <OrgNode {...props} />;
    return <AltFamilyTreeNode {...props} />;
  case 'generic':
    // TODO: return <GenericTreeNode {...props} />;
    return <AltFamilyTreeNode {...props} />;
}
```

### Mode Selector UI

The toolbar (`FamilyTreeToolbar.tsx`) includes a toggle button group to switch modes:

- **Desktop**: Toggle buttons with icons for Family/Org/Generic
- **Mobile**: Currently included in SpeedDial (can be extended)
- Mode changes are persisted during the session via context

### Integration Points

1. **App Layout** (`src/app/page.tsx`):
   - `ModeProvider` wraps the entire application tree
   - Positioned after `FamilyTreeProvider` and before `ClipboardProvider`

2. **FamilyTree Component** (`src/components/FamilyTree.tsx`):
   - Consumes mode via `useMode()` hook
   - Ready for mode-specific logic in future PRs
   - Currently maintains identical behavior in family mode

3. **Constants** (`src/libs/constants.ts`):
   - `NODE_TYPES` uses `GenericNode` instead of direct node components
   - Enables runtime node type switching based on mode

## Adding a New Mode

To add support for a new tree mode (e.g., "Project Tree"), follow these steps:

### 1. Update the Mode Type

In `src/contexts/ModeContext.tsx`:

```tsx
export type Mode = 'family' | 'org' | 'generic' | 'project';

export const MODE_LABELS: Record<Mode, string> = {
  family: 'Family Tree',
  org: 'Org Chart',
  generic: 'Generic Tree',
  project: 'Project Tree', // Add new label
};
```

### 2. Create a Custom Node Component

Create `src/components/reactflow/ProjectNode.tsx`:

```tsx
import React from "react";
import { NodeProps } from "reactflow";
import { FamilyNodeData } from "@/types/FamilyNodeData";
import { NODE_WIDTH } from '@/libs/spacing';

export const ProjectNode = ({ selected, data, preview }: NodeProps<FamilyNodeData> & { preview?: boolean }) => {
  // Implement custom rendering for project nodes
  return (
    <div style={{ width: NODE_WIDTH }}>
      {/* Custom project node UI */}
    </div>
  );
};
```

**Important**: Maintain `NODE_WIDTH` and `NODE_HEIGHT` for layout compatibility.

### 3. Update GenericNode

In `src/components/reactflow/GenericNode.tsx`:

```tsx
import { ProjectNode } from "@/components/reactflow/ProjectNode";

export const GenericNode = (props: NodeProps<FamilyNodeData> & { preview?: boolean }) => {
  const { mode } = useMode();

  switch (mode) {
    case 'family':
      return <AltFamilyTreeNode {...props} />;
    case 'org':
      return <OrgNode {...props} />;
    case 'generic':
      return <GenericTreeNode {...props} />;
    case 'project':
      return <ProjectNode {...props} />; // Add new case
    default:
      return <AltFamilyTreeNode {...props} />;
  }
};
```

### 4. Update Toolbar UI

In `src/components/FamilyTreeToolbar.tsx`, add a new toggle button:

```tsx
<ToggleButton value="project" aria-label="project tree">
  <Tooltip title={MODE_LABELS.project}>
    <ProjectIcon fontSize="small" />
  </Tooltip>
</ToggleButton>
```

### 5. Add Mode-Specific Logic (Optional)

In `src/components/FamilyTree.tsx`, add conditional behavior:

```tsx
const { mode } = useMode();

// Example: Filter available actions based on mode
const availableActions = useMemo(() => {
  if (mode === 'project') {
    // Return project-specific actions
    return projectActions;
  }
  return familyActions;
}, [mode]);
```

### 6. Add Tests

Create `src/components/__tests__/projectMode.test.tsx`:

```tsx
import { render } from '@testing-library/react';
import { ModeProvider } from '@/contexts/ModeContext';
// Test that project mode renders ProjectNode
// Test that project-specific actions are available
```

## Data Model Compatibility

**Important**: The current phase does NOT change the data model (`FamilyNodeData`, `FamilyTreeData`). All modes currently use the same node data structure.

Future phases may introduce:
- Mode-specific data shapes (e.g., `OrgNodeData` with manager/reports)
- Data migration utilities
- Mode-aware serialization/deserialization

For now, all modes share the family tree data model with fields like `parents`, `children`, `partners`.

## Testing

Run mode-related tests:

```bash
npm test -- modeSwitch.test.tsx
```

Run all tests to ensure no regressions:

```bash
npm test
```

## Constraints and Limitations

### Current Phase (Phase 1 - Scaffolding)

- **No data model changes**: All modes use `FamilyNodeData`
- **Node rendering**: All modes render `AltFamilyTreeNode` (family node component)
- **Layout algorithm**: Uses family tree layout for all modes
- **Toolbar actions**: Same actions available in all modes

### Future Enhancements (Phase 2+)

- Mode-specific data models and node types
- Custom layout algorithms per mode (e.g., org chart top-down layout)
- Mode-specific toolbar actions and relationships
- Data migration tools for converting between modes
- Per-mode configuration and preferences

## Backward Compatibility

All changes maintain backward compatibility with existing family trees:

1. **Default mode**: `family` mode is the default
2. **Existing behavior**: Family mode behaves identically to pre-mode version
3. **Data persistence**: No changes to tree storage format
4. **Node components**: Uses existing `AltFamilyTreeNode` for family mode
5. **Layout**: Uses existing `autoLayoutFamilyTree` function

## Examples

### Switching Modes Programmatically

```tsx
import { useMode } from '@/contexts/ModeContext';

function TreeTypeSelector() {
  const { mode, setMode } = useMode();
  
  return (
    <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
      <option value="family">Family Tree</option>
      <option value="org">Org Chart</option>
      <option value="generic">Generic Tree</option>
    </select>
  );
}
```

### Conditional Rendering Based on Mode

```tsx
import { useMode } from '@/contexts/ModeContext';

function TreeEditor() {
  const { mode } = useMode();
  
  return (
    <div>
      {mode === 'family' && <FamilyRelationshipEditor />}
      {mode === 'org' && <OrgHierarchyEditor />}
      {mode === 'generic' && <GenericTreeEditor />}
    </div>
  );
}
```

### Mode-Aware Layout

```tsx
import { useMode } from '@/contexts/ModeContext';
import { autoLayoutFamilyTree } from '@/libs/autoLayout';

async function layoutTree(nodes: Node[], edges: Edge[]) {
  const { mode } = useMode();
  
  switch (mode) {
    case 'family':
      return autoLayoutFamilyTree(nodes, edges);
    case 'org':
      // TODO: return autoLayoutOrgChart(nodes, edges);
      return autoLayoutFamilyTree(nodes, edges);
    default:
      return autoLayoutFamilyTree(nodes, edges);
  }
}
```

## Troubleshooting

### Mode not changing

Ensure `ModeProvider` wraps your component tree:

```tsx
<ModeProvider>
  <YourApp />
</ModeProvider>
```

### "useMode must be used within a ModeProvider" error

This error occurs when `useMode()` is called outside the `ModeProvider`. Move the provider higher in the component tree.

### Node not rendering in new mode

Check that `GenericNode` has a case for your mode and returns a valid component.

## Future Considerations

1. **Persistent Mode Selection**: Save mode preference to localStorage or user settings
2. **Mode-Specific Layouts**: Different auto-layout algorithms per mode
3. **Data Validation**: Mode-specific validation rules for node data
4. **Export/Import**: Handle mode metadata in export files
5. **Mode Migration**: Tools to convert trees between modes
6. **Customizable Modes**: Allow users to define custom modes

## Contributing

When contributing mode-related features:

1. Maintain backward compatibility with family mode
2. Add tests for new mode-specific behavior
3. Update this documentation
4. Follow the established patterns for mode switching
5. Preserve NODE_WIDTH/NODE_HEIGHT for layout compatibility

## References

- Mode Context: `src/contexts/ModeContext.tsx`
- Generic Node: `src/components/reactflow/GenericNode.tsx`
- Mode Tests: `src/components/__tests__/modeSwitch.test.tsx`
- Toolbar Integration: `src/components/FamilyTreeToolbar.tsx`
- FamilyTree Integration: `src/components/FamilyTree.tsx`
