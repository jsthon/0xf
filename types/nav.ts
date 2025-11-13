import { IconKey } from "@/components/icons";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: IconKey;
  intl?: string;
  keywords?: string[];
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export interface NavSection {
  title: string;
  slug: string;
  categories: NavCategory[];
}

export interface Navigations {
  headers: (NavItem & { slug: string })[];
  sections: NavSection[];
}
