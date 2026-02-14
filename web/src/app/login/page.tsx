"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const signInWithGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setStatus(error.message);
  };

  const signInWithEmail = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? error.message : "メールを送信しました。");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">ログイン</h1>
      <p className="mb-4 text-sm text-slate-600">メールリンクまたはGoogleでログインします。</p>
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="w-full rounded bg-slate-800 px-3 py-2 text-white" onClick={signInWithEmail}>
          メールリンクでログイン
        </button>
        <button className="w-full rounded border border-slate-300 px-3 py-2" onClick={signInWithGoogle}>
          Googleでログイン
        </button>
        <p className="text-sm text-slate-600">{status}</p>
      </div>
    </main>
  );
}
