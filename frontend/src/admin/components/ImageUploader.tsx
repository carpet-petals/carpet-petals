import { useState, useRef } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadImage } from "../../services/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size check — 80MB
    if (file.size > 80 * 1024 * 1024) {
      setError("File too large. Maximum size is 80MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    // Simulate progress for UX (Cloudinary doesn't return upload progress via this method)
    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    try {
      const res = await uploadImage(file);
      clearInterval(progressInterval);
      setProgress(100);
      onChange(res.data.data.url);
      setTimeout(() => setProgress(0), 800);
    } catch (err: any) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">{label}</label>
      )}

      {value ? (
        <div className="relative w-40 h-40 border border-border overflow-hidden group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-white border border-border p-1.5 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <X size={13} className="text-text-primary" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-40 h-40 border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent-light/30 transition-colors disabled:opacity-60 relative overflow-hidden"
        >
          {uploading ? (
            <>
              <Loader size={20} className="text-accent animate-spin" />
              <span className="text-xs text-accent">{progress}%</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-text-muted" />
              <span className="text-xs text-text-muted text-center px-2 leading-tight">Click to upload</span>
              <span className="text-[10px] text-text-muted">Max 80MB</span>
            </>
          )}
          {uploading && (
            <div className="absolute bottom-0 left-0 h-1 bg-accent transition-all" style={{ width: progress + "%" }} />
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}