import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadImage } from "../../services/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageUploader({ value, onChange, label = "Image", disabled = false }: Props) {
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
    // Client-side MIME check (accept="image/*" can be bypassed)
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    // Client-side size check — 80MB
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

      // validate the returned URL before calling onChange
      if (!url || typeof url !== "string") {
        throw new Error("Invalid response from server.");
      }

      clearProgressInterval();
      setProgress(100);
      onChange(url);

      // Reset progress bar after brief flash
      setTimeout(() => setProgress(0), 800);
    } catch (err: unknown) {
      clearProgressInterval();
      setProgress(0);

      //  properly narrow unknown error type
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
      // reset input so the same file can be re-selected after an error
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [onChange]);

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

  // ── Remove image ────────────────────────────────────────────────────────────
  function handleRemove() {
    onChange("");
    setError("");
    setProgress(0);
  }

  const isDisabled = uploading || disabled;

  return (
    <div>
      {label && (
        <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">
          {label}
        </label>
      )}

      {value ? (
        // ── Preview ───────────────────────────────────────────────────────────
        <div className="relative w-40 h-40 border border-border overflow-hidden group">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            //  handle broken image URLs gracefully
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              setError("Image failed to load.");
            }}
          />
          {/* don't allow remove while uploading */}
          {!uploading && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleRemove}
                aria-label="Remove image"
                className="bg-white border border-border p-1.5 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <X size={13} className="text-text-primary" />
              </button>
            </div>
          )}
        </div>
      ) : (
        // ── Upload zone ───────────────────────────────────────────────────────
        <button
          type="button"
          onClick={() => !isDisabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={isDisabled}
          aria-label={uploading ? `Uploading ${progress}%` : "Upload image"}
          className={[
            "w-40 h-40 border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors relative overflow-hidden",
            dragOver
              ? "border-accent bg-accent-light/50"
              : "border-border hover:border-accent hover:bg-accent-light/30",
            isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          {uploading ? (
            <>
              <Loader size={20} className="text-accent animate-spin" />
              <span className="text-xs text-accent font-medium">{progress}%</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-text-muted" />
              <span className="text-xs text-text-muted text-center px-2 leading-tight">
                {dragOver ? "Drop to upload" : "Click or drag & drop"}
              </span>
              <span className="text-[10px] text-text-muted">Max 80MB</span>
            </>
          )}

          {/* Progress bar */}
          {uploading && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1" role="alert">
          {error}
        </p>
      )}

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