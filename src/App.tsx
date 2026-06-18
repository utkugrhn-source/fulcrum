import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { ArticleDetail } from "./pages/ArticleDetail";
import { Methodology } from "./pages/Methodology";
import { About } from "./pages/About";
import { SubspecialtyHome } from "./pages/SubspecialtyHome";
import { ReadingList } from "./pages/ReadingList";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-brass mt-10 bg-cream-2 dark:bg-navy-2">
      <div className="container-prose py-4 editorial text-[10.5px] tracking-[0.15em] text-ink dark:text-leaf flex flex-wrap items-center justify-between gap-2">
        <span>{t("footer.signature")}</span>
        <span>{t("footer.edition")}</span>
        <a
          href="https://github.com/utkugrhn-source/fulcrum"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blood transition-colors"
        >
          {t("footer.github")}
        </a>
        <span>{t("footer.data_source")}</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-cream dark:bg-navy">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/a/:pmid" element={<ArticleDetail />} />
          <Route path="/sub/:slug" element={<SubspecialtyHome />} />
          <Route path="/reading-list" element={<ReadingList />} />
          <Route path="/scoring" element={<Methodology />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
