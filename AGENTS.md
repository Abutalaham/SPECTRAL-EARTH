<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Spectral Earth rules
- Image change detection runs fully in the browser; pure pixel math lives in src/lib/analysis/difference.ts (tested), canvas/DOM work in engine.ts — keep the algorithm in one place so a future backend can reuse it.
- The landing hero is ThreeUI SylvaHero (Living Green): public/landing-pages/inner-green-3d.html and its assets are byte-exact vendored files; never edit them — change copy/links at runtime in HeroSection's applyScene.
- Vendored ThreeUI TS files in src/shaders carry @ts-nocheck to stay verbatim under strict TS.
- The hero iframe mounts client-only so the page hydrates before the heavy WebGL scene starts.
