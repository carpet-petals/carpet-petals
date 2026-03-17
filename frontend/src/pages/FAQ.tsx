import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import api from "../services/api";
import SEOHead from "../components/SEOHead";

interface FaqItem { question: string; answer: string; }

export default function FAQ() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    api.get("/content/faq")
      .then((r) => setItems(r.data.data?.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <>
      <SEOHead title="FAQ" description="Frequently asked questions about Carpet Petals handmade carpets, orders and exports." />
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container-max px-4 sm:px-6 lg:px-8 max-w-2xl">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">Help</p>
          <h1 className="section-title mb-10">Frequently Asked Questions</h1>

          {items.length === 0 && (
            <p className="text-text-muted text-sm">No FAQs available yet.</p>
          )}

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="border border-border bg-surface">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-background transition-colors"
                >
                  <span className="text-sm font-medium text-text-primary pr-4 leading-snug">{item.question}</span>
                  {open === i
                    ? <ChevronUp size={16} className="text-accent shrink-0" />
                    : <ChevronDown size={16} className="text-text-muted shrink-0" />
                  }
                </button>
                {open === i && (
                  <div className="px-5 pb-5 border-t border-border">
                    <p className="text-sm text-text-secondary leading-relaxed pt-4">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-14 pt-10 border-t border-border text-center">
            <p className="text-text-secondary text-sm mb-4">Still have questions? We are happy to help.</p>
            
            <a  href="/contact"
              className="btn-primary px-8 py-3 inline-flex"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
}