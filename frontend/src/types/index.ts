export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
}

export interface SeoFields {
  metaTitle: string;
  metaDescription: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  order: number;
  subcategories: Subcategory[];
  seo: SeoFields;
  createdAt: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  subcategory: string;
  description: string;
  material: string;
  dimensions: string;
  images: string[];
  featured: boolean;
  seo: SeoFields;
  createdAt: string;
  updatedAt: string;
}

export interface HeroContent {
  backgroundImage: string;
  tagline: string;
  subtext: string;
}

export interface AboutContent {
  image: string;
  headline: string;
  body: string;
  established: string;
  location: string;
}

export interface PaymentContent {
  upi: string;
  upiQrImage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  disclaimer: string;
}

export interface ContactContent {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}