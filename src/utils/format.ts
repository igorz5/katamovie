import { format } from "date-fns";

export const truncateText = (
  text: string,
  length: number,
  suffix?: string
): string => {
  if (text.length <= length) return text;

  const truncated = text.substring(0, text.lastIndexOf(" ", length));
  return suffix == null ? truncated : `${truncated} ${suffix}`;
};

export const formatDate = (date: Date): string => format(date, "MMMM d, Y");
