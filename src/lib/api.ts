import { supabase } from "./supabase";
import type { Article, Subspecialty } from "@/types";

export interface ListFilters {
  subspecialties?: string[];
  tiers?: number[];
  fromDate?: string;
  q?: string;
  limit?: number;
}

export async function listArticles(f: ListFilters = {}): Promise<Article[]> {
  if (!supabase) return [];
  let q = supabase.from("v_articles").select("*").order("score", { ascending: false }).limit(f.limit ?? 60);
  if (f.subspecialties?.length) q = q.in("subspecialty", f.subspecialties);
  if (f.tiers?.length) q = q.in("tier", f.tiers);
  if (f.fromDate) q = q.gte("pub_date", f.fromDate);
  if (f.q) q = q.textSearch("title", f.q, { type: "websearch", config: "english" });
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Article[];
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
