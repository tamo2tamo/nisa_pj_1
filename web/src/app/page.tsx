import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  AGE_OPTIONS,
  EXPERIENCE_OPTIONS,
  FAMILY_OPTIONS,
  HOUSING_OPTIONS,
  INCOME_OPTIONS,
  NG_WORDS,
  NISA_OPTIONS,
  OCCUPATION_OPTIONS,
  POLICY_OPTIONS,
  PRODUCT_OPTIONS,
  RATIO_OPTIONS,
  RISK_OPTIONS,
  parseRatio,
} from "@/lib/domain";
import { calculateMatchScore, TOTAL_MATCH_POINTS } from "@/lib/match";
import { createClient } from "@/lib/supabase/server";

const postSchema = z.object({
  display_name: z.string().min(1).max(20),
  age: z.string(),
  family: z.string(),
  housing: z.string(),
  occupation: z.string(),
  income: z.string(),
  experience: z.string(),
  nisa: z.string(),
  risk: z.string(),
  policy: z.string(),
  main_product: z.string(),
  sub_product: z.string(),
  ratio: z.string(),
  perf_1y: z.coerce.number().min(-1000).max(1000),
  perf_since: z.coerce.number().min(-1000).max(1000),
  note: z.string().min(1).max(200),
});

const hasForbidden = (note: string) =>
  /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|jp|org))/i.test(note) ||
  NG_WORDS.some((w) => note.toLowerCase().includes(w.toLowerCase()));

