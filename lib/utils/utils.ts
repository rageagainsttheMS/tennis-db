export function formatHand(hand: string): string {
  return hand === "LEFT" ? "Left Handed" : "Right Handed";
}

export function formatBackhand(backhand: string): string {
  return backhand === "ONEHANDED" ? "One Handed Backhand" : "Two Handed Backhand";
}