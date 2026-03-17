import { useEffect, useState } from "react";
import api from "../services/api";
import SEOHead from "../components/SEOHead";

export default function AboutUs() {
  const [data, setData] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    api.get("/content/aboutus")
      .then((r) => setData(r.data.data))
      .catch(() => setData(null));
  }, []);

  return (
    <>
      <SEOHead title="About Us" description="Learn about Carpet Petals — handmade carpet manufacturer from Varanasi, India." />
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container-max px-4 sm:px-6 lg:px-8 max-w-3xl">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-4">Our Story</p>
          <h1 className="section-title mb-10">{data?.title || "About Carpet Petals"}</h1>
          <div className="prose prose-sm max-w-none">
            {(data?.content || "Founded in 2016, Carpet Petals is a Varanasi-based manufacturer, supplier, and trader of premium handmade carpets.")
              .split("\n")
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="text-text-secondary leading-relaxed mb-5">{para}</p>
              ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 pt-10 border-t border-border">
            {[
              { value: "2016", label: "Established" },
              { value: "100%", label: "Handmade" },
              { value: "2", label: "Categories" },
              { value: "Export", label: "Ready" },
            ].map((fact) => (
              <div key={fact.label}>
                <p className="font-display text-2xl font-semibold text-accent">{fact.value}</p>
                <p className="text-xs text-text-muted mt-1 tracking-wide uppercase">{fact.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}