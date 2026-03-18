import axios from "axios";
import type {
  Product, Category, HeroContent, AboutContent,
  PaymentContent, ContactContent, ContactFormData, ApiResponse,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 3000): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    const isTimeout =
      axios.isAxiosError(err) &&
      (err.code === "ECONNABORTED" || err.message?.includes("timeout"));

    if (retries > 0 && isTimeout) {
      await new Promise((res) => setTimeout(res, delayMs));
      return withRetry(fn, retries - 1, delayMs);
    }
    throw err;
  }
}

export const getProducts = (categorySlug?: string, subcategory?: string) =>
  withRetry(() =>
    api.get<ApiResponse<Product[]>>("/products", {
      params: {
        ...(categorySlug && { category: categorySlug }),
        ...(subcategory && { subcategory }),
      },
    })
  );

export const getProductById = (id: string) =>
  withRetry(() => api.get<ApiResponse<Product>>(`/products/${id}`));

export const getFeaturedProducts = () =>
  withRetry(() =>
    api.get<ApiResponse<Product[]>>("/products", { params: { featured: true } })
  );

export const getCategories = () =>
  withRetry(() => api.get<ApiResponse<Category[]>>("/categories"));

export const getHeroContent = () =>
  withRetry(() => api.get<ApiResponse<HeroContent>>("/content/hero"));

export const getAboutContent = () =>
  withRetry(() => api.get<ApiResponse<AboutContent>>("/content/about"));

export const getPaymentContent = () =>
  withRetry(() => api.get<ApiResponse<PaymentContent>>("/content/payment"));

export const getContactContent = () =>
  withRetry(() => api.get<ApiResponse<ContactContent>>("/content/contact"));

export const submitContactForm = (data: ContactFormData) =>
  api.post<ApiResponse<null>>("/contact", data);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return api.post<ApiResponse<{ url: string }>>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
};

export default api;