// Mirrors packages/renderer/src/lib/helpers/formatTimeAgo.ts in the
// Denokv-GUI-Client repository so the demo phrases dates the same way.

const formatter = new Intl.RelativeTimeFormat("en-US", { style: "long" });

export function formatTimeAgo(value: Date | string | null | undefined): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();

  if (Number.isNaN(timestamp)) return "";

  const diffInMs = Date.now() - timestamp;

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return formatter.format(-years, "year");
  if (months > 0) return formatter.format(-months, "month");
  if (weeks > 0) return formatter.format(-weeks, "week");
  if (days > 0) return formatter.format(-days, "day");
  if (hours > 0) return formatter.format(-hours, "hour");
  if (minutes > 0) return formatter.format(-minutes, "minute");

  return "just now";
}
