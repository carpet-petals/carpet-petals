import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadImage } from "../../services/api";

interface Props {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;       
  disabled?: boolean;
}

export default function MultiImageUploader({ values, onChange, max = 10, disabled = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup helper ──────────────────────────────────────────────────────────
  function clearProgressInterval() {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }

  // ── Core upload logic ───────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    if (values.length >= max) {
      setError(`Maximum ${max} images allowed.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      setError("File too large. Maximum size is 80MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 5 : p));
    }, 300);

    try {
      const res = await uploadImage(file);
      const url: string = res?.data?.data?.url;

      if (!url || typeof url !== "string") {
        throw new Error("Invalid response from server.");
      }

      clearProgressInterval();
      setProgress(100);

      onChange([...values, url]);

      setTimeout(() => setProgress(0), 800);
    } catch (err: unknown) {
      clearProgressInterval();
      setProgress(0);

      let message = "Upload failed. Please try again.";
      if (err && typeof err === "object") {
        const axiosMsg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        const errorMsg = (err as { message?: string })?.message;
        message = axiosMsg || errorMsg || message;
      }
      setError(message);
    } finally {
      setUploading(false);

      if (inputRef.current) inputRef.current.value = "";
    }
  }, [values, onChange, max]);

  // ── Input change handler ────────────────────────────────────────────────────
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  // ── Drag-and-drop handlers ──────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!uploading && !disabled) setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (uploading || disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function remove(index: number) {
    if (uploading) return;
    onChange(values.filter((_, i) => i !== index));
    setError("");
  }

  function move(index: number, direction: -1 | 1) {
    if (uploading) return;
    const next = [...values];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const atMax = values.length >= max;
  const isDisabled = uploading || disabled;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs uppercase tracking-widest text-text-muted">
          Product Images
        </label>
        <span className="text-[11px] text-text-muted">
          {values.length}/{max}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* ── Thumbnails ─────────────────────────────────────────────────── */}
        {values.map((url, i) => (
          <div
            key={url}  
            className="relative w-24 h-24 border border-border overflow-hidden group"
          >
            <img
              src={url}
              alt={`Product image ${i + 1}`}
              className="w-full h-full object-cover"
              
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />

            {/* Overlay hidden*/}
            {!uploading && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1">
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove image ${i + 1}`}
                  className="bg-white border border-border p-1 hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <X size={11} className="text-text-primary" />
                </button>

                {/* Reorder arrows */}
                {values.length > 1 && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move left"
                      className="bg-white border border-border px-1 text-[10px] disabled:opacity-30 hover:bg-accent-light transition-colors"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === values.length - 1}
                      aria-label="Move right"
                      className="bg-white border border-border px-1 text-[10px] disabled:opacity-30 hover:bg-accent-light transition-colors"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* First image badge */}
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 py-0.5 leading-none pointer-events-none">
                MAIN
              </span>
            )}
          </div>
        ))}

        {/* ── Upload button — hidden when at max ─────────────────────────── */}
        {!atMax && (
          <button
            type="button"
            onClick={() => !isDisabled && inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={isDisabled}
            aria-label={uploading ? `Uploading ${progress}%` : "Add image"}
            className={[
              "w-24 h-24 border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors relative overflow-hidden",
              dragOver
                ? "border-accent bg-accent-light/50"
                : "border-border hover:border-accent hover:bg-accent-light/30",
              isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            {uploading ? (
              <>
                <Loader size={16} className="text-accent animate-spin" />
                <span className="text-[10px] text-accent font-medium">{progress}%</span>
              </>
            ) : (
              <>
                <Upload size={16} className="text-text-muted" />
                <span className="text-[10px] text-text-muted">
                  {dragOver ? "Drop" : "Add"}
                </span>
              </>
            )}

            {uploading && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1.5" role="alert">
          {error}
        </p>
      )}
      <p className="text-[11px] text-text-muted mt-1.5">
        JPG, PNG, WEBP, TIFF · Max 80MB per image
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff,image/bmp"
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}