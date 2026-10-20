import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LoadedImage } from "@/lib/analysis/types";
import { ACCEPTED_TYPES } from "@/lib/analysis/engine";

interface Props {
  label: string;
  hint: string;
  image: LoadedImage | null;
  error: string | null;
  onFile: (file: File) => void;
  onRemove: () => void;
}

const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`);

export function UploadPanel({ label, hint, image, error, onFile, onRemove }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const pick = () => input.current?.click();

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-medium">{label}</h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        aria-label={`Choose ${label}`}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      {image ? (
        <div>
          <img src={image.url} alt={`${label} preview`} className="aspect-[4/3] w-full rounded-lg bg-muted object-contain" />
          <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="col-span-3 truncate"><dt className="sr-only">Filename</dt><dd title={image.file.name}>{image.file.name}</dd></div>
            <div><dt className="text-muted-foreground">Size</dt><dd>{image.width}×{image.height}</dd></div>
            <div><dt className="text-muted-foreground">File</dt><dd>{fmtSize(image.file.size)}</dd></div>
          </dl>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" size="sm" onClick={pick}><RefreshCw /> Replace</Button>
            <Button variant="ghost" size="sm" onClick={onRemove}><Trash2 /> Remove</Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onFile(f);
          }}
          className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${drag ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
        >
          <ImagePlus className="h-7 w-7 text-primary" aria-hidden />
          <span>Drop an image or click to browse</span>
          <span className="text-xs text-muted-foreground">PNG, JPEG or WebP · up to 20 MB</span>
        </button>
      )}
      {error && (
        <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
