// 1. 純粋なリテラル型
export type Provenance = "FACT" | "INFERRED";
export type ReviewLabel =
  | "PRAISE"
  | "COMPLAINT"
  | "REQUEST"
  | "INQUIRY"
  | "NEUTRAL";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
export type CompanionType = "SOLO" | "COUPLE" | "FAMILY" | "GROUP" | "UNKNOWN";
export type TopicType =
  | "FOOD"
  | "ROOM"
  | "BATH"
  | "SERVICE"
  | "LOCATION"
  | "OTHER";

// 2. 推論データをラップする型
export interface DomainValue<T> {
  readonly value: T;
  readonly provenance: Provenance;
  readonly confidence: number | null;
  readonly reason: string | null;
}

// 3. 分割された文
export interface Sentence {
  readonly sequenceNum: number;
  readonly originalText: string;
  readonly translatedText: string | null;
}

// 4. トピック評価
export interface TopicEvaluation {
  readonly topic: TopicType;
  readonly label: ReviewLabel;
  readonly rating: number;
  readonly evidenceSequenceNums: readonly number[];
}

// 5. 分析結果
export interface ReviewAnalysis {
  readonly primaryLanguage: string;
  readonly secondaryLanguages: readonly string[];

  readonly nationality: DomainValue<string>;
  readonly gender: DomainValue<Gender>;
  readonly companion: DomainValue<CompanionType>;
  readonly overallLabel: DomainValue<ReviewLabel>;
}

// 6. レビュー（集約ルート - Aggregate Root）
export interface Review {
  // Fact (事実データ)
  readonly id: string; // システム内部ID
  readonly hotelId: string;
  readonly sourceReviewId: string; // 重複排除用
  readonly reviewUrl: string | null;
  readonly overallRating: number;
  readonly postedAt: Date;

  readonly reviewerName: string;
  readonly sourceUserId: string | null;
  readonly avatarUrl: string | null;

  // Components (構成要素)
  readonly sentences: readonly Sentence[];

  // Inferred (推論データ：分析前は null になるため Optional)
  readonly analysis?: ReviewAnalysis;
  readonly topics?: readonly TopicEvaluation[];
}
