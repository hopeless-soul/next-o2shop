export type NavCategory = {
  slug: string;
  displayName: string;
  href: string;
  subCategories: NavSubCategory[];
};

export type NavSubCategory = {
  slug: string;
  displayName: string;
  href: string;
};

/* Hardcoded navigation categories ────────────────────────────────────────── */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    slug: "all",
    displayName: "All",
    href: "/products",
    subCategories: [],
  },
  {
    slug: "sale",
    displayName: "Sale",
    href: "/products?sale=true",
    subCategories: [],
  },
  {
    slug: "tops",
    displayName: "Tops",
    href: "/products?category=tops",
    subCategories: [
      { slug: "tees", displayName: "Tees", href: "/products?subcategory=tees" },
      { slug: "hoodies", displayName: "Hoodies",  href: "/products?subcategory=hoodies" },
      { slug: "shirts", displayName: "Shirts",  href: "/products?subcategory=shirts" },
      { slug: "jackets", displayName: "Jackets",  href: "/products?subcategory=jackets" },
    ],
  },
  {
    slug: "bottoms",
    displayName: "Bottoms",
    href: "/products?category=bottoms",
    subCategories: [
    ],
  },
  {
    slug: "accessories",
    displayName: "Accessories",
    href: "/products?category=accessories",
    subCategories: [
      { slug: "hats", displayName: "Hats", href: "/products?subcategory=hats" },
      { slug: "bags", displayName: "Bags",  href: "/products?subcategory=bags" },
      { slug: "jewellery", displayName: "Jewellery",  href: "/products?subcategory=jewellery" },
    ],  
  },
];
