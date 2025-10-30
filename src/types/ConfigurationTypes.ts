export enum AvatarTypes {
    Square = "square",
    Rounded = "rounded",
    Circular = "circular"
}

export type NodeStyle = 'card' | 'compact' | 'rounded';

export type ThemeConfig = {
    nodeColor: string;
    edgeColor: string;
    fontFamily: string;
    nodeStyle: NodeStyle;
    textColor?: string;
}