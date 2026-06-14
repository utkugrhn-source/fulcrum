import { Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { ArticleDetail } from "./pages/ArticleDetail";

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border mt-12 py-8">
      <div className="container-prose text-xs text-fg-subtle flex flex-wrap items-center justify-between gap-2">
        <div>
          {t("footer.built_by")}{" "}
          <a href="https://cyprusorthopaedics.com" target="_blank" rel="noopener noreferrer"
             className="hover:text-fg transition-colors">utkugrhn</a>
          {" · "}
          {t("footer.inspired_by")}{" "}
          <a href="https://derinsoluk.com/pulse" target="_blank" rel="noopener noreferrer"
             className="hover:text-fg transition-colors">EM Pulse</a>
          {" · "}
          <a href="https://github.com/utkugrhn-source/fulcrum" target="_blank" rel="noopener noreferrer"
             className="hover:text-fg transition-colors">{t("footer.github")}</a>
        </div>
        <div>{t("footer.data_source")}</div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/a/:pmid" element={<ArticleDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
