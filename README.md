# Spectral Earth — Satellite-Based Environmental Change Detection System

🌍 **Live Demo:** [https://abutalaham.github.io/SPECTRAL-EARTH/](https://abutalaham.github.io/SPECTRAL-EARTH/)

A browser-first geospatial analysis application built with React, TanStack Start, and Tailwind CSS. All image and satellite data processing runs locally in your browser — no account, no uploads, no cloud dependency required.

---

## What This Application Does

Spectral Earth lets you compare satellite or aerial images captured at different times to identify environmental changes. It has two independent analysis modes:

**Mode A — RGB Image Comparison**  
Upload any two photos of the same location. The app runs a pixel-by-pixel RGB distance comparison and produces a change overlay map, statistics, and downloadable exports.

**Mode B — Sentinel-2 Spectral NDVI Analysis (Beta)**  
Upload actual Sentinel-2 Level-2A GeoTIFF band files (B04 Red + B08 Near-Infrared) from two observation dates. The app calculates NDVI for each date and a per-pixel NDVI difference map using the standard formula:

```
NDVI = (NIR - Red) / (NIR + Red)
ΔNDVI = NDVI_later - NDVI_earlier
```

Both modes run entirely in the browser using HTML Canvas and, for GeoTIFF files, the [geotiff.js](https://geotiffjs.github.io/) library loaded lazily on demand.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR / prerender) |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + Vanilla CSS |
| UI Components | shadcn/ui (Radix-based) |
| Image Processing | HTML Canvas API (browser) |
| GeoTIFF Parsing | geotiff.js (lazy-loaded) |
| Charts | Recharts |
| Build | Vite 8 + Nitro (Cloudflare module preset) |
| Package Manager | Bun |
| Testing | Vitest + Testing Library |
| Deployment | GitHub Actions → GitHub Pages |

---

## Local Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Production build (with GitHub Pages base path)
BASE_PATH="/SPECTRAL-EARTH/" bun run build

# Build for local preview
bun run build
bun run preview
```

---

## Analysis Modes

### Mode A: RGB Image Comparison

1. Upload an **earlier** and a **later** image (PNG, JPEG, or WebP, up to 20 MB each).
2. Adjust the **Sensitivity** slider (1–100). Higher values detect finer differences; very high values may produce false positives.
3. Click **Run Analysis**. Processing runs on a downsampled canvas (max 1024px longest side) directly in the browser.
4. Review the change overlay, statistics, and download the results as PNG, JSON, or CSV.

**Limitations of RGB comparison:**
- Requires images of the same area, similar resolution, and comparable lighting.
- Seasonal, atmospheric, and sensor differences produce false positives.
- No geographic registration is performed.
- Synthetic sample images are provided for demonstration; they are not real satellite data.

---

### Mode B: Sentinel-2 Spectral NDVI Analysis (Beta)

This mode calculates authentic NDVI from raw infrared reflectance values. Standard photographs (JPEG/PNG) cannot be used here — they do not contain true spectral band data.

#### What You Need

Four GeoTIFF files from the Copernicus Data Space Browser ([browser.dataspace.copernicus.eu](https://browser.dataspace.copernicus.eu/)):

| File | Band | Wavelength | Resolution |
|---|---|---|---|
| Observation 1 — Red | B04 | 665 nm | 10 m |
| Observation 1 — Near-Infrared | B08 | 842 nm | 10 m |
| Observation 2 — Red | B04 | 665 nm | 10 m |
| Observation 2 — Near-Infrared | B08 | 842 nm | 10 m |

Always use **Level-2A (Bottom-of-Atmosphere)** surface reflectance products for vegetation analysis.

#### Acquiring Data from Copernicus Browser

1. Open [browser.dataspace.copernicus.eu](https://browser.dataspace.copernicus.eu/)
2. Zoom to your area of interest
3. Select **Sentinel-2 L2A**, set cloud coverage to < 15%
4. Click the **Download / Export** icon → choose **Analytical**
5. Select **B04** and **B08** bands, TIFF format (16-bit or 32-bit float)
6. Export a moderate bounding box (512–2048 px) for fast in-browser processing
7. Repeat for the comparison date at the same bounding box

An in-app step-by-step guide is also available by clicking **How to get Sentinel-2 Data** in Mode B.

A **synthetic sample dataset** (128×128 generated values with example water, road, field, and forest patterns) is built in — click **Load Synthetic Sample** to explore the interface immediately. It is not calibrated, georeferenced, or derived from Sentinel-2 observations, and its results must not be interpreted as real-world measurements. Area estimates are intentionally unavailable for this sample.

#### NDVI Interpretation

| NDVI Value | Typical Surface Type |
|---|---|
| < 0.0 | Water, cloud, ice, deep shadow |
| 0.0 – 0.2 | Bare soil, rock, urban impervious |
| 0.2 – 0.4 | Sparse grass, scrubland, post-harvest stubble |
| 0.4 – 0.6 | Moderate vegetation, grassland, young crop |
| > 0.6 | Dense canopy, mature forest, peak-season crop |

**ΔNDVI Interpretation:**

| Change | Candidate Meaning |
|---|---|
| ≤ −0.1 | Candidate vegetation loss (harvest, drought, fire, logging) |
| −0.1 to +0.1 | Stable — no significant spectral change |
| ≥ +0.1 | Candidate vegetation gain (regrowth, crop emergence) |

> **Important:** NDVI differences do not automatically confirm deforestation or environmental damage. Seasonal foliage cycles, agricultural harvests, cloud/shadow, atmospheric haze, and sensor angle all affect spectral indices. Always cross-validate with official datasets and field data before drawing conclusions.

---

## Performance Design

- **Mobile devices / touch screens**: The 3D WebGL hero scene is replaced with a lightweight CSS-only fallback (`StaticHeroFallback`). No WebGL is initialized on touch or reduced-motion devices.
- **prefers-reduced-motion**: Respected across all animated elements.
- **Desktop tilt effect**: Applied directly via `requestAnimationFrame` with no React state updates per frame — zero re-render cost.
- **geotiff.js**: Loaded lazily — only downloaded when the user opens Mode B and requests a GeoTIFF.
- **IntersectionObserver**: The WebGL hero frame is visually paused when scrolled off-screen.
- **Object URL cleanup**: All `createObjectURL` calls are tracked and revoked on component unmount and result replacement.

---

## Running Tests

```bash
bun run test
```

**Test coverage:**

| Suite | Tests |
|---|---|
| `difference.test.ts` | 5 — RGB pixel difference algorithm |
| `ndvi.test.ts` | 15 — NDVI pixel, raster, difference, NoData, colormap |
| `app-routing.test.tsx` | 1 — Router renders landing page |

All 21 tests pass.

---

## GitHub Pages Deployment

The project deploys automatically via GitHub Actions on every push to `main`.

**Setup (one-time):**
1. Go to your repository → **Settings → Pages**
2. Set **Source** to **GitHub Actions**

The workflow (`./github/workflows/deploy.yml`) installs Bun, runs tests, builds with `BASE_PATH=/SPECTRAL-EARTH/`, and deploys `.output/public` to GitHub Pages. A `404.html` is copied from `index.html` to support client-side navigation fallback.

---

## Scientific Disclaimer

Spectral Earth is a learning and demonstration project for environmental data science. Results are calculated from real mathematical formulas applied to provided image data. The application does not claim to perform:
- Verified land-use classification
- Legal-grade deforestation detection
- Atmospheric correction or geometric rectification beyond what the input data already contains
- AI-based or ML-based scene classification

All export reports include a machine-readable disclaimer. Validate all findings with official environmental monitoring datasets and domain expertise.

---

## License

This project is for educational purposes. Sentinel-2 imagery is provided under the [Copernicus Data Policy](https://sentinels.copernicus.eu/documents/247904/690755/Sentinel_Data_Legal_Notice).
