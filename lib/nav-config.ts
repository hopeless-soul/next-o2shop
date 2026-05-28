export type NavSubCategory = {
  slug: string;
  displayName: string;
  href: string;
};

export type NavCategory = {
  slug: string;
  displayName: string;
  href: string;
  subCategories: NavSubCategory[];
};

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
      { slug: "tshirts", displayName: "T-Shirts", href: "/products?category=tshirts" },
      { slug: "hoodies", displayName: "Hoodies",  href: "/products?category=hoodies" },
      { slug: "jackets", displayName: "Jackets",  href: "/products?category=jackets" },
    ],
  },
  {
    slug: "bottoms",
    displayName: "Bottoms",
    href: "/products?category=bottoms",
    subCategories: [
      { slug: "tshirts", displayName: "T-Shirts", href: "/products?category=tshirts" },
      { slug: "hoodies", displayName: "Hoodies",  href: "/products?category=hoodies" },
      { slug: "jackets", displayName: "Jackets",  href: "/products?category=jackets" },
    ],
  },
];
