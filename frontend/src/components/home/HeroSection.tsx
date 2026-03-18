import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { HeroContent } from "../../types";

interface Props {
  data: HeroContent | null;
}

export default function HeroSection({ data }: Props) {
  const [imgError, setImgError] = useState(false);

  const bgImage = data?.backgroundImage;
  const tagline = data?.tagline ?? "";
  const subtext = data?.subtext ?? "";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {bgImage && !imgError ? (
          <img
            src={bgImage}
            alt="Handmade carpet craftsmanship"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#1C1917]" />
        )}
        <div className="absolute inset-0 bg-[#1C1917]/60" />
      </div>

      <div className="relative z-10 container-max px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/60 mb-6"
        >
          Est. 2016 · Varanasi, India
        </motion.p>

        {tagline && (
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display font-semibold text-hero text-white mb-6 text-balance"
          >
            {tagline}
          </motion.h1>
        )}

        {subtext && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg text-white/65 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            {subtext}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/collections" className="btn-primary text-sm px-8 py-3.5 w-full sm:w-auto justify-center">
            View Collection
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-8 py-3.5 text-sm font-medium w-full sm:w-auto hover:bg-white/10 transition-colors duration-200"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />

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