async function createPost(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = postSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/?error=入力内容を確認してください");
  if (hasForbidden(parsed.data.note)) redirect("/?error=NGワードまたはURLを検知しました");

  const ratio = parseRatio(parsed.data.ratio);
  const payload = {
    ...parsed.data,
    invest_ratio: ratio.invest,
    cash_ratio: ratio.cash,
    status: "published",
    user_id: user.id,
  };
  const { error } = await supabase.from("posts").insert(payload);
  if (error) redirect(`/?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/");
  redirect("/?success=投稿を公開しました");
}

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const option = (values: readonly string[]) => values.map((v) => <option key={v}>{v}</option>);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const filters = {
    age: params.age,
    occupation: params.occupation,
    income: params.income,
    experience: params.experience,
    nisa: params.nisa,
    risk: params.risk,
    policy: params.policy,
    main_product: params.main_product,
    sub_product: params.sub_product,
    ratio: params.ratio,
  };

  let query = supabase.from("posts").select("*").eq("status", "published").order("created_at", { ascending: false });
  if (filters.age) query = query.eq("age", filters.age);
  if (filters.occupation) query = query.eq("occupation", filters.occupation);
  if (filters.income) query = query.eq("income", filters.income);
  if (filters.experience) query = query.eq("experience", filters.experience);
  if (filters.nisa) query = query.eq("nisa", filters.nisa);
  if (filters.risk) query = query.eq("risk", filters.risk);
  if (filters.policy) query = query.eq("policy", filters.policy);
  if (filters.main_product) query = query.eq("main_product", filters.main_product);
  if (filters.sub_product) query = query.eq("sub_product", filters.sub_product);
  if (filters.ratio) {
    const ratio = parseRatio(filters.ratio);
    query = query.eq("invest_ratio", ratio.invest).eq("cash_ratio", ratio.cash);
  }

  const { data: posts = [] } = await query;
  const scored = (posts ?? [])
    .map((p) => ({ ...p, score: calculateMatchScore(p as never, filters) }))
    .sort((a, b) => b.score - a.score || b.perf_1y - a.perf_1y);

  return (
    <main className="mx-auto max-w-7xl p-5">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">NISA運用者 匿名投稿</h1>
        <div className="flex gap-2">
          {user ? (
            <>
              <a href="#submit" className="rounded border border-slate-300 px-3 py-2 text-sm">
                投稿
              </a>
              <a href="/admin" className="rounded border border-slate-300 px-3 py-2 text-sm">
                管理者
              </a>
              <form action={signOut}>
                <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">ログアウト</button>
              </form>
            </>
          ) : (
            <a href="/login" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
              ログイン
            </a>
          )}
        </div>
      </header>

      <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">近いケースを表示</h2>
        <p className="text-sm text-slate-600">人気順 / 投信する</p>
      </section>

      <section className="grid gap-4 md:grid-cols-[340px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 font-semibold">検索</h3>
          <form className="space-y-2">
            <select name="age" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">年代（すべて）</option>
              {option(AGE_OPTIONS)}
            </select>
            <select name="occupation" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">職業（すべて）</option>
              {option(OCCUPATION_OPTIONS)}
            </select>
            <select name="income" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">年収帯（すべて）</option>
              {option(INCOME_OPTIONS)}
            </select>
            <select name="experience" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">投資歴（すべて）</option>
              {option(EXPERIENCE_OPTIONS)}
            </select>
            <select name="nisa" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">NISA（すべて）</option>
              {option(NISA_OPTIONS)}
            </select>
            <select name="risk" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">リスク許容度（すべて）</option>
              {option(RISK_OPTIONS)}
            </select>
            <select name="policy" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">投資方針（すべて）</option>
              {option(POLICY_OPTIONS)}
            </select>
            <select name="main_product" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">主分類（すべて）</option>
              {option(PRODUCT_OPTIONS)}
            </select>
            <select name="sub_product" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">副分類（すべて）</option>
              {option(PRODUCT_OPTIONS)}
            </select>
            <select name="ratio" className="w-full rounded border border-slate-300 px-3 py-2">
              <option value="">投資/現金（すべて）</option>
              {option(RATIO_OPTIONS)}
            </select>
            <button className="w-full rounded bg-slate-900 px-3 py-2 text-white">近いケースを表示</button>
          </form>
        </aside>

        <div>
          <div className="mb-2 rounded border border-dashed border-sky-300 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            広告枠（一覧）
          </div>
          {params.error && <p className="mb-2 rounded bg-rose-50 p-2 text-sm text-rose-700">{params.error}</p>}
          {params.success && <p className="mb-2 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{params.success}</p>}
          <div className="space-y-3">
            {scored.map((post) => (
              <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-1 flex justify-between text-sm text-slate-600">
                  <span>
                    {post.age} / {post.occupation}
                  </span>
                  <span className="font-semibold text-emerald-700">
                    一致スコア {post.score}/{TOTAL_MATCH_POINTS}
                  </span>
                </div>
                <h3 className="font-semibold">{post.main_product} 中心の運用</h3>
                <p className="text-sm">
                  過去1年 <b>{post.perf_1y >= 0 ? "+" : ""}{post.perf_1y.toFixed(1)}%</b> / 開始来{" "}
                  <b>{post.perf_since >= 0 ? "+" : ""}{post.perf_since.toFixed(1)}%</b>
                </p>
                <p className="mt-1 text-sm text-slate-600">{post.note}</p>
                <div className="mt-2 flex gap-2">
                  <a href={`/post/${post.id}`} className="rounded border border-slate-300 px-3 py-1 text-sm">
                    詳細を見る
                  </a>
                  <button className="rounded border border-slate-300 px-3 py-1 text-sm">参考になった</button>
                  <button className="rounded border border-slate-300 px-3 py-1 text-sm">共感した</button>
                  <button className="rounded border border-slate-300 px-3 py-1 text-sm">真似したい</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="submit" className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-2 text-lg font-semibold">投稿</h3>
        <form action={createPost} className="grid gap-2 md:grid-cols-3">
          <input name="display_name" placeholder="表示名" className="rounded border border-slate-300 px-3 py-2" />
          <select name="age" className="rounded border border-slate-300 px-3 py-2">{option(AGE_OPTIONS)}</select>
          <select name="family" className="rounded border border-slate-300 px-3 py-2">{option(FAMILY_OPTIONS)}</select>
          <select name="housing" className="rounded border border-slate-300 px-3 py-2">{option(HOUSING_OPTIONS)}</select>
          <select name="occupation" className="rounded border border-slate-300 px-3 py-2">{option(OCCUPATION_OPTIONS)}</select>
          <select name="income" className="rounded border border-slate-300 px-3 py-2">{option(INCOME_OPTIONS)}</select>
          <select name="experience" className="rounded border border-slate-300 px-3 py-2">{option(EXPERIENCE_OPTIONS)}</select>
          <select name="nisa" className="rounded border border-slate-300 px-3 py-2">{option(NISA_OPTIONS)}</select>
          <select name="risk" className="rounded border border-slate-300 px-3 py-2">{option(RISK_OPTIONS)}</select>
          <select name="policy" className="rounded border border-slate-300 px-3 py-2">{option(POLICY_OPTIONS)}</select>
          <select name="main_product" className="rounded border border-slate-300 px-3 py-2">{option(PRODUCT_OPTIONS)}</select>
          <select name="sub_product" className="rounded border border-slate-300 px-3 py-2">{option(PRODUCT_OPTIONS)}</select>
          <select name="ratio" className="rounded border border-slate-300 px-3 py-2">{option(RATIO_OPTIONS)}</select>
          <input name="perf_1y" type="number" min={-1000} max={1000} defaultValue={5} className="rounded border border-slate-300 px-3 py-2" />
          <input name="perf_since" type="number" min={-1000} max={1000} defaultValue={12} className="rounded border border-slate-300 px-3 py-2" />
          <textarea
            name="note"
            maxLength={200}
            rows={3}
            className="md:col-span-3 rounded border border-slate-300 px-3 py-2"
            placeholder="自由記述（200字以内）"
          />
          <button className="md:col-span-3 rounded bg-slate-900 px-3 py-2 text-white">投稿する（即時公開）</button>
        </form>
      </section>
    </main>
  );
}
