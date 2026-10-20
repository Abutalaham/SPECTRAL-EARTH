# Earth Change Atlas

# SPECTRAL EARTH — Complete Project Build Prompt

## 1. Project Overview

Build a modern, professional, functional web applicatio named **Spectral Earth — Satellite-Based Environmental Change Detection System**.

Spectral Earth helps users compare satellite or aerial images captured at different times to identify environmental changes, including vegetation loss, water coverage changes, deforestation, and urban expansion.
j

This is a practice project for a beginner learning environmental data science, computer vision, and machine learning. Build a working first version without requiring the developer to train an ML model or configure a Python backend.

**IMPORTANT:** Build the actual application, not just a landing page or static UI mockup. Every primary button, upload area, slider, analysis action, result panel, and download function must work.

Prioritize functionality, clean architecture, low implementation complexity, and efficient use of Lovable credits. Do not repeatedly redesign the application or add unnecessary dependencies.

## 2. Technology Stack

Use:
- React with TypeScript.
- Vite.
- Tailwind CSS.
- shadcn/ui components where useful.
- Lucide icons.
- HTML Canvas API for browser-based image processing.
- Recharts for charts if needed.
- Browser Blob APIs for downloadable reports and images.
- Local browser state for the initial version.

Do not require Python, PyTorch, scikit-learn, Streamlit, paid APIs, API keys, or a separately hosted backend for the initial working version.

Keep the architecture ready for future integration with Supabase for authentication, saved analysis history, and optional cloud storage. Do not connect or configure Supabase unless required for a feature that cannot reasonably work locally.

## 3. Visual Design

Create a premium environmental intelligence dashboard inspired by modern geospatial analytics and scientific research software.

Design direction:
- Dark forest-green and deep charcoal background.
- Emerald and lime accents.
- Off-white text with muted gray secondary text.
- Subtle borders, restrained shadows, and rounded cards.
- Clean typography and generous spacing.
- Professional maps, charts, and analytical visualizations.
- Responsive layout for desktop, tablet, and mobile.
- Accessible contrast, keyboard navigation, and clear focus states.

Avoid excessive gradients, oversized headings inside the dashboard, unnecessary animations, generic template styling, and decorative components that do not improve usability.

Use a clean sidebar navigation on desktop and an appropriate mobile navigation pattern.

## 4. Landing Page

Create a professional hero section containing:

Product name: Spectral Earth

Headline: "See How Our Planet Changes."

Supporting text: "Compare satellite imagery, identify environmental changes, and turn visual differences into actionable insights."

Primary CTA: "Start Analyzing"

Secondary CTA: "Explore Features"

Include:
- A compelling satellite-imagery comparison visual.
- Three feature highlights: Change Detection, Environmental Insights, and Downloadable Reports.
- A simple explanation of the analysis workflow.
- A responsible-use disclaimer explaining that image differences do not automatically prove environmental damage.
- A footer with project information.

The primary CTA must navigate to the analysis workspace. Do not create a fake sign-in requirement.

## 5. Analysis Workspace

Build a functional analysis page with the following workflow.

### A. Upload Two Images

Provide two distinct upload panels:

1. Earlier Image — baseline.
2. Later Image — comparison.

Requirements:
- Support PNG, JPEG, and WebP.
- Allow file selection and drag-and-drop.
- Display image previews, filenames, dimensions, and file sizes.
- Provide replace and remove actions.
- Validate file types and reasonable file-size limits.
- Show clear errors for unsupported or unreadable files.
- Provide a button to load bundled sample images, if sample assets can be included without external API dependencies.
- Do not pretend that ordinary sample photographs are actual satellite imagery.

### B. Image Alignment and Validation

Before analysis:
- Verify that both images can be loaded.
- Display their dimensions.
- Handle different image dimensions by resizing both to a common analysis canvas while preserving aspect ratio.
- Provide a simple side-by-side preview.
- Explain that accurate geographic change detection requires images of the same location, comparable resolution, suitable alignment, and compatible capture conditions.

Do not claim to perform precise geospatial registration or geographic area measurement when those capabilities have not been implemented.

### C. Analysis Settings

Include:
- Sensitivity slider, adjustable from 1 to 100.
- Default sensitivity of 50.
- Clear labels explaining that higher sensitivity detects smaller pixel differences and may increase false positives.
- A "Run Analysis" button.
- Loading indicator while analysis runs.
- Validation preventing analysis until both images are provided.
- A "Reset Analysis" button.

Changing the sensitivity should update the analysis results when the user reruns the analysis.

## 6. Functional Change Detection Engine

Implement real browser-side pixel comparison using the HTML Canvas API.

The analysis must not return fabricated results, random percentages, or hardcoded statistics.

Implementation requirements:

1. Load both uploaded images.
2. Draw normalized versions to canvases of a common size.
3. Read pixel data from both canvases.
4. Calculate the RGB pixel difference for each corresponding pixel.
5. Use a documented, understandable difference metric.
6. Apply the sensitivity threshold to determine which pixels are considered changed.
7. Generate a binary change mask.
8. Generate a change-overlay image with detected pixels highlighted in a bright, contrasting color.
9. Calculate the percentage of analyzed pixels exceeding the selected threshold.
10. Recalculate results when the user runs analysis again with a different sensitivity.

For example, use the Euclidean distance between corresponding RGB pixel values as a simple difference measure, with a clearly defined threshold mapping from the sensitivity slider.

Show the original images and the resulting change overlay.

Important scientific limitation: This is a baseline image-difference algorithm, not a trained machine learning model, satellite-specific spectral analysis, or proof of actual environmental change. Differences in clouds, lighting, seasons, shadows, camera settings, image alignment, and resolution can affect the results.

