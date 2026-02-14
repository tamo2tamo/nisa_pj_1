"use client";

import { useState } from "react";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [callbackError, setCallbackError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackError(params.get("error") ?? "");
  }, []);

  const applyStatus = (message: string) => setStatus(message);

  const signUpWithEmailPassword = async () => {
    if (!email || !password) return applyStatus("メールアドレスとパスワードを入力してください。");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    applyStatus(error ? error.message : "新規登録を受け付けました。確認メールを開いてください。");
  };

  const signInWithEmailPassword = async () => {
    if (!email || !password) return applyStatus("メールアドレスとパスワードを入力してください。");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return applyStatus(error.message);
    window.location.href = "/";
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) applyStatus(error.message);
  };

  const signInWithEmail = async () => {
    if (!email) return applyStatus("メールアドレスを入力してください。");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    applyStatus(error ? error.message : "メールリンクを送信しました。");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">ログイン</h1>
      <p className="mb-4 text-sm text-slate-600">
        新規登録（メール+パスワード）と、ログイン（メール/Google）に対応しています。
      </p>
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        {callbackError && <p className="rounded bg-rose-50 p-2 text-sm text-rose-700">{callbackError}</p>}
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full rounded bg-slate-800 px-3 py-2 text-white" onClick={signUpWithEmailPassword} disabled={loading}>
          新規登録（メール+パスワード）
        </button>
        <button className="w-full rounded bg-slate-700 px-3 py-2 text-white" onClick={signInWithEmailPassword} disabled={loading}>
          ログイン（メール+パスワード）
        </button>
        <button className="w-full rounded border border-slate-300 px-3 py-2" onClick={signInWithEmail} disabled={loading}>
          メールリンクでログイン
        </button>
        <button className="w-full rounded border border-slate-300 px-3 py-2" onClick={signInWithGoogle} disabled={loading}>
          Googleでログイン
        </button>
        <p className="text-sm text-slate-600">{loading ? "処理中..." : status}</p>
      </div>
    </main>
  );
}
