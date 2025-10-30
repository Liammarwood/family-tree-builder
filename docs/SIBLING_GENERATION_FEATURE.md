# Sibling Generation Filtering Feature

## Overview

Added the ability to control whether aunts/uncles, great aunts/uncles, and other lateral relatives are shown at each generation level. This gives users fine-grained control over which family members appear in the filtered view.

## UI Changes

### Generation Filter Popover

The filter popover now includes **three sliders**:

1. **Ancestor Generations** (0-10)
   - Controls how many generations of direct ancestors to show
   - Labels: None, Parents, Grandparents, Great

2. **Descendant Generations** (0-10)
   - Controls how many generations of direct descendants to show
   - Labels: None, Children, Grandchildren, Great

3. **Sibling Generations** (0-10) **← NEW**
   - Controls how many generations of lateral siblings to show
   - Labels: None, Aunts/Uncles, Great
   - 0 = Don't show any siblings of ancestors/descendants
   - 1 = Show aunts/uncles (siblings of parents)
   - 2 = Show great aunts/uncles (siblings of grandparents)
   - etc.

## Usage Examples

### Example 1: Parents Only (No Aunts/Uncles)

**Settings:**
- Ancestor Generations: 1 (Parents)
- Descendant Generations: 0 (None)
- Sibling Generations: 0 (None)

**Result:**
```
Shows: You + Your Parents
Hides: Your Aunts/Uncles
```

### Example 2: Parents and Aunts/Uncles

**Settings:**
- Ancestor Generations: 1 (Parents)
- Descendant Generations: 0 (None)
- Sibling Generations: 1 (Aunts/Uncles)

**Result:**
```
Shows: You + Your Parents + Your Aunts/Uncles (and their partners)
Hides: Your Grandparents, Great Aunts/Uncles
```

### Example 3: Extended Family with Selective Sibling Control

**Settings:**
- Ancestor Generations: 2 (Grandparents)
- Descendant Generations: 1 (Children)
- Sibling Generations: 1 (Aunts/Uncles)

**Result:**
```
Shows: 
  - Grandparents
  - Parents
  - Your Aunts/Uncles (siblings of parents)
  - You
  - Your Siblings
  - Your Children

Hides:
  - Great Aunts/Uncles (siblings of grandparents)
```

### Example 4: Full Extended Family

**Settings:**
- Ancestor Generations: 3 (Great-Grandparents)
- Descendant Generations: 2 (Grandchildren)
- Sibling Generations: 2 (Great Aunts/Uncles)

**Result:**
```
Shows:
  - Great-Grandparents and their siblings
  - Grandparents and their siblings (great aunts/uncles)
  - Parents and their siblings (aunts/uncles)
  - You and your siblings
  - Your Children and their siblings
  - Your Grandchildren and their siblings
```

## How It Works

### Generation Classification

The system now classifies each person as either:

1. **Direct Lineage** - Always shown if within generation range
   - Selected person (generation 0)
   - Direct ancestors (parents, grandparents, etc.)
   - Direct descendants (children, grandchildren, etc.)
   - Partners of anyone in direct lineage

2. **Lateral Siblings** - Only shown if sibling generation allows
   - Siblings of the selected person (generation 0)
   - Siblings of parents = Aunts/Uncles (generation 1)
   - Siblings of grandparents = Great Aunts/Uncles (generation 2)
   - Siblings of children = Nieces/Nephews (generation -1)
   - Siblings of grandchildren = Grand Nieces/Nephews (generation -2)
   - Partners of any lateral siblings

### Algorithm Details

1. **BFS Traversal**: Traverse the tree to assign generation levels
2. **Lineage Tracking**: Mark nodes as direct lineage vs lateral siblings
3. **Filtering**: Apply both generation and sibling filters
   - Check if node is within ancestor/descendant range
   - If node is a sibling, check if within sibling range
   - Partners inherit the status of their spouse

### Generation Levels

