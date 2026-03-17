import { useEffect, useState, useRef } from "react";
import { Mail, Star, X, RotateCcw, Trash2, Send, ChevronDown, ChevronUp, Paperclip, Download, Eye } from "lucide-react";
import api from "../../services/api";

interface Reply { message: string; attachments: string[]; sentAt: string; }
interface Submission {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  attachments: string[];
  selectedProducts: { id: string; title: string }[];
  selectedCategories: { id: string; name: string }[];
  status: "open" | "closed";
  important: boolean;
  read: boolean;
  replies: Reply[];
  createdAt: string;
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
}

function AttachmentItem({ url, index }: { url: string; index: number }) {
  const [preview, setPreview] = useState(false);
  const img = isImage(url);

  return (
    <div className="border border-border bg-white overflow-hidden">
      {img ? (
        <>
          {preview && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(false)}>
              <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-auto max-h-[80vh] object-contain" />
                <button onClick={() => setPreview(false)} className="absolute top-2 right-2 bg-white text-text-primary p-1.5 rounded">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="relative group">
            <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-28 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => setPreview(true)}
                className="bg-white text-text-primary px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:bg-accent hover:text-white transition-colors"
              >
                <Eye size={12} /> Preview
              </button>
              
              <a  href={url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-text-primary px-3 py-1.5 text-xs font-medium flex items-center gap-1 hover:bg-accent hover:text-white transition-colors"
              >
                <Download size={12} /> Download
              </a>
            </div>
          </div>
          <div className="px-2 py-1.5 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">Image {index + 1}</span>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <Paperclip size={16} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-text-primary truncate">PDF Document {index + 1}</p>
            <p className="text-[11px] text-text-muted">PDF File</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            
            <a  href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-accent transition-colors"
              title="Preview"
            >
              <Eye size={14} />
            </a>
            
            <a  href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-muted hover:text-accent transition-colors"
              title="Download"
            >
              <Download size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Enquiries() {
  const [list, setList] = useState<Submission[]>([]);
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyAttachments, setReplyAttachments] = useState<Record<string, string[]>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    const res = await api.get(`/contact?status=${tab}`);
    setList(res.data.data);
  }

  useEffect(() => { load(); }, [tab]);

  async function markImportant(id: string) { await api.put(`/contact/${id}/important`); load(); }
  async function close(id: string) { await api.put(`/contact/${id}/close`); load(); }
  async function reopen(id: string) { await api.put(`/contact/${id}/reopen`); load(); }
  async function remove(id: string) {
    if (!confirm("Delete this enquiry permanently?")) return;
    await api.delete(`/contact/${id}`);
    load();
  }

  async function handleReplyFileUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload/attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReplyAttachments((p) => ({ ...p, [id]: [...(p[id] || []), res.data.data.url] }));
    } catch {
      alert("File upload failed.");
    } finally {
      setUploadingFor(null);
      if (fileRefs.current[id]) fileRefs.current[id]!.value = "";
    }
  }

  function removeReplyAttachment(id: string, index: number) {
    setReplyAttachments((p) => ({ ...p, [id]: (p[id] || []).filter((_, i) => i !== index) }));
  }

  async function sendReply(id: string) {
    const message = replyText[id];
    if (!message?.trim()) return;
    setReplying(id);
    try {
      await api.post(`/contact/${id}/reply`, {
        message,
        attachments: replyAttachments[id] || [],
      });
      setReplyText((p) => ({ ...p, [id]: "" }));
      setReplyAttachments((p) => ({ ...p, [id]: [] }));
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Reply failed.");
    } finally {
      setReplying(null);
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
    if (expanded !== id) api.put(`/contact/${id}/read`).catch(() => {});
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-text-primary mb-8">Enquiries</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-border">
        {(["open", "closed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${tab === t ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <p className="text-text-muted text-sm py-12 text-center">No {tab} enquiries.</p>
      )}

      <div className="space-y-3">
        {list.map((item) => (
          <div
            key={item._id}
            className={`bg-white border ${item.important ? "border-amber-400" : item.read ? "border-border" : "border-accent/40"}`}
          >
            {/* Header Row */}
            <div className="flex items-start gap-3 p-4">
              <div className={`w-8 h-8 flex items-center justify-center shrink-0 mt-0.5 ${item.important ? "bg-amber-50" : "bg-accent-light"}`}>
                <Mail size={14} className={item.important ? "text-amber-500" : "text-accent"} />
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggle(item._id)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text-primary text-sm">{item.name}</p>
                  {item.important && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 border border-amber-200 uppercase tracking-wide">Important</span>
                  )}
                  {!item.read && (
                    <span className="text-[10px] bg-accent-light text-accent px-2 py-0.5 border border-accent/20 uppercase tracking-wide">New</span>
                  )}
                  {item.attachments?.length > 0 && (
                    <span className="text-[10px] bg-surface border border-border text-text-muted px-2 py-0.5 uppercase tracking-wide flex items-center gap-1">
                      <Paperclip size={9} /> {item.attachments.length}
                    </span>
                  )}
                  {item.replies?.length > 0 && (
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 border border-green-200 uppercase tracking-wide">
                      {item.replies.length} {item.replies.length === 1 ? "Reply" : "Replies"}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-text-muted mt-0.5 flex-wrap">
                  {item.email && <span>{item.email}</span>}
                  {item.phone && <span>{item.phone}</span>}
                  <span>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1 truncate">{item.message}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => markImportant(item._id)} title={item.important ? "Remove important" : "Mark important"} className={`p-1.5 rounded transition-colors ${item.important ? "text-amber-500 hover:text-amber-600" : "text-text-muted hover:text-amber-500"}`}>
                  <Star size={15} fill={item.important ? "currentColor" : "none"} />
                </button>
                {tab === "open" ? (
                  <button onClick={() => close(item._id)} title="Close enquiry" className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded">
                    <X size={15} />
                  </button>
                ) : (
                  <button onClick={() => reopen(item._id)} title="Reopen" className="p-1.5 text-text-muted hover:text-accent transition-colors rounded">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => remove(item._id)} title="Delete" className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded">
                  <Trash2 size={15} />
                </button>
                <button onClick={() => toggle(item._id)} className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded">
                  {expanded === item._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {/* Expanded */}
            {expanded === item._id && (
              <div className="border-t border-border px-5 py-5 space-y-6 bg-surface/50">

                {/* Full Message */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Message</p>
                  <p className="text-sm text-text-primary leading-relaxed">{item.message}</p>
                </div>

                {/* Selected Products */}
                {item.selectedProducts?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Selected Products</p>
                    <div className="flex flex-wrap gap-2">
                      {item.selectedProducts.map((p) => (
                        <span key={p.id} className="text-xs bg-accent-light text-accent px-3 py-1 border border-accent/20">{p.title}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Categories */}
                {item.selectedCategories?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Selected Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {item.selectedCategories.map((c) => (
                        <span key={c.id} className="text-xs bg-surface border border-border text-text-secondary px-3 py-1">{c.name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attachments — proper display */}
                {item.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-3">Attachments</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {item.attachments.map((url, i) => (
                        <AttachmentItem key={i} url={url} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply History */}
                {item.replies?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-3">Reply History</p>
                    <div className="space-y-3">
                      {item.replies.map((r, i) => (
                        <div key={i} className="bg-white border border-border p-4">
                          <p className="text-sm text-text-primary leading-relaxed mb-2">{r.message}</p>
                          {r.attachments?.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                              {r.attachments.map((url, ai) => (
                                <AttachmentItem key={ai} url={url} index={ai} />
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-text-muted mt-2">{new Date(r.sentAt).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Box */}
                {item.email ? (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted mb-3">Reply to {item.email}</p>
                    <textarea
                      rows={3}
                      value={replyText[item._id] || ""}
                      onChange={(e) => setReplyText((p) => ({ ...p, [item._id]: e.target.value }))}
                      placeholder="Type your reply..."
                      className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"
                    />

                    {/* Reply Attachments */}
                    {(replyAttachments[item._id] || []).length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                        {(replyAttachments[item._id] || []).map((url, i) => (
                          <div key={i} className="relative">
                            <AttachmentItem url={url} index={i} />
                            <button
                              onClick={() => removeReplyAttachment(item._id, i)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <button
                        onClick={() => sendReply(item._id)}
                        disabled={replying === item._id || !replyText[item._id]?.trim()}
                        className="btn-primary text-sm px-5 py-2.5 disabled:opacity-60"
                      >
                        <Send size={14} />
                        {replying === item._id ? "Sending..." : "Send Reply"}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileRefs.current[item._id]?.click()}
                        disabled={uploadingFor === item._id}
                        className="flex items-center gap-2 text-sm text-text-secondary border border-border px-4 py-2.5 hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
                      >
                        <Paperclip size={14} />
                        {uploadingFor === item._id ? "Uploading..." : "Attach File"}
                      </button>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={(el) => { fileRefs.current[item._id] = el; }}
                        onChange={(e) => handleReplyFileUpload(item._id, e)}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">No email address on this enquiry — cannot send reply.</p>
                )}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}