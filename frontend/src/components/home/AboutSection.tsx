import { motion } from "framer-motion";

// ─── HARDCODED — not editable from admin ─────────────────────────────────────
// To update: change these constants and redeploy.
const ABOUT_IMAGE    = "https://images.unsplash.com/photo-1617694820985-a5476fe22722?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const ABOUT_HEADLINE = "A Legacy of Craft from Varanasi";
const ABOUT_BODY     = [
  "Founded in 2016, Carpet Petals is a manufacturer, supplier, and trader of premium handmade carpets rooted in the weaving traditions of Varanasi, India.",
  "Every carpet that leaves our workshop is made entirely by hand — no shortcuts, no machines. We work directly with bulk buyers, exporters, and interior designers across India and abroad.",
];
const ABOUT_FACTS = [
  { value: "2016",   label: "Established" },
  { value: "100%",   label: "Handmade"    },
  { value: "Bulk",   label: "Orders"      },
  { value: "Export", label: "Ready"       },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutSection() {
  return (
    // bg-background — alternates cleanly from hero (dark) above
    <section className="section-padding bg-background" id="about">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image col */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden bg-surface">
              <img
                src={ABOUT_IMAGE}
                alt="Artisan weaving a handmade carpet"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            {/* Decorative offset border */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/30 -z-10" />
          </motion.div>

          {/* Text col */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">
              About Carpet Petals
            </p>

            <h2 className="section-title mb-6">{ABOUT_HEADLINE}</h2>

            <div className="space-y-4 text-text-secondary leading-relaxed">
              {ABOUT_BODY.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-10 border-t border-border">
              {ABOUT_FACTS.map((fact, i) => (
                <motion.div
                  key={fact.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                >
                  <p className="font-display text-2xl font-semibold text-accent">{fact.value}</p>
                  <p className="text-xs text-text-muted mt-1 tracking-wide uppercase">{fact.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}