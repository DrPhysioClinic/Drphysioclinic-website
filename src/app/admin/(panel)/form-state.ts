// Shared types/constants for admin forms. Kept out of the "use server" actions
// file, which may only export async functions.

export type SaveState = { error: string };
export const emptySave: SaveState = { error: "" };
