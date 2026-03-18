import { useEffect, useState, useCallback } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import ImageUploader from "../components/ImageUploader";

// Hero and About sections are hardcoded in the frontend components.
// Only operational/dynamic content is managed here.
type Section = "payment" | "contact" | "aboutus" | "faq";

const LABELS: Record<string, string> = {
  upi:          "UPI ID",
  upiQrImage:   "UPI QR Code Image",
  bankName:     "Bank Name",
  accountName:  "Account Name",
  accountNumber:"Account Number",
  ifsc:         "IFSC Code",
  phone:        "Phone",
  whatsapp:     "WhatsApp Number",
  email:        "Email",
  address:      "Address",
  mapEmbedUrl:  "Google Maps Embed URL",
  instagramUrl: "Instagram URL",
  facebookUrl:  "Facebook URL",
  title:        "Title",
  content:      "Content",
};

const IMAGE_KEYS    = ["upiQrImage"];
const TEXTAREA_KEYS = ["address", "mapEmbedUrl", "content"];

const SECTION_KEYS: Record<Section, string[]> = {
  payment: ["upi", "upiQrImage", "bankName", "accountName", "accountNumber", "ifsc"],
  contact: ["phone", "whatsapp", "email", "address", "mapEmbedUrl", "instagramUrl", "facebookUrl"],
  aboutus: ["title", "content"],
  faq:     [],
};

const TABS: { key: Section; label: string }[] = [
  { key: "payment", label: "Payment" },
  { key: "contact", label: "Contact" },
  { key: "aboutus", label: "About Us Page" },
  { key: "faq",     label: "FAQ" },
];

export default function Content() {
  const [section,   setSection  ] = useState<Section>("payment");
  const [data,      setData     ] = useState<Record<string, any>>({});
  const [savedData, setSavedData] = useState<Record<string, any>>({});
  const [editing,   setEditing  ] = useState(false);
  const [saving,    setSaving   ] = useState(false);
  const [saved,     setSaved    ] = useState(false);
  const [loading,   setLoading  ] = useState(true);
  const [saveError, setSaveError] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadSection = useCallback(async (s: Section) => {
    setLoading(true);
    setEditing(false);
    setSaved(false);
    setSaveError("");
    try {
      const res = await api.get(`/content/${s}`);
      setData(res.data.data);
      setSavedData(res.data.data);
    } catch {
      setData({});
      setSavedData({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSection(section); }, [section, loadSection]);

  // ── Tab switch with unsaved-changes guard ─────────────────────────────────
  function switchSection(next: Section) {
    if (next === section) return;
    if (editing) {
      if (!window.confirm("You have unsaved changes. Discard and switch tab?")) return;
    }
    setSection(next);
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      await api.put(`/content/${section}`, data);
      setSaved(true);
      setSavedData(data);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setSaveError(axiosMsg || "Error saving. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Cancel ────────────────────────────────────────────────────────────────
  function cancel() {
    setData(savedData);
    setEditing(false);
    setSaveError("");
  }

  // ── Field helpers ─────────────────────────────────────────────────────────
  function f(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((p) => ({ ...p, [key]: e.target.value }));
  }

  // ── FAQ helpers ───────────────────────────────────────────────────────────
  function addFaq() {
    setData((p) => ({ ...p, items: [...(p.items || []), { question: "", answer: "" }] }));
  }
  function updateFaq(index: number, field: "question" | "answer", value: string) {
    setData((p) => ({
      ...p,
      items: (p.items || []).map((item: any, i: number) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }
  function removeFaq(index: number) {
    setData((p) => ({
      ...p,
      items: (p.items || []).filter((_: any, i: number) => i !== index),
    }));
  }

  // ── View mode ─────────────────────────────────────────────────────────────
  function renderViewMode() {
    if (section === "faq") {
      return (
        <div className="space-y-4">
          {(data.items || []).length === 0 && (
            <p className="text-sm text-text-muted italic">No FAQs added yet.</p>
          )}
          {(data.items || []).map((item: any, i: number) => (
            <div key={`faq-view-${i}`} className="border border-border p-4">
              <p className="text-sm font-medium text-text-primary mb-1">{item.question}</p>
              <p className="text-sm text-text-secondary">{item.answer}</p>
            </div>
          ))}
        </div>
      );
    }

    const keys = SECTION_KEYS[section];
    return (
      <div className="space-y-5">
        {keys.map((key) => (
          <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-1">
              {LABELS[key] || key}
            </p>
            {IMAGE_KEYS.includes(key) ? (
              data[key]
                ? <img src={data[key]} alt={key} className="w-32 h-32 object-cover border border-border" />
                : <p className="text-sm text-text-muted italic">No image set</p>
            ) : (
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {data[key] || <span className="text-text-muted italic">Not set</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  function renderEditMode() {
    if (section === "faq") {
      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">FAQ Items</h3>
            <button
              onClick={addFaq}
              type="button"
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors border border-accent px-3 py-1.5"
            >
              <Plus size={13} /> Add Question
            </button>
          </div>
          {(data.items || []).length === 0 && (
            <p className="text-sm text-text-muted italic text-center py-4">
              No FAQs yet. Click "Add Question" to start.
            </p>
          )}
          {(data.items || []).map((item: any, i: number) => (
            <div key={`faq-edit-${i}`} className="border border-border p-4 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeFaq(i)}
                className="absolute top-3 right-3 p-1 text-text-muted hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">
                  Question
                </label>
                <input
                  value={item.question}
                  onChange={(e) => updateFaq(i, "question", e.target.value)}
                  className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-1.5">
                  Answer
                </label>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    const keys = SECTION_KEYS[section];
    return (
      <div className="space-y-5">
        {keys.map((key) => (
          <div key={key}>
            <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
              {LABELS[key] || key}
            </label>
            {IMAGE_KEYS.includes(key) ? (
              <ImageUploader
                label=""
                value={data[key] || ""}
                onChange={(url) => setData((p) => ({ ...p, [key]: url }))}
                disabled={saving}
              />
            ) : TEXTAREA_KEYS.includes(key) ? (
              <textarea
                value={data[key] || ""}
                onChange={f(key)}
                rows={key === "content" ? 6 : 3}
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none transition-colors"
              />
            ) : (
              <input
                value={data[key] || ""}
                onChange={f(key)}
                className="w-full bg-background border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Content Management
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Hero and About section content is hardcoded in the codebase — update requires a redeploy.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-8 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchSection(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              section === t.key
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      {loading ? (
        <div className="space-y-3 max-w-2xl">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-12 bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="max-w-2xl">
          {!editing ? (
            <div className="bg-surface border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-text-primary">
                  {TABS.find((t) => t.key === section)?.label}
                </h2>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-sm text-accent border border-accent px-4 py-2 hover:bg-accent hover:text-white transition-colors"
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
              {saved && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2.5 mb-5">
                  Saved successfully.
                </div>
              )}
              {renderViewMode()}
            </div>
          ) : (
            <div className="bg-surface border border-border p-6">
              <h2 className="font-semibold text-text-primary mb-6">
                Editing: {TABS.find((t) => t.key === section)?.label}
              </h2>
              {renderEditMode()}
              {saveError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5" role="alert">
                  {saveError}
                </div>
              )}
              <div className="flex items-center gap-4 pt-6 border-t border-border mt-6">
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={cancel}
                  disabled={saving}
                  className="text-sm text-text-secondary hover:text-text-primary px-4 disabled:opacity-60 transition-colors"
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