import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";
import { getCategories } from "../../services/api";
import type { Category } from "../../types";
import ImageUploader from "../components/ImageUploader";

interface SubForm { name: string }
interface CatForm { name: string; description: string; coverImage: string; order: number; subcategories: SubForm[] }

const empty: CatForm = { name: "", description: "", coverImage: "", order: 0, subcategories: [] };

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CatForm>(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await getCategories();
    setCategories(res.data.data);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(empty); setEditId(null); setShowForm(true); }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description, coverImage: cat.coverImage, order: cat.order, subcategories: cat.subcategories.map((s) => ({ name: s.name })) });
    setEditId(cat._id);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, form);
      } else {
        await api.post("/categories", form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error saving category");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    await api.delete(`/categories/${id}`);
    load();
  }

  function addSub() { setForm((p) => ({ ...p, subcategories: [...p.subcategories, { name: "" }] })); }
  function removeSub(i: number) { setForm((p) => ({ ...p, subcategories: p.subcategories.filter((_, idx) => idx !== i) })); }
  function updateSub(i: number, val: string) {
    setForm((p) => ({ ...p, subcategories: p.subcategories.map((s, idx) => idx === i ? { name: val } : s) }));
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Categories</h1>
        <button onClick={openAdd} className="btn-primary text-sm px-4 py-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface border border-border p-6 mb-8 space-y-5">
          <h2 className="font-semibold text-text-primary">{editId ? "Edit Category" : "New Category"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Name *</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Display Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: +e.target.value }))} className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
          </div>
          <ImageUploader label="Cover Image" value={form.coverImage} onChange={(url) => setForm((p) => ({ ...p, coverImage: url }))} />

          {/* Subcategories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-text-muted">Subcategories</label>
              <button type="button" onClick={addSub} className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.subcategories.map((sub, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={sub.name} onChange={(e) => updateSub(i, e.target.value)} placeholder={`Subcategory ${i + 1}`} className="flex-1 bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:border-accent" />
                  <button type="button" onClick={() => removeSub(i)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving || !form.name} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
              {saving ? "Saving..." : "Save Category"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-text-secondary hover:text-text-primary transition-colors px-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-text-muted text-sm py-8 text-center">No categories yet. Add your first one.</p>
        )}
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white border border-border p-5 flex items-center gap-4">
            {cat.coverImage && (
              <img src={cat.coverImage} alt={cat.name} className="w-14 h-14 object-cover border border-border shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">{cat.name}</p>
              {cat.subcategories?.length > 0 && (
                <p className="text-xs text-text-muted mt-0.5">{cat.subcategories.map((s) => s.name).join(", ")}</p>
              )}
              {cat.description && <p className="text-sm text-text-secondary mt-1 truncate">{cat.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEdit(cat)} className="p-2 text-text-muted hover:text-accent transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(cat._id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}