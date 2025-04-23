export const STICKY_COLORS = [
  { value: "sticky-pink", label: "Pink" },
  { value: "sticky-yellow", label: "Yellow" },
  { value: "sticky-green", label: "Green" },
  { value: "sticky-blue", label: "Blue" },
  { value: "sticky-purple", label: "Purple" },
  { value: "sticky-orange", label: "Orange" },
  { value: "sticky-teal", label: "Teal" }
];

export function getColorClass(color: string): string {
  switch (color) {
    case "sticky-pink":
      return "bg-[hsl(var(--sticky-pink))]";
    case "sticky-yellow":
      return "bg-[hsl(var(--sticky-yellow))]";
    case "sticky-green":
      return "bg-[hsl(var(--sticky-green))]";
    case "sticky-blue":
      return "bg-[hsl(var(--sticky-blue))]";
    case "sticky-purple":
      return "bg-[hsl(var(--sticky-purple))]";
    case "sticky-orange":
      return "bg-[hsl(var(--sticky-orange))]";
    case "sticky-teal":
      return "bg-[hsl(var(--sticky-teal))]";
    default:
      return "bg-[hsl(var(--sticky-yellow))]";
  }
}