```
Generation +3: Great-Grandparents
Generation +2: Grandparents
Generation +1: Parents
Generation  0: Selected Person (YOU)
Generation -1: Children
Generation -2: Grandchildren
Generation -3: Great-Grandchildren
```

### Sibling Relationships at Each Level

```
At Generation +2: Great Aunts/Uncles (siblings of grandparents)
At Generation +1: Aunts/Uncles (siblings of parents)
At Generation  0: Your Siblings
At Generation -1: Nieces/Nephews (siblings of your children)
At Generation -2: Grand Nieces/Nephews (siblings of grandchildren)
```

## Benefits

### Before (Original Implementation)
- Could only control ancestor and descendant generations
- All siblings at visible generations were automatically shown
- No way to hide aunts/uncles while showing parents

### After (Enhanced Implementation)
- Independent control over direct lineage and lateral siblings
- Can show parents without their siblings
- Can limit sibling visibility to certain generations
- More focused family tree views

## Use Cases

### Research Focus
**Show only direct lineage:**
- Ancestors: 10, Descendants: 0, Siblings: 0
- Result: Pure ancestor research without lateral relatives

### Immediate Family
**Focus on nuclear family:**
- Ancestors: 1, Descendants: 1, Siblings: 0
- Result: Just parents, you, and children (no aunts/uncles)

### Extended Family (Selective)
**Include some lateral relatives:**
- Ancestors: 2, Descendants: 2, Siblings: 1
- Result: 5 generations with aunts/uncles but not great aunts/uncles

### Full Family Tree
**Show everyone:**
- Ancestors: 10, Descendants: 10, Siblings: 10
- Result: All family members within 10 generations

## Technical Implementation

### Key Functions

1. **`calculateExtendedGenerationInfo()`**
   - Returns `Map<nodeId, GenerationInfo>`
   - `GenerationInfo` includes: `generation` and `isSiblingAtGeneration`
   - Tracks which nodes are lateral siblings vs direct lineage

2. **`filterByGenerationLevel()`** (enhanced)
   - Now accepts optional `siblingGenerations` parameter
   - Applies sibling filter to lateral relatives
   - Maintains backward compatibility when parameter is undefined

### Type Definitions

```typescript
export type GenerationInfo = {
  generation: number;
  isSiblingAtGeneration: boolean;
};

export type GenerationFilter = {
  enabled: boolean;
  ancestorGenerations: number;
  descendantGenerations: number;
  siblingGenerations: number; // NEW
};
```

## Testing

### New Tests Added

1. **Test filtering aunts/uncles**
   - Verifies siblings at generation 1 can be hidden/shown
   - Tests with siblingGenerations = 0 (hide) and 1 (show)

2. **Test filtering great aunts/uncles**
   - Verifies siblings at generation 2 can be controlled
   - Tests multi-level sibling filtering

3. **Test backward compatibility**
   - Ensures existing behavior works when siblingGenerations is undefined
   - Validates that old code still functions correctly

**Total Tests: 69 (up from 66)**

## Migration Guide

### For Existing Users

The feature is **fully backward compatible**:
- Existing filters will continue to work
- Default sibling generation is 2 (show aunts/uncles and great aunts/uncles)
- No changes needed to existing code

### For Developers

If calling `filterByGenerationLevel()` directly:
```typescript
// Old (still works)
filterByGenerationLevel(nodes, edges, selectedId, 2, 2);

// New (with sibling control)
filterByGenerationLevel(nodes, edges, selectedId, 2, 2, 1);
```

## Future Enhancements

Possible improvements:
- [ ] Preset configurations (e.g., "Nuclear Family", "Full Extended")
- [ ] Separate cousin control (independent from aunt/uncle control)
- [ ] Visual indicators showing which generation each person belongs to
- [ ] Export filtered views as separate trees
- [ ] Save filter preferences per tree

## Related Documentation

- [Generation Filter User Guide](GENERATION_FILTER.md)
- [Generation Filter Examples](GENERATION_FILTER_EXAMPLES.md)
- Main README.md
