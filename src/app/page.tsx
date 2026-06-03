import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">
        ヘッダーのボタンからログインしてください。
      </p>
    </div>
  );
}
