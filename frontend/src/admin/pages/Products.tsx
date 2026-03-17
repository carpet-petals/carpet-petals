import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import { getProducts, getCategories } from "../../services/api";
import type { Product, Category } from "../../types";
import MultiImageUploader from "../components/MultiImageUploader";

interface PForm {
  title: string;
  category: string;
  subcategory: string;
  description: string;
  material: string;
  dimensions: string;
  images: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

const empty: PForm = {
  title: "", category: "", subcategory: "", description: "",
  material: "", dimensions: "", images: [], featured: false,
  seoTitle: "", seoDescription: "",
};

function getCategoryName(category: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "object" && category !== null) return category.name || "";
  return "";
}

function getCategoryId(category: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "object" && category !== null) return category._id || "";
  return "";
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<PForm>(empty);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [pr, cr] = await Promise.all([getProducts(), getCategories()]);
      setProducts(pr.data.data || []);
      setCategories(cr.data.data || []);
    } catch {
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selectedCat = categories.find((c) => c._id === form.category);
  const hasSubcategories = Array.isArray(selectedCat?.subcategories) && selectedCat.subcategories.length > 0;

  function openAdd() {
    setForm(empty);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(p: Product) {
    setForm({
      title: p.title || "",
      category: getCategoryId(p.category),
      subcategory: p.subcategory || "",
      description: p.description || "",
      material: p.material || "",
      dimensions: p.dimensions || "",
      images: Array.isArray(p.images) ? p.images : [],
      featured: p.featured || false,
      seoTitle: p.seo?.metaTitle || "",
      seoDescription: p.seo?.metaDescription || "",
    });
    setEditId(p._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!form.title.trim()) return alert("Title is required.");
    if (!form.category) return alert("Category is required.");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        subcategory: form.subcategory,
        description: form.description,
        material: form.material,
        dimensions: form.dimensions,
        images: form.images,
        featured: form.featured,
        seo: {
          metaTitle: form.seoTitle,
          metaDescription: form.seoDescription,
        },
      };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm(empty);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error saving product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      alert("Failed to delete product.");
    }
  }

  function field(key: keyof PForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 bg-surface animate-pulse w-48 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-surface animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Products</h1>
          <p className="text-sm text-text-muted mt-1">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border p-6 mb-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">{editId ? "Edit Product" : "New Product"}</h2>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}
              className="text-text-muted hover:text-text-primary transition-colors text-sm"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Title *</label>
              <input
                value={form.title}
                onChange={field("title")}
                placeholder="e.g. Persian Heritage Rug"
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, subcategory: "" }))}
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {hasSubcategories && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Subcategory</label>
                <select
                  value={form.subcategory}
                  onChange={field("subcategory")}
                  className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select subcategory</option>
                  {selectedCat!.subcategories.map((s) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Material</label>
              <input
                value={form.material}
                onChange={field("material")}
                placeholder="e.g. Pure Wool"
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Dimensions</label>
              <input
                value={form.dimensions}
                onChange={field("dimensions")}
                placeholder="e.g. Custom sizes available"
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={field("description")}
              rows={4}
              placeholder="Describe this carpet..."
              className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <MultiImageUploader
            values={form.images}
            onChange={(urls) => setForm((p) => ({ ...p, images: urls }))}
          />

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              className="accent-accent w-4 h-4"
            />
            <span className="text-sm text-text-secondary">Mark as Featured (shown on homepage)</span>
          </label>

          <div className="border-t border-border pt-5 space-y-3">
            <p className="text-xs uppercase tracking-widest text-text-muted">SEO Settings (Optional)</p>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Meta Title</label>
              <input
                value={form.seoTitle}
                onChange={field("seoTitle")}
                placeholder="Leave blank to use product title"
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <p className="text-[11px] text-text-muted mt-1">{form.seoTitle.length}/60 characters recommended</p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Meta Description</label>
              <textarea
                value={form.seoDescription}
                onChange={field("seoDescription")}
                rows={2}
                placeholder="Leave blank to use product description"
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
              />
              <p className="text-[11px] text-text-muted mt-1">{form.seoDescription.length}/160 characters recommended</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <button onClick={save} disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
              {saving ? "Saving..." : editId ? "Update Product" : "Create Product"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}
              className="text-sm text-text-secondary hover:text-text-primary px-4 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border">
            <p className="text-text-muted text-sm mb-3">No products yet.</p>
            <button onClick={openAdd} className="btn-primary text-sm px-5 py-2">
              <Plus size={15} /> Add First Product
            </button>
          </div>
        )}
        {products.map((p) => {
          const catName = getCategoryName(p.category);
          return (
            <div key={p._id} className="bg-white border border-border p-4 flex items-center gap-4">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.title} className="w-16 h-16 object-cover border border-border shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-surface border border-border shrink-0 flex items-center justify-center">
                  <span className="text-text-muted text-[10px] text-center leading-tight px-1">No image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{p.title}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {catName
                    ? catName + (p.subcategory ? " · " + p.subcategory : "")
                    : <span className="text-red-400">Category deleted — reassign or delete</span>
                  }
                </p>
                {p.material && <p className="text-xs text-text-muted">{p.material}</p>}
                {p.seo?.metaTitle && <p className="text-[11px] text-blue-400 mt-0.5">SEO: {p.seo.metaTitle}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.featured && (
                  <span className="text-[10px] bg-accent-light text-accent px-2 py-1 uppercase tracking-wide">Featured</span>
                )}
                <button onClick={() => openEdit(p)} className="p-2 text-text-muted hover:text-accent transition-colors" title="Edit">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(p._id)} className="p-2 text-text-muted hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}