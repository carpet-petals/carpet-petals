import { useState } from "react";
import { motion } from "framer-motion";
import type { AboutContent } from "../../types";

interface Props {
  data: AboutContent | null;
}

export default function AboutSection({ data }: Props) {
  const [imgError, setImgError] = useState(false);

  if (!data) return null;

  const { image, headline, body } = data;

  const facts = [
    data.established && { value: data.established, label: "Established" },
    data.location    && { value: data.location,    label: "Location" },
    { value: "100%",   label: "Handmade" },
    { value: "Export", label: "Ready" },
  ].filter(Boolean) as { value: string; label: string }[];

  return (
    <section className="section-padding bg-background" id="about">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden bg-surface">
              {image && !imgError ? (
                <img
                  src={image}
                  alt="Artisan weaving a handmade carpet"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <span className="text-xs text-text-muted tracking-widest uppercase">No image set</span>
                </div>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-accent/30 -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">About Carpet Petals</p>

            {headline && <h2 className="section-title mb-6">{headline}</h2>}

            {body && (
              <div className="space-y-4 text-text-secondary leading-relaxed">
                {body.split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {facts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10 pt-10 border-t border-border">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <p className="font-display text-2xl font-semibold text-accent">{fact.value}</p>
                    <p className="text-xs text-text-muted mt-1 tracking-wide uppercase">{fact.label}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}