Make these limitations visible in the interface and in exported reports.

## 7. Results Dashboard

After a successful analysis, display a results dashboard with real values calculated from the uploaded images.

Include:

### Summary Cards
- Changed Pixel Percentage.
- Changed Pixel Count.
- Total Analyzed Pixel Count.
- Sensitivity Used.

Use accurate labels. Do not label changed-pixel percentage as hectares, square kilometers, or verified environmental damage.

### Change Map
- Display the generated change overlay.
- Use a clear highlight color.
- Include a legend explaining changed and unchanged pixels.
- Provide a button to download the overlay as a PNG.
- Include a before-and-after comparison view.

### Comparison Viewer
Create an interactive comparison component that allows users to inspect the earlier and later images side by side.

If practical, include a draggable before-and-after slider. Make sure the slider changes the actual displayed images and is not merely decorative.

### Change Distribution
Display a chart of changed versus unchanged analyzed pixels, based on actual analysis results.

### Interpretation Panel
Generate a simple, deterministic explanation based on the computed image-difference statistics.

Example:

"The selected threshold identified 12.4% of analyzed pixels as different between the two images. These differences may reflect land-cover changes, illumination differences, shadows, clouds, seasonal variation, or image misalignment. Additional validation is required before drawing environmental conclusions."

The example percentage above is illustrative only. Always display the real computed result.

Do not claim to identify deforestation, water loss, or urban expansion automatically unless a validated classification method is implemented.

## 8. Downloadable Analysis Report

Implement a working "Download Report" button.

Generate a downloadable JSON report containing:
- Project name.
- Analysis date and time.
- Original image filenames.
- Original image dimensions.
- Analysis canvas dimensions.
- Difference metric.
- Sensitivity value.
- Changed pixel count.
- Unchanged pixel count.
- Total analyzed pixel count.
- Changed pixel percentage.
- Important scientific limitations.

Also provide:
- Download Change Map as PNG.
- Download Summary as CSV, if feasible without unnecessary dependencies.

Generate downloads locally in the browser. Revoke temporary object URLs when they are no longer required.

The report must reflect the current analysis results and must not contain fabricated statistics.

## 9. User Experience and Error Handling

Every important action must work.

Requirements:
- Clear upload and analysis states.
- Empty state before images are selected.
- Loading state during processing.
- Success state after analysis.
- Useful error messages.
- Prevention of duplicate or invalid analysis.
- Reset action that clears previous results and temporary image data.
- Responsive design.
- No dead buttons.
- No fake notifications or fake backend responses.
- No fake progress percentages.
- No broken navigation links.

Use appropriate browser resource cleanup to prevent unnecessary memory usage when images are replaced or removed.

## 10. Privacy and Security

Treat uploaded images as potentially sensitive.

For version one:
- Process images locally in the browser.
- Do not upload image data to an external server.
- Do not store uploaded images permanently.
- Do not send image contents to analytics or third-party services.
- Clear temporary data when the user resets or leaves the analysis workflow where practical.
- Explain the local-processing behavior in a small privacy note.

Do not implement authentication merely for appearance.

## 11. Future Supabase Integration

Keep the code organized so Supabase can be integrated later for:
- User authentication.
- Saved analysis history.
- User-specific analysis history.
- Optional cloud storage for explicitly saved images and reports.

For this first version, keep analysis local. Do not add unnecessary Supabase configuration, database tables, storage buckets, or authentication dependencies.

## 12. Code Quality

- Use reusable React components.
- Keep image processing separate from UI components.
- Use TypeScript types for analysis inputs and results.
- Avoid unnecessary dependencies.
- Keep functions understandable for a beginner.
- Handle canvas security and image-loading errors gracefully.
- Avoid duplicating the image-comparison algorithm.
- Do not put all application logic in a single enormous component.
- Include clear comments around the image-difference calculation and threshold mapping.
- Ensure the application builds without TypeScript errors.
- Fix broken imports and missing dependencies.

## 13. Acceptance Criteria

Consider the first version complete only when:

1. The application has a polished landing page and working analysis workspace.
2. A user can upload two valid images.
3. Both images are previewed correctly.
4. The Run Analysis button performs real pixel comparison.
5. The sensitivity setting affects the threshold used by the algorithm.
6. The application produces a real change mask and overlay.
7. Changed-pixel statistics are calculated from the actual image data.
8. Results and charts reflect the calculated statistics.
9. The PNG overlay downloads successfully.
10. The JSON report downloads successfully and contains real results.
11. Invalid uploads and missing images are handled properly.
12. Reset clears the analysis state.
13. The interface works on mobile and desktop.
14. No paid APIs, API keys, or external Python backend are required.
15. No environmental classifications or geographic measurements are fabricated.

## 14. Instructions for Implementation

Build the application in the existing project using the simplest reliable approach.

First implement the complete working image-comparison workflow. Then complete the landing page and polish the dashboard.

Prioritize functional correctness over adding extra features.

Do not ask me to make technical decisions unless absolutely necessary. Choose reasonable defaults.

Do not replace working functionality with mock data.

Do not repeatedly regenerate the project or perform a complete redesign after the initial build. Make focused fixes only when an actual issue is found.

At the end, provide a concise summary of the implemented features, any known limitations, and the steps needed to test the application.

**Final objective:** Deliver a polished, beginner-friendly Spectral Earth application that genuinely compares two images, calculates pixel-level differences, visualizes detected changes, and exports a useful report, all without requiring a trained ML model or paid backend.





and the frontend them use this 
sylva-hero prompt

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c059b387-039a-4dc7-bf26-7cdc97a80415).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
