import { useEffect, useState } from "react";
import { listArticles, type ListFilters } from "@/lib/api";
import type { Article } from "@/types";

export interface UseArticlesState {
  loading: boolean;
  articles: Article[];
  error: string | null;
}

export function useArticles(filters: ListFilters): UseArticlesState {
  const [state, setState] = useState<UseArticlesState>({
    loading: true,
    articles: [],
    error: null,
  });

  const key = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    listArticles(filters)
      .then((rows) => {
        if (cancelled) return;
        setState({ loading: false, articles: rows, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ loading: false, articles: [], error: err?.message ?? String(err) });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
