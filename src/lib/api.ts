import { supabase } from "./supabase";
import type { Article, Subspecialty } from "@/types";

export interface ListFilters {
  subspecialties?: string[];
  tiers?: number[];
  fromDate?: string;
  /** Exact entrez_date (YYYY-MM-DD) — used by the Archive page. */
  entrezDate?: string;
  q?: string;
  limit?: number;
}

export async function listArticles(f: ListFilters = {}): Promise<Article[]> {
  if (!supabase) return [];
  let q = supabase.from("v_articles").select("*").order("score", { ascending: false }).limit(f.limit ?? 60);
  if (f.subspecialties?.length) q = q.in("subspecialty", f.subspecialties);
  if (f.tiers?.length) q = q.in("tier", f.tiers);
  if (f.fromDate) q = q.gte("pub_date", f.fromDate);
  if (f.entrezDate) q = q.eq("entrez_date", f.entrezDate);
  if (f.q) q = q.textSearch("title", f.q, { type: "websearch", config: "english" });
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Article[];
}

/** Distinct entrez_dates that have at least one article — for the Archive index. */
export async function listArchiveDates(limit = 60): Promise<Array<{ date: string; count: number }>> {
  if (!supabase) return [];
  // PostgREST can't do GROUP BY directly. We fetch a slim projection and group client-side.
  const { data, error } = await supabase
    .from("v_articles")
    .select("entrez_date")
    .not("entrez_date", "is", null)
    .order("entrez_date", { ascending: false })
    .limit(2000);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of (data ?? []) as Array<{ entrez_date: string }>) {
    counts.set(r.entrez_date, (counts.get(r.entrez_date) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, limit)
    .map(([date, count]) => ({ date, count }));
}

export async function getArticle(pmid: string): Promise<Article | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("v_articles").select("*").eq("pmid", pmid).single();
  if (error) {
    if ((error as any).code === "PGRST116") return null;
    throw error;
  }
  return data as Article;
}

export async function listSubspecialties(): Promise<Subspecialty[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("subspecialties")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Subspecialty[];
}
