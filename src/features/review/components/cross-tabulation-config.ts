import { ReviewLabel, TopicType } from "@/features/review/domain/types";

export const TOPIC_LABELS: Record<TopicType, string> = {
  ROOM: "部屋",
  FOOD: "食事",
  SERVICE: "接客",
  BATH: "風呂",
  LOCATION: "立地",
  OTHER: "その他",
};

export type ExtendedLabel = ReviewLabel | "MIXED";

export const LABEL_COLORS: Record<ExtendedLabel, string> = {
  PRAISE: "#22c55e",
  COMPLAINT: "#ef4444",
  MIXED: "#a855f7",
  REQUEST: "#f59e0b",
  INQUIRY: "#3b82f6",
  NEUTRAL: "#9ca3af",
};
