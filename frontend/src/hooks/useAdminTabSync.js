import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * URL az igazság forrása: ?tab=reservations|courts
 * localStorage csak fallback/seed.
 */
export function useAdminTabSync(defaultTab = "reservations") {
  const [searchParams, setSearchParams] = useSearchParams();

  const sanitize = (v) => (v === "reservations" || v === "courts" || v === "tournaments" ? v : null);

  // Olvasás: URL -> localStorage -> default
  const urlTab = sanitize(searchParams.get("tab"));
  const stored = sanitize(typeof window !== "undefined" ? localStorage.getItem("admin.activeTab") : null);
  const activeTab = urlTab || stored || defaultTab;

  // Ha nincs ?tab az URL-ben, seedeljük (replace, hogy ne szemeteljünk a history-ba)
  useEffect(() => {
    if (!urlTab) {
      const sp = new URLSearchParams(searchParams);
      sp.set("tab", activeTab);
      setSearchParams(sp, { replace: true });
    }
  }, [urlTab, activeTab, searchParams, setSearchParams]);

  // Mindig tartsuk szinkronban a localStorage-t az épp aktív tabbal
  useEffect(() => {
    try {
      localStorage.setItem("admin.activeTab", activeTab);
    } catch {}
  }, [activeTab]);

  // Írás: csak az URL-t (és LS-t) írjuk — nincs setState
  const setActiveTab = (next) => {
    const nextTab = sanitize(next) || defaultTab;
    const sp = new URLSearchParams(searchParams);
    sp.set("tab", nextTab);
    setSearchParams(sp, { replace: true });
    try {
      localStorage.setItem("admin.activeTab", nextTab);
    } catch {}
  };

  return { activeTab, setActiveTab };
}
