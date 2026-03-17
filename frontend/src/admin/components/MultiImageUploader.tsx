import { useState, useRef } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadImage } from "../../services/api";

interface Props {
  values: string[];
  onChange: (urls: string[]) => void;
}

export default function MultiImageUploader({ values, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      setError("File too large. Maximum size is 80MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 300);

    try {
      const res = await uploadImage(file);
      clearInterval(progressInterval);
      setProgress(100);
      onChange([...values, res.data.data.url]);
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

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Product Images</label>
      <div className="flex flex-wrap gap-3">
        {values.map((url, i) => (
          <div key={i} className="relative w-24 h-24 border border-border overflow-hidden group">
            <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => remove(i)}
                className="bg-white border border-border p-1 hover:bg-red-50 transition-colors"
              >
                <X size={11} className="text-text-primary" />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent-light/30 transition-colors disabled:opacity-60 relative overflow-hidden"
        >
          {uploading ? (
            <>
              <Loader size={16} className="text-accent animate-spin" />
              <span className="text-[10px] text-accent">{progress}%</span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-text-muted" />
              <span className="text-[10px] text-text-muted">Add</span>
            </>
          )}
          {uploading && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all" style={{ width: progress + "%" }} />
          )}
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      <p className="text-[11px] text-text-muted mt-1.5">JPG, PNG, WEBP, TIFF · Max 80MB per image</p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}