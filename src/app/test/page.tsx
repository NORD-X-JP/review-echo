import {
  processReviewUseCase,
  RawReviewInput,
} from "@/features/review/application/analyze-workflow";
import { prisma } from "@/lib/prisma";

export default async function TestPage() {
  // DBにテスト用の宿泊事業者(User)が存在するか確認し、なければ作成する処理
  let testUser = await prisma.user.findFirst();
  if (!testUser) {
    testUser = await prisma.user.create({
      data: { email: "test@example.com", name: "テストホテル札幌" },
    });
  }

  // Server Action: フォーム送信時に実行されるバックエンド処理
  async function runTest(formData: FormData) {
    "use server"; // サーバー側で実行する宣言

    const text = formData.get("reviewText") as string;
    if (!text) return;

    const mockInput: RawReviewInput = {
      hotelId: testUser!.id,
      sourceReviewId: `test-${Date.now()}`, // 毎回違うIDにして重複エラーを回避
      reviewUrl: "https://example.com/review",
      overallRating: 3,
      postedAt: new Date(),
      reviewerName: "テスト太郎",
      sourceUserId: "user-123",
      avatarUrl: null,
      text: text,
    };

    try {
      await processReviewUseCase(mockInput);
      console.log("🎉 テスト成功！");
    } catch (error) {
      console.error("❌ エラー発生:", error);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI パイプライン動作確認</h1>
      <p className="mb-4 text-gray-600">
        以下のテキストエリアにテスト用の口コミ（日本語でも外国語でも可）を入力して送信ボタンを押してください。
        VS Codeのターミナルに実行ログが表示されます。
      </p>

      <form action={runTest} className="flex flex-col gap-4">
        <textarea
          name="reviewText"
          rows={6}
          className="border border-gray-300 p-2 rounded w-full text-black"
          placeholder="例: The room was beautiful but the breakfast was terrible. また、スタッフの対応はとても良かったです。"
          defaultValue="The room was beautiful but the breakfast was terrible. また、フロントのスタッフの対応はとても良かったです。"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit"
        >
          AIで分析してDBに保存
        </button>
      </form>
    </div>
  );
}
