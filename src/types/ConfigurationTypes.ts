export enum AvatarTypes {
    Square = "square",
    Rounded = "rounded",
    Circular = "circular"
}

export type NodeStyle = 'card' | 'compact' | 'rounded';

export type NodeComponentType = 'FamilyTreeNode' | 'AltFamilyTreeNode';

export type ExportConfig = {
    title?: string;
    showDates: boolean;
    nameFontSize: number;
    dateFontSize: number;
    nodeComponentType: NodeComponentType;
}

export type ThemeConfig = {
    nodeColor: string;
    edgeColor: string;
    fontFamily: string;
    nodeStyle: NodeStyle;
    textColor?: string;
    avatarSize?: number;
    exportConfig?: ExportConfig;
}