export type Category = {
  name: string;
  slug: string;
  items: { name: string; slug: string }[];
};

export type ProductColor = {
  name: string;
  hex: string;
  available: boolean;
};

export type ProductSize = {
  label: string;
  available: boolean;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  originalPrice?: number;
  badge?: "sale" | "new" | "sold-out";
  colors: ProductColor[];
  sizes: ProductSize[];
  images: string[];
  description: string;
  details: string[];
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
};

export type OrderItem = {
  id: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "pending" | "refunded";

export type Order = {
  id: string;
  number: string;
  date: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
};

// ─── Categories ────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  {
    name: "Hats",
    slug: "hats",
    items: [
      { name: "Beanies", slug: "beanies" },
      { name: "Snapbacks", slug: "snapbacks" },
      { name: "Bucket Hats", slug: "bucket-hats" },
      { name: "Dad Caps", slug: "dad-caps" },
    ],
  },
  {
    name: "Shirts",
    slug: "shirts",
    items: [
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Long Sleeves", slug: "long-sleeves" },
      { name: "Hoodies", slug: "hoodies" },
      { name: "Jackets", slug: "jackets" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    items: [
      { name: "Bags", slug: "bags" },
      { name: "Socks", slug: "socks" },
      { name: "Pins & Patches", slug: "pins-patches" },
      { name: "Stickers", slug: "stickers" },
    ],
  },
  {
    name: "Sale",
    slug: "sale",
    items: [
      { name: "Hats on Sale", slug: "sale-hats" },
      { name: "Shirts on Sale", slug: "sale-shirts" },
      { name: "All Sale", slug: "sale-all" },
    ],
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "play-cool-beanie",
    title: "The Play Cool Beanie",
    type: "Beanie",
    price: 35,
    colors: [
      { name: "Black", hex: "#1e1e1e", available: true },
      { name: "Red", hex: "#e55151", available: true },
      { name: "White", hex: "#f5f5f5", available: true },
    ],
    sizes: [],
    images: [],
    description:
      "The signature beanie you didn't know you needed. Ribbed knit, one size fits most.",
    details: [
      "100% acrylic",
      "One size fits most",
      "Machine washable",
      "Ribbed cuff",
    ],
  },
  {
    id: "2",
    slug: "classic-snapback",
    title: "Classic Snapback",
    type: "Hat",
    price: 42,
    colors: [
      { name: "Black", hex: "#1e1e1e", available: true },
      { name: "Navy", hex: "#1a237e", available: true },
    ],
    sizes: [],
    images: [],
    description:
      "Structured flat brim snapback with embroidered logo.",
    details: [
      "100% cotton",
      "Structured 6-panel",
      "Flat brim",
      "Snapback closure",
    ],
  },
  {
    id: "3",
    slug: "og-logo-tee",
    title: "OG Logo T-Shirt",
    type: "T-Shirt",
    price: 28,
    badge: "new",
    colors: [
      { name: "White", hex: "#f5f5f5", available: true },
      { name: "Black", hex: "#1e1e1e", available: true },
      { name: "Grey", hex: "#9e9e9e", available: true },
    ],
    sizes: [
      { label: "XS", available: true },
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: false },
      { label: "2XL", available: false },
    ],
    images: [],
    description: "Heavy cotton boxy tee with screen-printed OG logo.",
    details: [
      "100% heavyweight cotton",
      "Boxy fit",
      "Screen printed graphic",
      "Reinforced collar",
    ],
  },
  {
    id: "4",
    slug: "heavyweight-hoodie",
    title: "Heavyweight Hoodie",
    type: "Hoodie",
    price: 65,
    colors: [
      { name: "Black", hex: "#1e1e1e", available: true },
      { name: "Charcoal", hex: "#616161", available: true },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: true },
      { label: "2XL", available: true },
    ],
    images: [],
    description: "16oz fleece pullover hoodie. Built to last.",
    details: [
      "60% cotton, 40% polyester",
      "16oz heavyweight fleece",
      "Kangaroo pocket",
      "Ribbed cuffs and hem",
    ],
  },
  {
    id: "5",
    slug: "canvas-bucket-hat",
    title: "Canvas Bucket Hat",
    type: "Hat",
    price: 38,
    colors: [
      { name: "Tan", hex: "#d2b48c", available: true },
      { name: "Black", hex: "#1e1e1e", available: true },
    ],
    sizes: [
      { label: "S/M", available: true },
      { label: "L/XL", available: true },
    ],
    images: [],
    description: "Washed canvas bucket hat with tonal stitching.",
    details: [
      "100% canvas",
      "Washed finish",
      "Embroidered logo",
      "Fully lined",
    ],
  },
  {
    id: "6",
    slug: "ribbed-beanie",
    title: "Fine Ribbed Beanie",
    type: "Beanie",
    price: 22,
    originalPrice: 28,
    badge: "sale",
    colors: [
      { name: "Brown", hex: "#795548", available: true },
      { name: "Cream", hex: "#f5f5dc", available: true },
    ],
    sizes: [],
    images: [],
    description: "Fine-gauge ribbed beanie with subtle logo detail.",
    details: [
      "80% merino wool, 20% nylon",
      "Fine-gauge knit",
      "One size",
      "Dry clean only",
    ],
  },
  {
    id: "7",
    slug: "washed-dad-cap",
    title: "Washed Dad Cap",
    type: "Hat",
    price: 32,
    colors: [
      { name: "Olive", hex: "#6b6b2c", available: true },
      { name: "Black", hex: "#1e1e1e", available: true },
    ],
    sizes: [],
    images: [],
    description: "Garment-washed soft-structured dad cap.",
    details: [
      "100% chino cotton",
      "Garment washed",
      "Unstructured",
      "Brass buckle closure",
    ],
  },
  {
    id: "8",
    slug: "archive-long-sleeve",
    title: "Archive Graphic Long Sleeve",
    type: "Long Sleeve",
    price: 45,
    colors: [
      { name: "White", hex: "#f5f5f5", available: true },
    ],
    sizes: [
      { label: "S", available: true },
      { label: "M", available: true },
      { label: "L", available: true },
      { label: "XL", available: false },
    ],
    images: [],
    description:
      "Archive graphic print on a heavyweight long sleeve tee.",
    details: [
      "100% heavyweight cotton",
      "Relaxed fit",
      "Water-based ink print",
      "Woven label",
    ],
  },
];

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Alex T.",
    rating: 5,
    date: "2025-03-12",
    text: "Exactly what I was looking for. Quality is solid and it shipped fast. The fit is true to size and the material feels premium.",
  },
  {
    id: "r2",
    author: "Jordan M.",
    rating: 4,
    date: "2025-02-28",
    text: "Love the design. Went with black and it goes with everything. Knocked one star because delivery took a bit longer than expected.",
  },
  {
    id: "r3",
    author: "Sam K.",
    rating: 5,
    date: "2025-02-14",
    text: "Third time buying from O2Shop. Never disappoints. The ribbed texture is super clean and the fit is perfect.",
  },
  {
    id: "r4",
    author: "Riley P.",
    rating: 4,
    date: "2025-01-30",
    text: "Great quality for the price. Looks even better in person than in the photos.",
  },
  {
    id: "r5",
    author: "Casey W.",
    rating: 3,
    date: "2025-01-15",
    text: "Decent product but ran slightly smaller than I expected. I'd recommend sizing up. Customer service was helpful though.",
  },
];

