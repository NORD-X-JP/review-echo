export const NATIONALITY_CODES = [
  "JP", // 日本
  "KR", // 韓国
  "CN", // 中国
  "TW", // 台湾
  "HK", // 香港
  "US", // アメリカ
  "CA", // カナダ
  "GB", // イギリス
  "AU", // オーストラリア
  "FR", // フランス
  "DE", // ドイツ
  "IT", // イタリア
  "ES", // スペイン
  "TH", // タイ
  "VN", // ベトナム
  "ID", // インドネシア
  "MY", // マレーシア
  "SG", // シンガポール
  "PH", // フィリピン
  "IN", // インド
  "UNKNOWN",
] as const;

export type NationalityCode = (typeof NATIONALITY_CODES)[number];

export const NATIONALITY_DISPLAY_NAMES: Record<NationalityCode, string> = {
  JP: "日本",
  KR: "韓国",
  CN: "中国",
  TW: "台湾",
  HK: "香港",
  US: "アメリカ",
  CA: "カナダ",
  GB: "イギリス",
  AU: "オーストラリア",
  FR: "フランス",
  DE: "ドイツ",
  IT: "イタリア",
  ES: "スペイン",
  TH: "タイ",
  VN: "ベトナム",
  ID: "インドネシア",
  MY: "マレーシア",
  SG: "シンガポール",
  PH: "フィリピン",
  IN: "インド",
  UNKNOWN: "不明",
};

export function getNationalityDisplayName(code: NationalityCode): string {
  return NATIONALITY_DISPLAY_NAMES[code];
}

export function parseNationalityCode(value: string): NationalityCode {
  return (NATIONALITY_CODES as readonly string[]).includes(value)
    ? (value as NationalityCode)
    : "UNKNOWN";
}
