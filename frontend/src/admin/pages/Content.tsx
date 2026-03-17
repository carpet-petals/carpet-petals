import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import ImageUploader from "../components/ImageUploader";

type Section = "hero" | "about" | "payment" | "contact" | "aboutus" | "faq";

const LABELS: Record<string, string> = {
  backgroundImage: "Hero Background Image",
  tagline: "Tagline",
  subtext: "Subtext",
  image: "About Section Image",
  headline: "Headline",
  body: "Body Text",
  upi: "UPI ID",
  upiQrImage: "UPI QR Code Image",
  bankName: "Bank Name",
  accountName: "Account Name",
  accountNumber: "Account Number",
  ifsc: "IFSC Code",
  phone: "Phone",
  whatsapp: "WhatsApp Number",
  email: "Email",
  address: "Address",
  mapEmbedUrl: "Google Maps Embed URL",
  instagramUrl: "Instagram URL",
  facebookUrl: "Facebook URL",
  title: "Title",
  content: "Content",
};

const IMAGE_KEYS = ["backgroundImage", "image", "upiQrImage"];
const TEXTAREA_KEYS = ["subtext", "body", "address", "mapEmbedUrl", "content"];

const SECTION_KEYS: Record<Section, string[]> = {
  hero: ["backgroundImage", "tagline", "subtext"],
  about: ["image", "headline", "body"],
  payment: ["upi", "upiQrImage", "bankName", "accountName", "accountNumber", "ifsc"],
  contact: ["phone", "whatsapp", "email", "address", "mapEmbedUrl", "instagramUrl", "facebookUrl"],
  aboutus: ["title", "content"],
  faq: [],
};

const TABS = [
  { key: "hero" as Section, label: "Hero" },
  { key: "about" as Section, label: "About Section" },
  { key: "payment" as Section, label: "Payment" },
  { key: "contact" as Section, label: "Contact" },
  { key: "aboutus" as Section, label: "About Us (Footer)" },
  { key: "faq" as Section, label: "FAQ" },
];

export default function Content() {
  const [section, setSection] = useState<Section>("hero");
  const [data, setData] = useState<Record<string, any>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadSection(s: Section) {
    setLoading(true);
    setEditing(false);
    setSaved(false);
    try {
      const res = await api.get(`/content/${s}`);
      setData(res.data.data);
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSection(section); }, [section]);

  async function save() {
    setSaving(true);
    try {
      await api.put(`/content/${section}`, data);
      setSaved(true);
      setEditing(false);
      await loadSection(section);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function f(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((p) => ({ ...p, [key]: e.target.value }));
  }

  // FAQ helpers
  function addFaq() {
    const items = [...(data.items || []), { question: "", answer: "" }];
    setData((p) => ({ ...p, items }));
  }

  function updateFaq(index: number, field: "question" | "answer", value: string) {
    const items = (data.items || []).map((item: any, i: number) =>
      i === index ? { ...item, [field]: value } : item
    );
    setData((p) => ({ ...p, items }));
  }

  function removeFaq(index: number) {
    const items = (data.items || []).filter((_: any, i: number) => i !== index);
    setData((p) => ({ ...p, items }));
  }

  function renderViewMode() {
    if (section === "faq") {
      return (
        <div className="space-y-4">
          {(data.items || []).length === 0 && (
            <p className="text-sm text-text-muted italic">No FAQs added yet.</p>
          )}
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border p-4">
              <p className="text-sm font-medium text-text-primary mb-1">{item.question}</p>
              <p className="text-sm text-text-secondary">{item.answer}</p>
            </div>
          ))}
        </div>
      );
    }

    if (section === "aboutus") {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Title</p>
            <p className="text-sm text-text-primary">{data.title || <span className="italic text-text-muted">Not set</span>}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">Content</p>
            <p className="text-sm text-text-primary leading-relaxed">{data.content || <span className="italic text-text-muted">Not set</span>}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {SECTION_KEYS[section].map((key) => (
          <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">{LABELS[key] || key}</p>
            {IMAGE_KEYS.includes(key) ? (
              data[key]
                ? <img src={data[key]} alt={key} className="w-32 h-32 object-cover border border-border" />
                : <p className="text-sm text-text-muted italic">No image set</p>
            ) : (
              <p className="text-sm text-text-primary leading-relaxed">
                {data[key] || <span className="text-text-muted italic">Not set</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderEditMode() {
    if (section === "faq") {
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">FAQ Items</h3>
            <button onClick={addFaq} type="button" className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors border border-accent px-3 py-1.5">
              <Plus size={13} /> Add Question
            </button>
          </div>
          {(data.items || []).length === 0 && (
            <p className="text-sm text-text-muted italic text-center py-4">No FAQs yet. Click Add Question.</p>
          )}
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="border border-border p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="absolute top-3 right-3 p-1 text-text-muted hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">Question</label>
                <input
                  value={item.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">Answer</label>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    const keys = section === "aboutus" ? ["title", "content"] : SECTION_KEYS[section];

    return (
      <div className="space-y-5">
        {keys.map((key) => (
          <div key={key}>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{LABELS[key] || key}</label>
            {IMAGE_KEYS.includes(key) ? (
              <ImageUploader label="" value={data[key] || ""} onChange={(url) => setData((p) => ({ ...p, [key]: url }))} />
            ) : TEXTAREA_KEYS.includes(key) ? (
              <textarea
                value={data[key] || ""}
                onChange={f(key)}
                rows={key === "body" || key === "content" ? 6 : 3}
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
              />
            ) : (
              <input
                value={data[key] || ""}
                onChange={f(key)}
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-8">Content Management</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSection(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${section === t.key ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 max-w-2xl">
          {[1, 2, 3].map((n) => <div key={n} className="h-12 bg-surface animate-pulse" />)}
        </div>
      ) : (
        <div className="max-w-2xl">
          {!editing ? (
            <div className="bg-surface border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-text-primary">{TABS.find((t) => t.key === section)?.label}</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-sm text-accent border border-accent px-4 py-2 hover:bg-accent hover:text-white transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
              {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 mb-5">Saved successfully.</div>}
              {renderViewMode()}
            </div>
          ) : (
            <div className="bg-surface border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-6">
                Editing: {TABS.find((t) => t.key === section)?.label}
              </h2>
              {renderEditMode()}
              <div className="flex items-center gap-4 pt-6 border-t border-border mt-6">
                <button onClick={save} disabled={saving} className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => { setEditing(false); loadSection(section); }}
                  className="text-sm text-text-secondary hover:text-text-primary px-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}