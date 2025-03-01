import { useMessages } from "next-intl";

import { MainNavItem, SidebarNavItem } from "@/types/nav";

// Hook to retrieve navigation translations from translation files
export function useNavigationTranslations() {
  const messages = useMessages();
  // Type assertion with fallback for better type safety
  const nav =
    (messages.Navigation as {
      main?: MainNavItem[];
      sidebar?: SidebarNavItem[];
    }) || {};

  return {
    mainNav: nav.main || [],
    sidebarNav: nav.sidebar || [],
  };
}
