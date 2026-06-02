"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateRangeOption } from "../application/query-workflow";

const OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: "all", label: "全期間" },
  { value: "7days", label: "直近1週間" },
  { value: "30days", label: "直近1ヶ月" },
  { value: "90days", label: "直近3ヶ月" },
];

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 現在のURLからrangeパラメータを取得（なければ 'all'）
  const currentRange = (searchParams.get("range") as DateRangeOption) || "all";

  const handleRangeChange = (range: DateRangeOption) => {
    const params = new URLSearchParams(searchParams);
    if (range === "all") {
      params.delete("range"); // 'all'の場合はURLをすっきりさせるためにパラメータを消す
    } else {
      params.set("range", range);
    }

    // URLを更新する（これによりServer Componentが再レンダリングされ、新しいデータをフェッチします）
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-fit">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => handleRangeChange(option.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
            currentRange === option.value
              ? "bg-gray-900 text-white shadow"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
