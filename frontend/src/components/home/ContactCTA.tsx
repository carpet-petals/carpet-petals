import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageCircle } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { getContactContent } from "../../services/api";
import type { ContactContent } from "../../types";

export default function ContactCTA() {
  const [contact, setContact] = useState<ContactContent | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    getContactContent()
      .then((res) => setContact(res.data.data))
      .catch(() => setContact(null));
  }, []);

  const whatsappNumber = contact?.whatsapp?.replace(/\D/g, "") ?? "";
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
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

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-8 py-3.5 text-sm font-medium w-full sm:w-auto hover:bg-white/10 transition-colors duration-200"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}