import { format } from "date-fns";

// eslint-disable-next-line import/prefer-default-export
export const truncateText = (text: string, length: number, suffix?: string) => {
  if (text.length <= length) return text;

  const truncated = text.substring(0, text.lastIndexOf(" ", length));
  return suffix == null ? truncated : `${truncated} ${suffix}`;
};

export const formatDate = (date: Date) => format(date, "MMMM d, Y");
