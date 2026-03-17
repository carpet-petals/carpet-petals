import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { getProductById, submitContactForm } from "../services/api";
import type { Product } from "../types";
import SEOHead from "../components/SEOHead";

function EnquiryForm({ productTitle }: { productTitle: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: `Hi, I am interested in "${productTitle}" and would like to know more.`,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setStatus("sending");
    try {
      await submitContactForm(form);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const waMessage = encodeURIComponent(`Hi, I am interested in "${productTitle}" and would like to know more.`);

  return (
    <div className="border border-border bg-surface p-5 mt-6">
      <h3 className="font-display text-base font-semibold text-text-primary mb-4">Enquire About This Carpet</h3>

      
      <a  href={`https://wa.me/91XXXXXXXXXX?text=${waMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 text-sm font-medium hover:bg-[#1ebe5d] transition-colors mb-5"
      >
        <MessageCircle size={16} />
        Quick Enquiry on WhatsApp
      </a>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-muted">or send a message</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {status === "success" ? (
        <div className="bg-accent-light border border-accent/20 px-4 py-3 text-sm text-accent text-center">
          Enquiry sent. We will contact you shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3} className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
          {status === "error" && (
            <p className="text-xs text-red-500">Something went wrong. Please try WhatsApp instead.</p>
          )}
          <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
            <Send size={14} />
            {status === "sending" ? "Sending..." : "Send Enquiry"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="pt-24 pb-20 container-max px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-surface animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-surface animate-pulse w-3/4" />
            <div className="h-4 bg-surface animate-pulse w-1/2" />
            <div className="h-32 bg-surface animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-20 text-center">
        <p className="text-text-muted">Product not found.</p>
        <Link to="/collections" className="btn-primary mt-6 inline-flex">Back to Collections</Link>
      </div>
    );
  }

  const categorySlug = typeof product.category === "object" ? product.category.slug : "";
  const categoryName = typeof product.category === "object" ? product.category.name : "Carpet";

  return (
    <>
      <SEOHead
        title={product.seo?.metaTitle || product.title}
        description={product.seo?.metaDescription || product.description}
      />
      <div className="pt-24 pb-20 bg-background">
        <div className="container-max px-4 sm:px-6 lg:px-8">

          <Link to={`/collections/${categorySlug}`} className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-10">
            <ArrowLeft size={15} />
            Back to Collection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            <div>
              <div className="aspect-square overflow-hidden bg-surface mb-3">
                {product.images?.[activeImage] ? (
                  <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-text-muted text-sm">No image</span>
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 overflow-hidden border-2 transition-colors ${activeImage === i ? "border-accent" : "border-border"}`}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">{categoryName}</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-text-primary mb-6">
                {product.title}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-6 p-5 bg-surface border border-border">
                {product.material && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Material</p>
                    <p className="text-sm font-medium text-text-primary">{product.material}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Dimensions</p>
                    <p className="text-sm font-medium text-text-primary">{product.dimensions}</p>
                  </div>
                )}
                {product.subcategory && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Type</p>
                    <p className="text-sm font-medium text-text-primary">{product.subcategory}</p>
                  </div>
                )}
              </div>

              {product.description && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-3">About this Carpet</p>
                  <p className="text-text-secondary leading-relaxed">{product.description}</p>
                </div>
              )}

              <EnquiryForm productTitle={product.title} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}