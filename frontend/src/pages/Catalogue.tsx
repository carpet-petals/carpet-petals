import { useEffect, useState } from "react";
import { Download, Loader } from "lucide-react";
import { getProducts, getCategories } from "../services/api";
import type { Product, Category } from "../types";

export default function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([pr, cr]) => {
        setProducts(pr.data.data);
        setCategories(cr.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function generatePDF() {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;
      const margin = 20;
      let y = margin;

      // Colors
      const accent = [139, 94, 60] as [number, number, number];
      const dark = [28, 25, 23] as [number, number, number];
      const muted = [107, 101, 96] as [number, number, number];
      const light = [242, 237, 230] as [number, number, number];

      // Cover Page
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageW, pageH, "F");

      doc.setFillColor(...accent);
      doc.rect(margin, 80, 40, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text("CARPET PETALS", margin, 100);

      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255, 0.7);
      doc.text("Handmade Carpets · Tibetan Rugs · Persian Rugs", margin, 115);

      doc.setFontSize(10);
      doc.setTextColor(160, 150, 140);
      doc.text("Manufacturer, Supplier & Exporter", margin, 128);
      doc.text("Est. 2016 · Varanasi, Uttar Pradesh, India", margin, 136);

      doc.setFontSize(9);
      doc.text(`Product Catalogue — ${new Date().getFullYear()}`, margin, pageH - 20);
      doc.text(`${products.length} Products`, pageW - margin, pageH - 20, { align: "right" });

      // Categories Summary Page
      doc.addPage();
      y = margin;

      doc.setFillColor(...accent);
      doc.rect(0, 0, pageW, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CARPET PETALS — PRODUCT CATALOGUE", margin, 8);

      y = 30;
      doc.setTextColor(...dark);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Our Collections", margin, y);
      y += 10;

      doc.setFillColor(...accent);
      doc.rect(margin, y, 30, 1.5, "F");
      y += 12;

      categories.forEach((cat) => {
        if (y > pageH - 40) { doc.addPage(); y = 30; }
        doc.setFillColor(...light);
        doc.rect(margin, y, pageW - margin * 2, 22, "F");
        doc.setTextColor(...dark);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(cat.name, margin + 6, y + 9);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        if (cat.subcategories?.length > 0) {
          doc.text(cat.subcategories.map((s) => s.name).join("  ·  "), margin + 6, y + 17);
        }
        y += 28;
      });

      // Products Pages
      for (const cat of categories) {
        const catProducts = products.filter((p) => typeof p.category === "object" && p.category._id === cat._id);
        if (catProducts.length === 0) continue;

        doc.addPage();
        y = 30;

        doc.setFillColor(...accent);
        doc.rect(0, 0, pageW, 12, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("CARPET PETALS — PRODUCT CATALOGUE", margin, 8);

        doc.setTextColor(...dark);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(cat.name, margin, y);
        y += 6;
        doc.setFillColor(...accent);
        doc.rect(margin, y, 25, 1, "F");
        y += 10;

        for (const product of catProducts) {
          if (y > pageH - 50) { doc.addPage(); y = 30; }

          doc.setFillColor(...light);
          doc.rect(margin, y, pageW - margin * 2, 40, "F");

          doc.setFillColor(...accent);
          doc.rect(margin, y, 3, 40, "F");

          doc.setTextColor(...dark);
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(product.title, margin + 10, y + 10);

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...muted);

          let detailY = y + 18;
          if (product.subcategory) {
            doc.text(`Type: ${product.subcategory}`, margin + 10, detailY);
            detailY += 6;
          }
          if (product.material) {
            doc.text(`Material: ${product.material}`, margin + 10, detailY);
            detailY += 6;
          }
          if (product.dimensions) {
            doc.text(`Size: ${product.dimensions}`, margin + 10, detailY);
          }

          if (product.description) {
            doc.setFontSize(8);
            doc.setTextColor(...muted);
            const lines = doc.splitTextToSize(product.description, pageW - margin * 2 - 15);
            doc.text(lines[0] + (lines.length > 1 ? "..." : ""), margin + 10, y + 36);
          }

          y += 46;
        }
      }

      // Back Page
      doc.addPage();
      doc.setFillColor(...dark);
      doc.rect(0, 0, pageW, pageH, "F");

      doc.setFillColor(...accent);
      doc.rect(margin, 100, 40, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Get in Touch", margin, 120);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(160, 150, 140);
      doc.text("Plot No. D-1, Small Industrial Estate,", margin, 135);
      doc.text("Chandpur, Varanasi, UP - 221106, India", margin, 143);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("For bulk orders, export enquiries, or pricing:", margin, 158);
      doc.setTextColor(...accent);
      doc.setFontSize(11);
      doc.text("+91 XXXXX XXXXX", margin, 168);
      doc.text("info@carpetpetals.com", margin, 177);

      doc.save(`Carpet-Petals-Catalogue-${new Date().getFullYear()}.pdf`);
    } catch (err) {
      alert("PDF generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Catalogue</p>
          <h1 className="section-title mb-4">Product Catalogue</h1>
          <p className="text-text-secondary leading-relaxed">
            Download our complete product catalogue as a PDF to browse our collections offline or share with your team.
          </p>
        </div>

        <div className="bg-surface border border-border p-8 text-center">
          <div className="w-16 h-16 bg-accent-light flex items-center justify-center mx-auto mb-6">
            <Download size={24} className="text-accent" />
          </div>
          <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
            Carpet Petals — Full Catalogue
          </h2>
          <p className="text-sm text-text-secondary mb-2">
            Includes all categories, subcategories and products.
          </p>
          {loading ? (
            <p className="text-sm text-text-muted mb-6">Loading catalogue data...</p>
          ) : (
            <p className="text-sm text-text-muted mb-6">
              {products.length} products across {categories.length} categories
            </p>
          )}
          <button
            onClick={generatePDF}
            disabled={generating || loading}
            className="btn-primary px-8 py-3.5 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader size={16} className="animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF Catalogue
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-text-muted text-center mt-6">
          The catalogue is generated live with your latest products from the admin dashboard.
        </p>
      </div>
    </div>
  );
}