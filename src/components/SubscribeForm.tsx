import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Check, AlertCircle, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "ok" | "error";

export function SubscribeForm({ variant = "inline" }: { variant?: "inline" | "block" }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("tr") ? "tr" : "en";

  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setState("error");
      setMsg(lang === "tr" ? "Geçerli bir e-posta gerek." : "Enter a valid email.");
      return;
    }
    setState("loading");
    setMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, lang }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setState("error");
        setMsg(lang === "tr" ? "Şu an gönderilemedi." : "Couldn't send right now.");
        return;
      }
      setState("ok");
      setMsg(lang === "tr"
        ? "Gelen kutunu kontrol et — onay bağlantısı yolda."
        : "Check your inbox — confirmation link is on its way.");
      setEmail("");
    } catch {
      setState("error");
      setMsg(lang === "tr" ? "Bağlantı hatası." : "Network error.");
    }
  }

  const inputCls = "flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-cream-2 dark:bg-navy-2 border border-divider/40 text-ink dark:text-cream placeholder:text-ink-2/60 dark:placeholder:text-leaf/60 text-base focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass";
  const btnCls   = "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brass text-cream font-semibold text-sm hover:bg-brass-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  if (state === "ok") {
    return (
      <div className={`flex items-start gap-2 text-sm ${variant === "block" ? "p-4 rounded-xl bg-cream-2 dark:bg-navy-2 border border-divider/30" : ""}`}>
        <Check size={18} className="text-success shrink-0 mt-0.5" />
        <span className="text-ink dark:text-cream/90">{msg}</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`w-full ${variant === "block" ? "" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Mail size={16} className="text-ink-2 dark:text-leaf hidden sm:block" aria-hidden />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state !== "idle") { setState("idle"); setMsg(null); } }}
          placeholder={lang === "tr" ? "e-posta@örnek.com" : "you@example.com"}
          className={inputCls}
          aria-label={lang === "tr" ? "E-posta" : "Email address"}
          disabled={state === "loading"}
        />
        <button type="submit" disabled={state === "loading"} className={btnCls}>
          {state === "loading"
            ? <Loader2 size={14} className="animate-spin" />
            : null}
          {lang === "tr" ? "ABONE OL" : "SUBSCRIBE"}
        </button>
      </div>
      {state === "error" && msg && (
        <div className="mt-2 flex items-start gap-1.5 text-sm text-blood">
          <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden />
          <span>{msg}</span>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-2 dark:text-leaf/80 leading-relaxed">
        {lang === "tr"
          ? t("subscribe.notice")
          : t("subscribe.notice")}
      </p>
    </form>
  );
}
