"use client";

import { useState, useTransition } from "react";
import { submitTestReviewAction } from "@/features/review/presentation/actions";

export default function TestPage() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const text = formData.get("reviewText") as string;

    // Server Actionを呼び出す
    startTransition(async () => {
      const result = await submitTestReviewAction(text);

      // Result型に基づく安全なエラーハンドリング
      if (result.success) {
        alert("🎉 " + result.data);
      } else {
        alert("❌ エラー: " + result.error);
      }
    });
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI パイプライン動作確認</h1>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <textarea
          name="reviewText"
          rows={6}
          className="border border-gray-300 p-2 rounded w-full text-black"
          defaultValue="The room was beautiful but the breakfast was terrible. また、フロントのスタッフの対応はとても良かったです。"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? "分析中..." : "AIで分析してDBに保存"}
        </button>
      </form>
    </div>
  );
}
