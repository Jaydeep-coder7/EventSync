import React from "react";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

const DEMO_HERO_3_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
];

export function Hero3Demo({ onExploreClick }: { onExploreClick?: () => void }) {
  return (
    <AnimatedMarqueeHero
      tagline="✨ Join over 100,000 live event lovers"
      title={
        <>
          <span>Engage Audiences</span>
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-violet-300 bg-clip-text text-transparent">
            with Unforgettable Events
          </span>
        </>
      }
      description="Discover live concerts, high-energy sports, and exclusive cultural festivals. Verified tickets with zero hidden fees and instant entry passes."
      ctaText="Explore Events Now"
      onCtaClick={onExploreClick}
      images={DEMO_HERO_3_IMAGES}
    />
  );
}

export default Hero3Demo;
