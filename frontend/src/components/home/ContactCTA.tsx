import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getContactContent } from "../../services/api";
import type { ContactContent } from "../../types";

// ─── Replace with your real WhatsApp number (digits only, with country code) ──
const WHATSAPP_FALLBACK = "919XXXXXXXXX";
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactCTA() {
  const [contact, setContact] = useState<ContactContent | null>(null);

  useEffect(() => {
    getContactContent()
      .then((res) => setContact(res.data.data))
      .catch(() => setContact(null));
  }, []);

  // Use API value once loaded, fall back to constant while loading or on error.
  // Button is ALWAYS visible — never waits for API.
  const whatsappNumber = contact?.whatsapp?.replace(/\D/g, "") || WHATSAPP_FALLBACK;
  const whatsappUrl    = `https://wa.me/${whatsappNumber}`;

  return (
    // bg-background — alternates from WhyUsSection (bg-surface)
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="bg-admin-dark text-white px-8 py-16 md:py-20 text-center max-w-3xl mx-auto"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-white/40 mb-4">
            Get in Touch
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
            Looking for Carpets in Bulk?
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            We work directly with buyers, exporters, and interior designers.
            Reach out to discuss your requirements — no middlemen, no delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="btn-primary w-full sm:w-auto justify-center px-8 py-3.5"
            >
              <Phone size={16} />
              Contact Us
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3.5 text-sm font-medium w-full sm:w-auto hover:bg-white/10 transition-colors duration-200"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}