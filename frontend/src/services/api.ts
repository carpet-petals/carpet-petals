import axios from "axios";
import type {
  Product, Category, HeroContent, AboutContent,
  PaymentContent, ContactContent, ContactFormData, ApiResponse,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProducts = (categorySlug?: string, subcategory?: string) =>
  api.get<ApiResponse<Product[]>>("/products", {
    params: { ...(categorySlug && { category: categorySlug }), ...(subcategory && { subcategory }) },
  });

export const getProductById = (id: string) =>
  api.get<ApiResponse<Product>>(`/products/${id}`);

export const getFeaturedProducts = () =>
  api.get<ApiResponse<Product[]>>("/products", { params: { featured: true } });

export const getCategories = () =>
  api.get<ApiResponse<Category[]>>("/categories");

export const getHeroContent = () =>
  api.get<ApiResponse<HeroContent>>("/content/hero");

export const getAboutContent = () =>
  api.get<ApiResponse<AboutContent>>("/content/about");

export const getPaymentContent = () =>
  api.get<ApiResponse<PaymentContent>>("/content/payment");

export const getContactContent = () =>
  api.get<ApiResponse<ContactContent>>("/content/contact");

export const submitContactForm = (data: ContactFormData) =>
  api.post<ApiResponse<null>>("/contact", data);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post<ApiResponse<{ url: string }>>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;