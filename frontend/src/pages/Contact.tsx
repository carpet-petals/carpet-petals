import { useState, useEffect, useRef } from "react";
import { Phone, Mail, MapPin, MessageCircle, Upload, X, Package, FolderOpen } from "lucide-react";
import { getContactContent, getCategories, getProducts } from "../services/api";
import api from "../services/api";
import type { ContactContent, Category, Product } from "../types";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function Contact() {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", email: "", phone: "", message: "" });
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; title: string }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<{ id: string; name: string }[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getContactContent().then((res) => setContent(res.data.data)).catch(() => {});
    getCategories().then((res) => setCategories(res.data.data)).catch(() => {});
    getProducts().then((res) => setProducts(res.data.data)).catch(() => {});
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  function toggleProduct(product: Product) {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.id === product._id);
      if (exists) return prev.filter((p) => p.id !== product._id);
      return [...prev, { id: product._id, title: product.title }];
    });
  }

  function toggleCategory(category: Category) {
    setSelectedCategories((prev) => {
      const exists = prev.find((c) => c.id === category._id);
      if (exists) return prev.filter((c) => c.id !== category._id);
      return [...prev, { id: category._id, name: category.name }];
    });
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload/attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAttachments((p) => [...p, res.data.data.url]);
    } catch {
      alert("File upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAttachment(index: number) {
    setAttachments((p) => p.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setStatus("sending");
    try {
      await api.post("/contact", {
        ...form,
        attachments,
        selectedProducts,
        selectedCategories,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
      setSelectedProducts([]);
      setSelectedCategories([]);
      setAttachments([]);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8">

        <div className="mb-14 max-w-xl">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Contact</p>
          <h1 className="section-title mb-4">Get in Touch</h1>
          <p className="text-text-secondary leading-relaxed">
            Reach out for bulk enquiries, export orders, or any questions about our carpets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Contact Info */}
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary mb-6">Our Details</h2>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-light flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Phone</p>
                  <a href={`tel:${content?.phone || ""}`} className="text-sm text-text-primary hover:text-accent transition-colors">
                    {content?.phone || "+91 XXXXX XXXXX"}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-light flex items-center justify-center shrink-0">
                  <MessageCircle size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${content?.whatsapp || "91XXXXXXXXXX"}`} target="_blank" rel="noopener noreferrer" className="text-sm text-text-primary hover:text-accent transition-colors">
                    Chat on WhatsApp
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-light flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Email</p>
                  <a href={`mailto:${content?.email || ""}`} className="text-sm text-text-primary hover:text-accent transition-colors">
                    {content?.email || "info@carpetpetals.com"}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-light flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Address</p>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {content?.address || "Plot No. D-1, Small Industrial Estate, Chandpur, Varanasi, UP 221106, India"}
                  </p>
                </div>
              </li>
            </ul>

            {content?.mapEmbedUrl && (
              <div className="mt-8 aspect-video overflow-hidden border border-border">
                <iframe src={content.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Carpet Petals Location" />
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary mb-6">Send a Message</h2>

            {status === "success" ? (
              <div className="bg-accent-light border border-accent/20 px-6 py-8 text-center">
                <p className="font-display text-xl text-accent mb-2">Message Sent</p>
                <p className="text-sm text-text-secondary">Thank you for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="w-full bg-surface border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Phone</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full bg-surface border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="w-full bg-surface border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors" />
                </div>

                {/* Category Selection */}
                {categories.length > 0 && (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                      <FolderOpen size={12} className="inline mr-1" />
                      Interested Categories (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const selected = selectedCategories.some((c) => c.id === cat._id);
                        return (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className={`text-xs px-3 py-1.5 border transition-colors ${selected ? "bg-accent text-white border-accent" : "bg-surface border-border text-text-secondary hover:border-accent hover:text-accent"}`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Selection */}
                {products.length > 0 && (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
                      <Package size={12} className="inline mr-1" />
                      Interested Products (Optional)
                    </label>
                    <div className="max-h-36 overflow-y-auto border border-border bg-surface p-2 space-y-1">
                      {products.map((product) => {
                        const selected = selectedProducts.some((p) => p.id === product._id);
                        return (
                          <button
                            key={product._id}
                            type="button"
                            onClick={() => toggleProduct(product)}
                            className={`w-full text-left text-xs px-3 py-2 transition-colors ${selected ? "bg-accent text-white" : "hover:bg-background text-text-secondary"}`}
                          >
                            {product.title}
                            {typeof product.category === "object" && product.category?.name && (
                              <span className="ml-2 opacity-60">— {product.category.name}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedProducts.length > 0 && (
                      <p className="text-xs text-accent mt-1">{selectedProducts.length} product(s) selected</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell us about your requirements..." className="w-full bg-surface border border-border px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none" />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Attachments (Optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs bg-accent-light text-accent px-3 py-1.5 border border-accent/20">
                        <span>File {i + 1}</span>
                        <button type="button" onClick={() => removeAttachment(i)} className="hover:text-red-500 transition-colors">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 text-sm text-text-secondary border border-dashed border-border px-4 py-2.5 hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
                  >
                    <Upload size={15} />
                    {uploading ? "Uploading..." : "Upload Image or PDF"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                  <p className="text-xs text-text-muted mt-1">Max 10MB per file. JPG, PNG, WEBP or PDF.</p>
                </div>

                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    Something went wrong. Please try calling us directly.
                  </div>
                )}

                <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}