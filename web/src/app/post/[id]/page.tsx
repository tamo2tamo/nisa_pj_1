import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function reportPost(formData: FormData) {
  "use server";
  const postId = String(formData.get("post_id") || "");
  const reason = String(formData.get("reason") || "");
  const note = String(formData.get("note") || "");
  if (!postId || !reason) redirect(`/post/${postId}?error=入力不足`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("reports").insert({
    post_id: postId,
    reason,
    note,
    status: "open",
    reporter_user_id: user.id,
  });
  if (error) redirect(`/post/${postId}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  redirect(`/post/${postId}?success=通報を送信しました`);
}

export default async function PostDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();

  if (!post || post.status === "hidden") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">この投稿は非公開です</h1>
        <p className="text-slate-600">通報対応により閲覧できません。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="mb-4 inline-block text-sm text-slate-600">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-2xl font-bold">@{post.display_name} の運用投稿</h1>
      <p className="mt-1 text-sm text-slate-600">
        過去1年 <b>{post.perf_1y >= 0 ? "+" : ""}{post.perf_1y.toFixed(1)}%</b> / 開始来{" "}
        <b>{post.perf_since >= 0 ? "+" : ""}{post.perf_since.toFixed(1)}%</b>
      </p>
      <div className="mt-3 rounded border border-slate-200 bg-white p-4">
        <p>主分類: {post.main_product}</p>
        <p>副分類: {post.sub_product}</p>
        <p>投資/現金: {post.invest_ratio} / {post.cash_ratio}</p>
        <p className="mt-2 text-slate-700">{post.note}</p>
      </div>

      {sp.error && <p className="mt-3 rounded bg-rose-50 p-2 text-sm text-rose-700">{sp.error}</p>}
      {sp.success && <p className="mt-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{sp.success}</p>}

      <form action={reportPost} className="mt-4 rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-2 font-semibold">通報</h2>
        <input type="hidden" name="post_id" value={id} />
        <select name="reason" className="mb-2 w-full rounded border border-slate-300 px-3 py-2">
          <option>誹謗中傷</option>
          <option>宣伝/勧誘</option>
          <option>詐欺疑い</option>
          <option>不適切な内容</option>
        </select>
        <textarea name="note" rows={3} maxLength={200} className="mb-2 w-full rounded border border-slate-300 px-3 py-2" />
        <button className="rounded bg-slate-900 px-3 py-2 text-white">通報を送信</button>
      </form>
    </main>
  );
}
