import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { CompareSlider } from "./CompareSlider";
import { LIMITATIONS, type AnalysisResult } from "@/lib/analysis/types";
import { buildCsv, buildReport, downloadBlob, downloadUrl, interpretation } from "@/lib/analysis/report";

const nf = new Intl.NumberFormat();

export function ResultsDashboard({ result }: { result: AnalysisResult }) {
  const stamp = result.createdAt.replace(/[:.]/g, "-");
  const cards = [
    { label: "Changed pixels (%)", value: `${result.changedPercent.toFixed(2)}%` },
    { label: "Changed pixel count", value: nf.format(result.changedPixels) },
    { label: "Total analyzed pixels", value: nf.format(result.totalPixels) },
    { label: "Sensitivity used", value: `${result.sensitivity} / 100` },
  ];
  const chart = [
    { name: "Changed", value: result.changedPixels, color: "var(--chart-1)" },
    { name: "Unchanged", value: result.unchangedPixels, color: "var(--chart-2)" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-light tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => downloadBlob(new Blob([JSON.stringify(buildReport(result), null, 2)], { type: "application/json" }), `spectral-earth-report-${stamp}.json`)}>
          <FileJson /> Download Report
        </Button>
        <Button variant="secondary" onClick={() => downloadUrl(result.overlayUrl, `spectral-earth-change-map-${stamp}.png`)}>
          <Download /> Change Map PNG
        </Button>
        <Button variant="secondary" onClick={() => downloadBlob(new Blob([buildCsv(result)], { type: "text/csv" }), `spectral-earth-summary-${stamp}.csv`)}>
          <FileSpreadsheet /> Summary CSV
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-medium">Change map</h3>
          <img src={result.overlayUrl} alt="Change overlay: changed pixels highlighted" className="w-full rounded-lg" />
          <ul className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-highlight" /> Changed (above threshold)</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-muted-foreground/40" /> Unchanged (later image, dimmed)</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border bg-background" /> Not analyzed</li>
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-medium">Before / after comparison</h3>
          <CompareSlider before={result.beforeNormalizedUrl} after={result.afterNormalizedUrl} width={result.canvasWidth} height={result.canvasHeight} />
          <p className="mt-2 text-xs text-muted-foreground">Drag the slider to reveal the earlier or later image.</p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-4">
          <h3 className="font-medium">Change distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} stroke="none">
                  {chart.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => nf.format(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-xs">
            {chart.map((d) => (
              <li key={d.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />{d.name}</span><span className="tabular-nums">{nf.format(d.value)}</span></li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-4 lg:col-span-2">
          <h3 className="font-medium">Interpretation</h3>
          <p className="mt-2 text-sm leading-relaxed">{interpretation(result)}</p>
          <h4 className="mt-4 text-sm font-medium">Limitations</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {LIMITATIONS.map((l) => <li key={l}>{l}</li>)}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Analysis canvas {result.canvasWidth}×{result.canvasHeight} · RGB distance threshold {result.threshold.toFixed(1)}
          </p>
        </section>
      </div>
    </div>
  );
}
