import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const reasons = [
  {
    title: "Direct from Manufacturer",
    description: "No middlemen. You deal directly with us — the people who make the carpets.",
  },
  {
    title: "Export-Ready Quality",
    description: "Our carpets meet international quality standards and are trusted by buyers globally.",
  },
  {
    title: "Fully Customisable",
    description: "Custom sizes, colours, and patterns available for bulk and wholesale orders.",
  },
  {
    title: "Rooted in Varanasi",
    description: "Varanasi has been the heartland of Indian handloom for centuries. Our craft carries that legacy.",
  },
];

export default function WhyUsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">Why Carpet Petals</p>
            <h2 className="section-title mb-6">
              Craftsmanship You Can<br />
              <span className="italic font-normal">Trust Completely</span>
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              We are not a showroom or a reseller. We are the makers.
              Every carpet that leaves our facility in Varanasi is made
              by hand, inspected personally, and backed by years of
              experience in serving bulk buyers and exporters.
            </p>
            <Link to="/collections" className="btn-primary px-8 py-3.5">
              Browse Collections <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {reasons.map((r, i) => (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-surface border border-border p-5"
              >
                <div className="w-8 h-0.5 bg-accent mb-4" />
                <h3 className="font-display text-base font-semibold text-text-primary mb-2">{r.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{r.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}