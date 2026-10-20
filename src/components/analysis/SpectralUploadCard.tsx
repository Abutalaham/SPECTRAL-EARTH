import { useRef } from "react";
import { Upload, FileCheck, X, AlertCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParsedBand } from "@/lib/analysis/ndvi";

interface SpectralUploadCardProps {
  label: string;
  bandCode: "B04 (Red)" | "B08 (NIR)";
  bandHint: string;
  parsedBand: ParsedBand | null;
  error: string | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export function SpectralUploadCard({
  label,
  bandCode,
  bandHint,
  parsedBand,
  error,
  loading,
  onFileSelect,
  onRemove,
}: SpectralUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-emerald-500/20 bg-card p-4 shadow-sm transition-colors hover:border-emerald-500/40">
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div>
          <span className="text-xs font-medium text-foreground">{label}</span>
          <span className="ml-2 rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] text-accent">
            {bandCode}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{bandHint}</span>
      </div>

      <div className="mt-3">
        {parsedBand ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileCheck className="h-5 w-5 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-medium text-white">{parsedBand.fileName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {parsedBand.width} × {parsedBand.height} px · {(parsedBand.fileSize / 1024).toFixed(1)} KB
                  {parsedBand.metadata.pixelScaleMeters && ` · ${parsedBand.metadata.pixelScaleMeters}m GSD`}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-emerald-500/30 bg-background/50 p-5 text-center transition-all hover:bg-emerald-950/10 hover:border-accent"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".tif,.tiff"
              onChange={handleChange}
              className="hidden"
            />
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-accent">
                <Layers className="h-4 w-4 animate-spin" />
                <span>Parsing GeoTIFF raster...</span>
              </div>
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-xs font-medium text-foreground">Click to upload .tif / .tiff</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Drag & drop 10m GeoTIFF band</p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
