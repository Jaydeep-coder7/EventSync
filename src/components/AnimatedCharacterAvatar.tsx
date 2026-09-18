import React from "react";
import { motion } from "motion/react";

export type AvatarGender = "boy" | "girl" | "male" | "female";

interface AnimatedCharacterAvatarProps {
  gender?: AvatarGender;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showOnlineBadge?: boolean;
  interactive?: boolean;
}

const SIZE_MAP = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
  "2xl": "h-32 w-32",
};

export const AnimatedCharacterAvatar: React.FC<AnimatedCharacterAvatarProps> = ({
  gender = "boy",
  size = "md",
  className = "",
  showOnlineBadge = false,
  interactive = false,
}) => {
  const isGirl = gender === "girl" || gender === "female";
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.06, rotate: isGirl ? 1.5 : -1.5 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden select-none ${sizeClasses} ${className}`}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br transition-colors duration-500 ${
          isGirl
            ? "from-rose-500/25 via-purple-500/20 to-amber-500/20"
            : "from-amber-500/25 via-yellow-500/20 to-emerald-500/20"
        }`}
      />

      {/* High-Quality Animated SVG Character */}
      {isGirl ? (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-full w-full object-contain drop-shadow-md"
        >
          <defs>
            {/* Gradients */}
            <linearGradient
              id="girl-hair"
              x1="20"
              y1="10"
              x2="100"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#7c2d12" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient
              id="girl-skin"
              x1="40"
              y1="30"
              x2="80"
              y2="85"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
            <linearGradient
              id="girl-jacket"
              x1="30"
              y1="80"
              x2="90"
              y2="120"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#db2777" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>

          {/* Floating character wrapper */}
          <motion.g
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          >
            {/* Back Hair */}
            <path
              d="M32 45 C20 60 22 92 35 105 C42 98 42 85 45 75 Z"
              fill="url(#girl-hair)"
              opacity="0.9"
            />
            <path
              d="M88 45 C100 60 98 92 85 105 C78 98 78 85 75 75 Z"
              fill="url(#girl-hair)"
              opacity="0.9"
            />

            {/* Neck & Torso */}
            <path d="M54 70 L66 70 L68 85 L52 85 Z" fill="url(#girl-skin)" />
            {/* Stylish Jacket */}
            <path
              d="M35 88 C40 82 50 80 60 80 C70 80 80 82 85 88 L92 120 L28 120 Z"
              fill="url(#girl-jacket)"
            />
            {/* Inner Top Collar */}
            <path d="M50 82 Q60 95 70 82" stroke="#ffffff" strokeWidth="2.5" fill="none" />

            {/* Face Shape */}
            <motion.ellipse cx="60" cy="54" rx="24" ry="26" fill="url(#girl-skin)" />

            {/* Rosy Cheeks */}
            <circle cx="45" cy="62" r="4.5" fill="#f43f5e" opacity="0.35" />
            <circle cx="75" cy="62" r="4.5" fill="#f43f5e" opacity="0.35" />

            {/* Eyes with Animated Blinking */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.08, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4.5,
                times: [0, 0.9, 0.94, 1],
                ease: "easeInOut",
              }}
              style={{ originX: "60px", originY: "52px" }}
            >
              {/* Left Eye */}
              <ellipse cx="48" cy="52" rx="4" ry="5.5" fill="#1e1b4b" />
              <circle cx="46.5" cy="50" r="1.6" fill="#ffffff" />
              <circle cx="49.5" cy="53.5" r="0.8" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="72" cy="52" rx="4" ry="5.5" fill="#1e1b4b" />
              <circle cx="70.5" cy="50" r="1.6" fill="#ffffff" />
              <circle cx="73.5" cy="53.5" r="0.8" fill="#ffffff" />
            </motion.g>

            {/* Eyebrows */}
            <path
              d="M43 45 Q48 42 53 44"
              stroke="#78350f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M67 44 Q72 42 77 45"
              stroke="#78350f"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Cute Smile */}
            <path
              d="M55 64 Q60 69 65 64"
              stroke="#be123c"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Front Bangs & Styled Hair */}
            <motion.path
              d="M34 46 C34 26 50 18 60 18 C74 18 86 26 86 46 C84 40 76 34 68 34 C58 34 50 38 46 42 C40 38 36 40 34 46 Z"
              fill="url(#girl-hair)"
            />
            {/* Side strands */}
            <path d="M34 44 C34 55 37 68 40 72 C37 64 36 52 38 44 Z" fill="url(#girl-hair)" />
            <path d="M86 44 C86 55 83 68 80 72 C83 64 84 52 82 44 Z" fill="url(#girl-hair)" />

            {/* Golden Hair Star/Clip Accessory */}
            <motion.g
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.12, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ originX: "78px", originY: "34px" }}
            >
              <circle cx="78" cy="34" r="5" fill="#fbbf24" />
              <circle cx="78" cy="34" r="2" fill="#fffbeb" />
            </motion.g>
          </motion.g>
        </svg>
      ) : (
        /* Boy Animated SVG Character */
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-full w-full object-contain drop-shadow-md"
        >
          <defs>
            <linearGradient
              id="boy-hair"
              x1="30"
              y1="12"
              x2="90"
              y2="50"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient
              id="boy-skin"
              x1="40"
              y1="30"
              x2="80"
              y2="85"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
            <linearGradient
              id="boy-hoodie"
              x1="30"
              y1="80"
              x2="90"
              y2="120"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>

          {/* Floating Character motion */}
          <motion.g
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {/* Neck & Shoulders */}
            <path d="M53 68 L67 68 L70 85 L50 85 Z" fill="url(#boy-skin)" />
            {/* Modern Streetwear Hoodie */}
            <path
              d="M32 86 C38 80 50 78 60 78 C70 78 82 80 88 86 L94 120 L26 120 Z"
              fill="url(#boy-hoodie)"
            />
            {/* Hoodie Strings */}
            <path d="M54 84 L53 100" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
            <path d="M66 84 L67 100" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />

            {/* Face Shape */}
            <motion.ellipse cx="60" cy="53" rx="24" ry="25" fill="url(#boy-skin)" />

            {/* Subtle Blush */}
            <circle cx="44" cy="61" r="4" fill="#f97316" opacity="0.25" />
            <circle cx="76" cy="61" r="4" fill="#f97316" opacity="0.25" />

            {/* Eyes with Animated Blinking */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.08, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4.2,
                times: [0, 0.9, 0.94, 1],
                ease: "easeInOut",
              }}
              style={{ originX: "60px", originY: "52px" }}
            >
              {/* Left Eye */}
              <ellipse cx="48" cy="52" rx="4" ry="5" fill="#0f172a" />
              <circle cx="46.5" cy="50" r="1.5" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="72" cy="52" rx="4" ry="5" fill="#0f172a" />
              <circle cx="70.5" cy="50" r="1.5" fill="#ffffff" />
            </motion.g>

            {/* Bold Eyebrows */}
            <path
              d="M42 44 Q48 41 54 44"
              stroke="#0f172a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M66 44 Q72 41 78 44"
              stroke="#0f172a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Confident Smile */}
            <path
              d="M54 64 Q60 69 66 64"
              stroke="#9a3412"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cool Spiky/Undercut Hairstyle */}
            <motion.path
              d="M35 48 C33 34 38 20 54 16 C60 14 68 14 74 18 C82 22 86 32 85 46 C81 40 75 36 68 36 C60 36 53 40 46 45 C41 42 38 44 35 48 Z"
              fill="url(#boy-hair)"
            />
            {/* Front textured tufts */}
            <path
              d="M50 18 Q56 10 63 16 Q68 11 74 18"
              fill="none"
              stroke="url(#boy-hair)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Sleek Earring / Earphone stud */}
            <motion.circle
              cx="35"
              cy="54"
              r="2.2"
              fill="#fbbf24"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.g>
        </svg>
      )}

      {/* Optional Online Badge */}
      {showOnlineBadge && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs" />
      )}
    </motion.div>
  );
};
