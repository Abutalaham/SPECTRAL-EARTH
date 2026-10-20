/*
 * SylvaHero — Living Green, from the ThreeUI registered source (LandingPages.tsx).
 * Only the `living-green` variant is shipped here: it loads the byte-exact
 * authored page from /landing-pages/inner-green-3d.html and applies the
 * typography recipe on top, exactly like the upstream component.
 */
import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
import { splitTypographyProps, usePageTypography, type PageTypographyProps } from "./pageTypography";
import { SYLVA_TYPOGRAPHY } from "./pageRecipes";
import "../threeui.css";

export const SYLVA_HERO_VARIANTS = ["living-green"] as const;
export type SylvaHeroVariant = (typeof SYLVA_HERO_VARIANTS)[number];
export type SylvaHeroProps = LandingPageProps & PageTypographyProps & { variant?: SylvaHeroVariant };

const SYLVA_HERO_BASE_URL = "/landing-pages/inner-green-3d.html";

export function SylvaHero({ variant = "living-green", ...props }: SylvaHeroProps) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(SYLVA_TYPOGRAPHY, type);
  return (
    <LandingPageFrame
      {...frame}
      key={variant}
      customization={customization}
      title="Spectral Earth — hero"
      sourceUrl={SYLVA_HERO_BASE_URL}
    />
  );
}
