import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { getAboutContent } from "../../services/api";
import type { AboutContent } from "../../types";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

const facts = [
  { value: "2016", label: "Established" },
  { value: "2", label: "Categories" },
  { value: "100%", label: "Handmade" },
  { value: "Export", label: "Ready" },
];

export default function AboutSection() {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    getAboutContent()
      .then((res) => setAbout(res.data.data))
      .catch(() => setAbout(null));
  }, []);

  const image = about?.image || FALLBACK_IMAGE;
  const headline = about?.headline || "A Legacy of Craft from Varanasi";
  const body = about?.body || "Founded in 2016, Carpet Petals is a Varanasi-based manufacturer, supplier, and trader of premium handmade carpets. Rooted in the rich weaving traditions of Uttar Pradesh, we bring skilled craftsmanship to every piece we produce. Our collection spans handmade carpets, Tibetan rugs, and Persian rugs — each crafted by experienced artisans using time-honoured techniques. We serve bulk buyers, interior designers, and international exporters seeking authentic quality carpets directly from the source.";

  return (
    <section className="section-padding bg-background" id="about">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img src={image} alt="Artisan weaving a handmade carpet" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/30 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">About Carpet Petals</p>
            <h2 className="section-title mb-6">{headline}</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              {body.split("\n").filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-10 border-t border-border">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <p className="font-display text-2xl font-semibold text-accent">{fact.value}</p>
                  <p className="text-xs text-text-muted mt-1 tracking-wide uppercase">{fact.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}