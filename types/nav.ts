import { IconKey } from "@/components/icons";

export interface NavItem {
  title: string;
  href?: string;
  slug?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: IconKey;
  keywords?: string[];
}

export interface NavCategory extends NavItem {
  items: NavItem[];
}

export interface NavSection extends NavItem {
  categories: NavCategory[];
}

export interface Navigations {
  header: NavItem[];
  sections: NavSection[];
}
