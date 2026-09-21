import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ActionButton = ({ children, onClick, className }: ActionButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors cursor-pointer",
      className,
    )}
  >
    <span>{children}</span>
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
  </motion.button>
);

export interface AnimatedMarqueeHeroProps {
  tagline?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  ctaText?: ReactNode;
  onCtaClick?: () => void;
  images: string[];
  className?: string;
}

export const AnimatedMarqueeHero = ({
  tagline,
  title,
  description,
  ctaText = "Get Started",
  onCtaClick,
  images,
  className,
}: AnimatedMarqueeHeroProps) => {
  const FADE_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center text-center px-4",
        className,
      )}
    >
      <div className="z-10 flex flex-col items-center max-w-4xl mx-auto mb-12">
        {tagline && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE_ANIMATION_VARIANTS}
            className="mb-4 inline-block"
          >
            <span className="text-xs sm:text-sm font-medium text-neutral-400 border border-neutral-800 rounded-full px-3 py-1">
              {tagline}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, idx) => (
                <motion.span key={idx} variants={FADE_ANIMATION_VARIANTS} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_ANIMATION_VARIANTS}
          transition={{ delay: 0.3 }}
          className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-2xl mb-8"
        >
          {description}
        </motion.p>

        {ctaText && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE_ANIMATION_VARIANTS}
            transition={{ delay: 0.4 }}
          >
            <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] pointer-events-none overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            ease: "linear",
            duration: 30,
            repeat: Infinity,
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 md:h-60 flex-shrink-0"
              style={{ rotate: `${index % 2 === 0 ? -2 : 3}deg` }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="w-full h-full object-cover rounded-xl shadow-lg border border-neutral-800"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedMarqueeHero;
