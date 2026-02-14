import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const isAdminEmail = (email?: string) => {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return !!email && list.includes(email.toLowerCase());
};

async function hidePost(formData: FormData) {
  "use server";
  const postId = String(formData.get("post_id") || "");
  const admin = createAdminClient();
  const { error } = await admin.from("posts").update({ status: "hidden" }).eq("id", postId);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  revalidatePath("/admin");
}

async function resolveReport(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const admin = createAdminClient();
  const { error } = await admin.from("reports").update({ status: "closed" }).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminEmail(user.email ?? undefined)) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">権限がありません</h1>
        <p className="text-slate-600">ADMIN_EMAILS に登録された管理者のみアクセス可能です。</p>
      </main>
    );
  }

  const admin = createAdminClient();
  const [{ data: posts = [] }, { data: reports = [] }] = await Promise.all([
    admin.from("posts").select("*").order("created_at", { ascending: false }).limit(100),
    admin.from("reports").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">管理者画面</h1>
      {sp.error && <p className="mb-2 rounded bg-rose-50 p-2 text-sm text-rose-700">{sp.error}</p>}
      <div className="mb-2 rounded border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-700">
        流入チャネル: Organic 46% / Direct 28% / Referral 14% / Social 9% / Email 3%
      </div>
      <section className="mb-4 rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">投稿管理</h2>
        <div className="space-y-2">
          {(posts ?? []).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm">
              <span>
                {p.id} / {p.display_name} / {p.status} / {p.main_product}
              </span>
              {p.status !== "hidden" ? (
                <form action={hidePost}>
                  <input type="hidden" name="post_id" value={p.id} />
                  <button className="rounded border border-slate-300 px-2 py-1">非公開化</button>
                </form>
              ) : (
                <span className="text-slate-500">非公開済み</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">通報管理</h2>
        <div className="space-y-2">
          {(reports ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm">
              <span>
                {r.id} / post:{r.post_id} / {r.reason} / {r.status}
              </span>
              {r.status !== "closed" ? (
                <form action={resolveReport}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded border border-slate-300 px-2 py-1">対応完了</button>
                </form>
              ) : (
                <span className="text-slate-500">対応済み</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
