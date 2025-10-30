# Generation Level Filtering Feature

## Overview

The Generation Level Filtering feature allows users to focus on specific parts of their family tree by filtering to show only relatives within a certain number of generations from a selected person. This is useful for:

- Viewing immediate family (parents and children only)
- Exploring extended family up to grandparents or great-grandparents
- Analyzing specific lineage branches without distraction
- Creating focused views for presentations or reports

## How to Use

### 1. Select a Person

Click on any person in the family tree to select them. This person becomes the "center" of the generation filter.

### 2. Open the Filter Menu

Click the **Filter** icon (funnel icon) in the top toolbar. The icon will be highlighted in blue when filtering is active.

### 3. Enable Filtering

Toggle the **"Enable Filter"** switch in the popover menu.

**Note:** The filter controls are disabled until you select a person in the tree.

### 4. Adjust Generation Levels

Use the sliders to set how many generations to show:

#### Ancestor Generations (Going Up the Tree)
- **0 (None)**: Don't show any ancestors
- **1 (Parents)**: Show parents only
- **2 (Grandparents)**: Show parents and grandparents
- **3+ (Great-grandparents and beyond)**: Show more ancestor generations

#### Descendant Generations (Going Down the Tree)
- **0 (None)**: Don't show any descendants
- **1 (Children)**: Show children only
- **2 (Grandchildren)**: Show children and grandchildren
- **3+ (Great-grandchildren and beyond)**: Show more descendant generations

### 5. View Filtered Tree

The family tree automatically updates to show only the people within the selected generation range. The filter is non-destructive - your data is preserved, just temporarily hidden from view.

## What Gets Included in the Filter

When filtering by generation level, the following relationships are considered:

- **Selected Person**: Always shown (generation 0)
- **Partners**: Partners of the selected person are shown at generation 0
- **Siblings**: Siblings of the selected person are shown at generation 0
- **Ancestors**: Parents, grandparents, great-grandparents, etc., based on the slider setting
- **Partners of Ancestors**: Partners are included at their spouse's generation level
- **Descendants**: Children, grandchildren, great-grandchildren, etc., based on the slider setting
- **Partners of Descendants**: Partners are included at their spouse's generation level

## Examples

### Example 1: Immediate Family Only
- **Ancestor Generations**: 1 (Parents)
- **Descendant Generations**: 1 (Children)
- **Result**: Shows you, your parents, your siblings, your partner, and your children

### Example 2: Extended Family View
- **Ancestor Generations**: 2 (Grandparents)
- **Descendant Generations**: 2 (Grandchildren)
- **Result**: Shows 5 generations centered on you - from grandparents to grandchildren

### Example 3: Ancestry Focus
- **Ancestor Generations**: 5 (Great-great-great-grandparents)
- **Descendant Generations**: 0 (None)
- **Result**: Shows only your ancestral line going back 5 generations

### Example 4: Descendant Focus
- **Ancestor Generations**: 0 (None)
- **Descendant Generations**: 5 (Great-great-great-grandchildren)
- **Result**: Shows only your descendants going down 5 generations

## Technical Implementation

### Generation Calculation Algorithm

The feature uses a breadth-first search (BFS) algorithm to traverse the family tree:

1. Start with the selected node at generation 0
2. Traverse upward through parent relationships (positive generation numbers)
3. Traverse downward through child relationships (negative generation numbers)
4. Include partners and siblings at their appropriate generation levels
5. Build a generation map assigning each person a generation number relative to the selected person

### Filtering Process

1. Calculate generation levels for all nodes relative to selected node
2. Filter nodes to include only those within the specified range:
   - Generation ≤ ancestorGenerations (for ancestors)
   - Generation ≥ -descendantGenerations (for descendants)
3. Filter edges to include only connections between visible nodes
4. Update React Flow to display filtered nodes and edges

### Performance Considerations

- Generation calculations are memoized to prevent unnecessary recalculations
- Filtering is applied efficiently using Set operations for O(1) lookups
- The feature works with large family trees (hundreds of nodes)
- UI remains responsive during filtering operations

## Code References

### Key Files

- **`src/libs/generations.ts`**: Core generation calculation and filtering logic
- **`src/libs/__tests__/generations.test.ts`**: Comprehensive test suite
- **`src/components/FamilyTree.tsx`**: Integration of filtering into main tree component
- **`src/components/FamilyTreeToolbar.tsx`**: Filter UI controls and popover menu
- **`src/app/page.tsx`**: State management for generation filter

### API

#### `calculateGenerationLevels(nodes, edges, selectedNodeId)`

Calculates the generation level of each node relative to a selected node.

**Returns:** `Map<string, number>` where:
- Positive values = ancestors (1 = parents, 2 = grandparents, etc.)
- Negative values = descendants (-1 = children, -2 = grandchildren, etc.)
- 0 = the selected node, its partners, and siblings

#### `filterByGenerationLevel(nodes, edges, selectedNodeId, ancestorGenerations, descendantGenerations)`

Filters nodes and edges based on generation levels.

**Returns:** `{ nodes: Node[], edges: Edge[] }`

### Type Definitions

```typescript
export type GenerationFilter = {
  enabled: boolean;
  ancestorGenerations: number;
  descendantGenerations: number;
};
```

## Future Enhancements

Potential improvements for future versions:

- [ ] Preset filter configurations (e.g., "Nuclear Family", "Extended Family")
- [ ] Save filter settings per tree
- [ ] Visual indicators on nodes showing their generation level
- [ ] Filter by specific relationship types (e.g., show only blood relatives)
- [ ] Export filtered view as a separate tree
- [ ] Keyboard shortcuts for quick filtering
- [ ] Animation when filtering is applied/removed

## Troubleshooting

### Filter Not Working

**Problem:** Clicking "Enable Filter" doesn't change the tree.

**Solutions:**
1. Ensure a person is selected in the tree (click on a node)
2. Check that generation sliders are set to values greater than 0
3. Try adjusting the slider values to include more generations

### Some Expected People Not Showing

**Problem:** Expected relatives are not visible in the filtered view.

**Solutions:**
1. Verify that the relationship connections exist in your tree (check edges)
2. Increase the generation level sliders to include more generations
3. Check that the person has proper parent/child relationships defined
4. Partners must have explicit partner relationships to be included

### Performance Issues

**Problem:** Tree is slow when filtering is enabled.

**Solutions:**
1. Disable the filter when working with very large trees (1000+ nodes)
2. Reduce the number of generations shown
3. Consider splitting your tree into smaller, more manageable trees

## Testing

The feature includes comprehensive test coverage:

- 13 unit tests for generation calculation
- Tests for various family structures (nuclear, extended, complex)
- Edge cases (orphans, multiple partners, divorced partners)
- Performance tests for large trees

Run tests with:
```bash
npm test -- generations.test.ts
```

## Support

For issues, questions, or feature requests related to generation filtering, please:

1. Check this documentation
2. Review the test files for examples
3. Open an issue on GitHub with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot if applicable
   - Tree structure (if comfortable sharing)
