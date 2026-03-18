import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── HARDCODED — not editable from admin ─────────────────────────────────────
// To update: change these constants and redeploy.
const HERO_IMAGE   = "https://images.unsplash.com/photo-1573010309833-9992315801eb?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const HERO_TAGLINE = "Handwoven Carpets from the Heart of Varanasi";
const HERO_SUBTEXT = "Direct from our workshop to your space — crafted by artisan hands, built for lasting beauty.";
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background image — fetchPriority high = browser loads this before all else */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Handmade carpet craftsmanship"
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[#1C1917]/60" />
      </div>

      {/* Content — all static, animates in immediately on mount */}
      <div className="relative z-10 container-max px-4 sm:px-6 lg:px-8 text-center text-white">

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/60 mb-6"
        >
          Est. 2016 · Varanasi, India
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="font-display font-semibold text-hero text-white mb-6 text-balance"
        >
          {HERO_TAGLINE}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="text-base sm:text-lg text-white/65 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {HERO_SUBTEXT}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/collections"
            className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto justify-center"
          >
            View Collection <ArrowRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-3.5 text-sm font-medium w-full sm:w-auto hover:bg-white/10 transition-colors duration-200"
          >
            Contact Us
          </Link>
        </motion.div>

      </div>

      {/* Seamless gradient bleed into AboutSection (bg-background) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase text-white/40">Scroll</span>
        <div className="w-px h-8 bg-white/20 animate-pulse" />
      </motion.div>

    </section>
  );
}