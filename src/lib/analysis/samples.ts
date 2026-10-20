/*
 * Synthetic sample scenes drawn on a canvas — NOT real satellite imagery.
 * The "later" scene clears part of the forest and adds a built-up block,
 * so the analysis has something meaningful to find.
 */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

function drawScene(later: boolean): HTMLCanvasElement {
  const W = 800, H = 560;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d")!;
  const r = rng(42);
  ctx.fillStyle = "#6b7d4a";
  ctx.fillRect(0, 0, W, H);
  // fields
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = ["#8a9a5b", "#a5a46a", "#71864a", "#9c8f5a"][i % 4]!;
    ctx.fillRect(r() * W, r() * H, 80 + r() * 140, 50 + r() * 90);
  }
  // forest
  for (let i = 0; i < 900; i++) {
    const x = 60 + r() * 360, y = 40 + r() * 300;
    const cleared = later && x > 200 && y > 120;
    ctx.fillStyle = cleared ? "#b49a6a" : r() > 0.5 ? "#2f4d26" : "#3b5e2c";
    ctx.beginPath(); ctx.arc(x, y, 6 + r() * 8, 0, Math.PI * 2); ctx.fill();
  }
  // river (narrower in later scene)
  ctx.strokeStyle = "#3d6b85";
  ctx.lineWidth = later ? 14 : 26;
  ctx.beginPath(); ctx.moveTo(0, 470);
  ctx.bezierCurveTo(250, 380, 500, 560, 800, 430); ctx.stroke();
  // urban block
  if (later) {
    for (let gx = 0; gx < 6; gx++) for (let gy = 0; gy < 4; gy++) {
      ctx.fillStyle = (gx + gy) % 2 ? "#c9c4bb" : "#9d9890";
      ctx.fillRect(540 + gx * 34, 80 + gy * 34, 28, 28);
    }
  }
  return c;
}

export function makeSampleFiles(): Promise<[File, File]> {
  const toFile = (c: HTMLCanvasElement, name: string) =>
    new Promise<File>((res, rej) => c.toBlob((b) => (b ? res(new File([b], name, { type: "image/png" })) : rej(new Error("Sample failed"))), "image/png"));
  return Promise.all([toFile(drawScene(false), "synthetic-sample-earlier.png"), toFile(drawScene(true), "synthetic-sample-later.png")]);
}