// ─── Addresses ────────────────────────────────────────────────────────────────

const ADDRESS_HOME: Address = {
  id: "addr1",
  label: "Home",
  firstName: "Alex",
  lastName: "Turner",
  line1: "123 Main Street",
  line2: "Apt 4B",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "United States",
};

const ADDRESS_WORK: Address = {
  id: "addr2",
  label: "Work",
  firstName: "Alex",
  lastName: "Turner",
  line1: "456 Broadway",
  city: "New York",
  state: "NY",
  zip: "10013",
  country: "United States",
};

export const MOCK_ADDRESSES: Address[] = [ADDRESS_HOME, ADDRESS_WORK];

// ─── Orders ───────────────────────────────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
  {
    id: "ord1",
    number: "COOL72871",
    date: "2025-03-15",
    paymentStatus: "paid",
    fulfillmentStatus: "delivered",
    items: [
      {
        id: "oi1",
        name: "The Play Cool Beanie",
        sku: "BEANIE-BLK-OS",
        color: "Black",
        size: "One Size",
        unitPrice: 35,
        quantity: 1,
      },
      {
        id: "oi2",
        name: "OG Logo T-Shirt",
        sku: "TEE-WHT-M",
        color: "White",
        size: "M",
        unitPrice: 28,
        quantity: 2,
      },
    ],
    subtotal: 91,
    shipping: 0,
    total: 91,
    shippingAddress: ADDRESS_HOME,
    billingAddress: ADDRESS_HOME,
  },
  {
    id: "ord2",
    number: "COOL71203",
    date: "2025-02-20",
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    items: [
      {
        id: "oi3",
        name: "Heavyweight Hoodie",
        sku: "HOOD-BLK-L",
        color: "Black",
        size: "L",
        unitPrice: 65,
        quantity: 1,
      },
    ],
    subtotal: 65,
    shipping: 8,
    total: 73,
    shippingAddress: ADDRESS_WORK,
    billingAddress: ADDRESS_HOME,
  },
  {
    id: "ord3",
    number: "COOL69487",
    date: "2025-01-05",
    paymentStatus: "refunded",
    fulfillmentStatus: "cancelled",
    items: [
      {
        id: "oi4",
        name: "Fine Ribbed Beanie",
        sku: "BEANIE-CRM-OS",
        color: "Cream",
        size: "One Size",
        unitPrice: 22,
        quantity: 1,
      },
    ],
    subtotal: 22,
    shipping: 8,
    total: 30,
    shippingAddress: ADDRESS_HOME,
    billingAddress: ADDRESS_HOME,
  },
];
