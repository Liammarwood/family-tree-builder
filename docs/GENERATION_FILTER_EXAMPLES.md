# Generation Filter Examples

This document provides visual examples of how the generation filtering feature works with different settings.

## Filter UI Location

The generation filter is accessible from the toolbar at the top of the screen:

1. **Filter Icon Button**: Located in the top toolbar (funnel icon)
   - Gray when filter is disabled
   - Blue when filter is active
   - Requires a person to be selected

2. **Filter Popover Menu**: Opens when clicking the filter icon
   - Enable/disable toggle switch
   - Ancestor generations slider (0-10)
   - Descendant generations slider (0-10)
   - "Filter Active" chip when enabled

## Example Family Tree Structure

For these examples, we'll use this family tree structure:

```
Great-Grandparents (Generation 3)
        |
    Grandparents (Generation 2)
        |
     Parents (Generation 1)
        |
      YOU (Generation 0) + Partner (Generation 0)
        |                     |
   Sibling (Gen 0)            |
                              |
                          Children (Generation -1)
                              |
                      Grandchildren (Generation -2)
```

## Example Scenarios

### Example 1: Immediate Family Only

**Settings:**
- Ancestor Generations: 1
- Descendant Generations: 1

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings
- Your Parents
- Your Children

**Hidden People:**
- Grandparents
- Great-Grandparents
- Grandchildren

**Use Case:** Focus on nuclear family for a simple view

---

### Example 2: Three Generation View (Classic)

**Settings:**
- Ancestor Generations: 1
- Descendant Generations: 2

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings
- Your Parents
- Your Children
- Your Grandchildren

**Hidden People:**
- Grandparents
- Great-Grandparents

**Use Case:** View your immediate family and your grandchildren

---

### Example 3: Full Extended Family

**Settings:**
- Ancestor Generations: 2
- Descendant Generations: 2

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings
- Your Parents (and their partners)
- Your Grandparents (and their partners)
- Your Children (and their partners)
- Your Grandchildren (and their partners)

**Hidden People:**
- Great-Grandparents
- Great-Grandchildren

**Use Case:** View 5 generations centered on you

---

### Example 4: Ancestry Focus

**Settings:**
- Ancestor Generations: 10
- Descendant Generations: 0

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings (and their partners)
- Your Parents (and all their ancestors)
- Your Grandparents (and all their ancestors)
- Up to 10 generations of ancestors

**Hidden People:**
- All descendants (children, grandchildren, etc.)

**Use Case:** Research your ancestry and genealogy

---

### Example 5: Descendant Focus

**Settings:**
- Ancestor Generations: 0
- Descendant Generations: 10

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings (and their partners)
- Your Children (and all their descendants)
- Your Grandchildren (and all their descendants)
- Up to 10 generations of descendants

**Hidden People:**
- All ancestors (parents, grandparents, etc.)

**Use Case:** Track your family legacy and descendants

---

### Example 6: Siblings and Parents Only

**Settings:**
- Ancestor Generations: 1
- Descendant Generations: 0

**Visible People:**
- YOU (selected person)
- Your Partner
- Your Siblings (and their partners)
- Your Parents (and their partners)

**Hidden People:**
- All grandparents
- All children and descendants

**Use Case:** View your generation and the one above

---

### Example 7: No Filter (Default)

**Settings:**
- Filter Disabled (or both sliders at 0)

**Visible People:**
- Everyone in the tree

**Use Case:** View the complete family tree

---

## Filter Behavior Notes

### What Gets Included:

1. **Selected Person**: Always included at generation 0
2. **Partners**: Included at their spouse's generation level
3. **Siblings**: Included at generation 0 with the selected person
4. **Ancestors**: Parents, grandparents, etc., up to the specified level
5. **Descendants**: Children, grandchildren, etc., down to the specified level

### Edge Cases:

1. **Multiple Partners**: All partners at a generation level are included
2. **Half-Siblings**: Included if they share a parent within the visible range
3. **Step-Parents**: Only included if they have a partner relationship with a biological parent
4. **Adopted Children**: Treated the same as biological children
5. **Disconnected Nodes**: Only visible if they fall within the generation range

### Performance:

- The filter calculation is **memoized** for performance
- Filtering happens instantly even with large trees (hundreds of nodes)
- The UI remains responsive during filtering
- No data is lost or modified - filtering is completely non-destructive

## Tips for Best Use

1. **Start Small**: Begin with 1-2 generations and expand as needed
2. **Select Different People**: Try selecting different family members to see different perspectives
3. **Use for Presentations**: Create focused views for sharing specific lineages
4. **Combine with Auto-Layout**: Apply auto-layout before filtering for best visual results
5. **Export Filtered Views**: Take screenshots of filtered views for documentation

## Keyboard Shortcuts (Future Enhancement)

Potential keyboard shortcuts that could be added:

- `Ctrl + F`: Open filter menu
- `Ctrl + Shift + F`: Toggle filter on/off
- `+/-`: Increase/decrease ancestor generations
- `Shift + +/-`: Increase/decrease descendant generations
- `Ctrl + 0`: Reset filter (show all)

## Troubleshooting Common Issues

### Issue: Filter doesn't seem to work
**Solution**: Make sure you have:
1. Selected a person in the tree
2. Enabled the filter toggle
3. Set at least one slider to a value greater than 0

### Issue: Missing expected relatives
**Solution**: Check that:
1. The relationships are properly defined in your tree
2. The generation sliders are set high enough
3. Partners have explicit partner relationships

### Issue: Too many people showing
**Solution**:
1. Reduce the generation slider values
2. Remember that partners and siblings expand the visible set
3. Try selecting a different person as the center

## Future Enhancements

Ideas for improving the generation filter:

- [ ] Preset configurations (save/load filter settings)
- [ ] Visual generation level indicators on nodes
- [ ] Animated transitions when filter changes
- [ ] Filter by relationship type (blood only, legal only, etc.)
- [ ] Export filtered view as a new tree
- [ ] Highlight the selected person differently
- [ ] Show generation level counts in the UI
- [ ] Quick filter buttons (Parents Only, Children Only, etc.)
