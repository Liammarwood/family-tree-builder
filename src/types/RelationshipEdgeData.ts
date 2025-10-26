export type RelationshipEdgeData = {
    relationship: RelationshipType;
}

export enum RelationshipType {
    Parent = "Parent",
    Sibling = "Sibling",
    Child = "Child",
    Partner = "Partner",
    Divorced = "Divorced",
    Married = "Married"
}
