export function formatExperience(min, max) {
  if (min == null && max == null) return "—";
  if (min != null && max != null && min !== max) return `${min}–${max} Years`;
  if (min != null) return `${min}+ Years`;
  return `Up to ${max} Years`;
}
