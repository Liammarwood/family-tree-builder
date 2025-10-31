// Centralized spacing constants used across layout and node components
export const NODE_WIDTH = 220; //180;
export const NODE_HEIGHT = 320;
// Default spacing used by auto-layout; compact mode may reduce this
export const BASE_SPACING = 30;

// Partners should be directly adjacent with only base spacing between them
export const PARTNER_SPACING = NODE_WIDTH + BASE_SPACING;

export const SIBLING_SPACING = 1.5 * NODE_WIDTH + BASE_SPACING;
