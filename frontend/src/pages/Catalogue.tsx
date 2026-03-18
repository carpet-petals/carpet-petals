import { useEffect, useState } from "react";
import { Download, Loader, BookOpen, Package, Tag } from "lucide-react";
import { getProducts, getCategories, getContactContent } from "../services/api";
import type { Product, Category, ContactContent } from "../types";

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function Catalogue() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contact,    setContact]    = useState<ContactContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genStep,    setGenStep]    = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getContactContent()])
      .then(([pr, cr, co]) => {
        setProducts(pr.data.data);
        setCategories(cr.data.data);
        setContact(co.data.data);
      })
      .catch(() => setError("Failed to load catalogue data."))
      .finally(() => setLoading(false));
  }, []);

  async function generatePDF() {
    setGenerating(true);
    setError("");
    setGenStep("Loading PDF engine…");

    try {
      const { default: jsPDF } = await import("jspdf");

      const doc    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW  = 210;
      const pageH  = 297;
      const margin = 18;
      const colW   = (pageW - margin * 2 - 6) / 2;

      const C = {
        accent:     [139, 94,  60]  as [number, number, number],
        accentDark: [110, 72,  40]  as [number, number, number],
        dark:       [28,  25,  23]  as [number, number, number],
        mid:        [60,  54,  50]  as [number, number, number],
        muted:      [120, 112, 105] as [number, number, number],
        light:      [245, 240, 234] as [number, number, number],
        lighter:    [251, 248, 244] as [number, number, number],
        white:      [255, 255, 255] as [number, number, number],
        gold:       [196, 160, 100] as [number, number, number],
      };

      function addHeader(pageLabel?: string) {
        doc.setFillColor(...C.dark);
        doc.rect(0, 0, pageW, 11, "F");
        doc.setFillColor(...C.gold);
        doc.rect(0, 11, pageW, 0.6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(...C.gold);
        doc.text("CARPET PETALS", margin, 7.5);
        if (pageLabel) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...C.muted);
          doc.text(pageLabel.toUpperCase(), pageW - margin, 7.5, { align: "right" });
        }
      }

      function addFooter(pageNum: number, total: number) {
        doc.setFillColor(...C.light);
        doc.rect(0, pageH - 10, pageW, 10, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        doc.text("carpetpetals.com", margin, pageH - 3.5);
        doc.text(`${pageNum} / ${total}`, pageW - margin, pageH - 3.5, { align: "right" });
        doc.text(`© ${new Date().getFullYear()} Carpet Petals. All rights reserved.`, pageW / 2, pageH - 3.5, { align: "center" });
      }

      setGenStep("Building cover page…");

      doc.setFillColor(...C.dark);
      doc.rect(0, 0, pageW, pageH, "F");
      doc.setFillColor(...C.accent);
      doc.rect(0, 0, 6, pageH, "F");
      doc.setFillColor(...C.accentDark);
      doc.rect(pageW - 60, pageH - 60, 60, 60, "F");
      doc.setFillColor(...C.accent);
      doc.rect(pageW - 45, pageH - 45, 45, 45, "F");
      doc.setFillColor(...C.gold);
      doc.rect(pageW - 30, pageH - 30, 30, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.setTextColor(...C.white);
      doc.text("CARPET", margin + 10, 100);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(38);
      doc.setTextColor(...C.gold);
      doc.text("PETALS", margin + 10, 116);

      doc.setFillColor(...C.gold);
      doc.rect(margin + 10, 122, 60, 0.8, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(200, 190, 178);
      doc.text("Handmade Carpets  ·  Tibetan Rugs  ·  Persian Rugs", margin + 10, 132);
      doc.setFontSize(9);
      doc.setTextColor(...C.muted);
      doc.text("Manufacturer · Supplier · Exporter", margin + 10, 141);
      doc.text("Est. 2016 · Varanasi, Uttar Pradesh, India", margin + 10, 149);

      const stats = [
        { v: String(products.length),   l: "Products" },
        { v: String(categories.length), l: "Collections" },
        { v: "100%",                    l: "Handmade" },
        { v: "Export",                  l: "Ready" },
      ];
      const statW = (pageW - margin * 2 - 10) / stats.length;
      stats.forEach((s, i) => {
        const sx = margin + 10 + i * statW;
        doc.setFillColor(...C.accentDark);
        doc.rect(sx, 165, statW - 4, 24, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(...C.gold);
        doc.text(s.v, sx + (statW - 4) / 2, 175, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(180, 168, 155);
        doc.text(s.l.toUpperCase(), sx + (statW - 4) / 2, 182, { align: "center" });
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`Product Catalogue  ${new Date().getFullYear()}`, margin + 10, pageH - 18);

      setGenStep("Building contents page…");
      doc.addPage();
      addHeader("Table of Contents");

      let y = 28;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...C.dark);
      doc.text("Collections", margin, y);
      y += 5;
      doc.setFillColor(...C.accent);
      doc.rect(margin, y, 28, 1, "F");
      y += 10;

      categories.forEach((cat, idx) => {
        if (y > pageH - 30) { doc.addPage(); addHeader("Table of Contents"); y = 28; }

        const catProds = products.filter(
          (p) => typeof p.category === "object" && p.category._id === cat._id
        );

        const rowColor = idx % 2 === 0 ? C.lighter : C.light;
        doc.setFillColor(...rowColor);
        doc.rect(margin, y - 1, pageW - margin * 2, 18, "F");

        doc.setFillColor(...C.accent);
        doc.circle(margin + 3, y + 7, 1.8, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...C.dark);
        doc.text(cat.name, margin + 10, y + 7);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        if (cat.subcategories?.length > 0) {
          doc.text(cat.subcategories.map((s) => s.name).join("  ·  "), margin + 10, y + 13);
        }

        doc.setFillColor(...C.accent);
        doc.roundedRect(pageW - margin - 26, y + 2, 26, 10, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...C.white);
        doc.text(`${catProds.length} items`, pageW - margin - 13, y + 9, { align: "center" });

        y += 22;
      });

      addFooter(2, 99);

      let pageCount = 2;

      for (const cat of categories) {
        const catProducts = products.filter(
          (p) => typeof p.category === "object" && p.category._id === cat._id
        );
        if (catProducts.length === 0) continue;

        setGenStep(`Loading images for ${cat.name}…`);

        const imageMap = new Map<string, string | null>();
        await Promise.all(
          catProducts.map(async (product) => {
            const firstImg = product.images?.[0];
            if (firstImg) {
              imageMap.set(product._id, await urlToBase64(firstImg));
            }
          })
        );

        setGenStep(`Laying out ${cat.name}…`);
        doc.addPage();
        pageCount++;
        addHeader(cat.name);

        y = 26;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(...C.dark);
        doc.text(cat.name, margin, y);
        y += 4;
        doc.setFillColor(...C.accent);
        doc.rect(margin, y, 24, 1, "F");
        y += 8;

        if (cat.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(...C.muted);
          const descLines = doc.splitTextToSize(cat.description, pageW - margin * 2);
          doc.text(descLines.slice(0, 2), margin, y);
          y += descLines.slice(0, 2).length * 5 + 4;
        }

        let col = 0;
        const cardH   = 72;
        const imgSize = 28;

        for (const product of catProducts) {
          if (y + cardH > pageH - 16) {
            addFooter(pageCount, 99);
            doc.addPage();
            pageCount++;
            addHeader(cat.name);
            y = 26;
            col = 0;
          }

          const x = margin + col * (colW + 6);

          doc.setFillColor(...C.lighter);
          doc.rect(x, y, colW, cardH, "F");
          doc.setFillColor(...C.accent);
          doc.rect(x, y, 2.5, cardH, "F");

          const b64 = imageMap.get(product._id);
          if (b64) {
            try {
              doc.addImage(b64, "JPEG", x + 5, y + 5, imgSize, imgSize);
            } catch {
              doc.setFillColor(...C.light);
              doc.rect(x + 5, y + 5, imgSize, imgSize, "F");
              doc.setFont("helvetica", "normal");
              doc.setFontSize(6);
              doc.setTextColor(...C.muted);
              doc.text("No image", x + 5 + imgSize / 2, y + 5 + imgSize / 2, { align: "center" });
            }
          } else {
            doc.setFillColor(...C.light);
            doc.rect(x + 5, y + 5, imgSize, imgSize, "F");
          }

          const tx = x + 5 + imgSize + 4;
          const tw = colW - imgSize - 12;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(...C.dark);
          const titleLines = doc.splitTextToSize(product.title, tw);
          doc.text(titleLines.slice(0, 2), tx, y + 10);

          let dy = y + 10 + titleLines.slice(0, 2).length * 5 + 1;

          const tags: string[] = [];
          if (product.subcategory) tags.push(product.subcategory);
          if (product.material)    tags.push(product.material);
          if (tags.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(6.5);
            doc.setTextColor(...C.accent);
            doc.text(tags.join("  ·  "), tx, dy);
            dy += 5;
          }

          if (product.dimensions) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...C.muted);
            doc.text(`Size: ${product.dimensions}`, tx, dy);
          }

          if (product.description) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.setTextColor(...C.mid);
            const dLines = doc.splitTextToSize(product.description, colW - 10);
            doc.text(dLines.slice(0, 2), x + 5, y + imgSize + 8);
          }

          if (product.featured) {
            doc.setFillColor(...C.gold);
            doc.roundedRect(x + colW - 22, y + 3, 20, 7, 1.5, 1.5, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(5.5);
            doc.setTextColor(...C.dark);
            doc.text("FEATURED", x + colW - 12, y + 8, { align: "center" });
          }

          col = col === 0 ? 1 : 0;
          if (col === 0) y += cardH + 5;
        }

        if (col === 1) y += cardH + 5;

        addFooter(pageCount, 99);
      }

      setGenStep("Building contact page…");
      doc.addPage();
      pageCount++;

      doc.setFillColor(...C.dark);
      doc.rect(0, 0, pageW, pageH, "F");
      doc.setFillColor(...C.accent);
      doc.rect(0, 0, 6, pageH, "F");
      doc.setFillColor(...C.accentDark);
      doc.rect(pageW - 50, pageH - 50, 50, 50, "F");
      doc.setFillColor(...C.gold);
      doc.rect(pageW - 25, pageH - 25, 25, 25, "F");

      doc.setFillColor(...C.gold);
      doc.rect(margin + 10, 85, 40, 0.8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...C.white);
      doc.text("Get in Touch", margin + 10, 100);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(190, 178, 165);
      doc.text("For bulk orders, export enquiries, or custom requirements:", margin + 10, 112);

      const lines: { label: string; value: string }[] = [];
      if (contact?.address)  lines.push({ label: "Address",  value: contact.address });
      if (contact?.phone)    lines.push({ label: "Phone",    value: contact.phone });
      if (contact?.whatsapp) lines.push({ label: "WhatsApp", value: contact.whatsapp });
      if (contact?.email)    lines.push({ label: "Email",    value: contact.email });

      let cy = 124;
      lines.forEach(({ label, value }) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.muted);
        doc.text(label.toUpperCase(), margin + 10, cy);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(...C.gold);
        const vLines = doc.splitTextToSize(value, pageW - margin * 2 - 20);
        doc.text(vLines, margin + 10, cy + 6);
        cy += 6 + vLines.length * 5 + 6;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text("carpetpetals.com", margin + 10, pageH - 22);
      doc.text(
        `Catalogue generated ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
        margin + 10,
        pageH - 15
      );

      setGenStep("Saving PDF…");
      doc.save(`Carpet-Petals-Catalogue-${new Date().getFullYear()}.pdf`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`PDF generation failed: ${msg}`);
    } finally {
      setGenerating(false);
      setGenStep("");
    }
  }

  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + (cat.subcategories?.length ?? 0), 0
  );

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8 max-w-2xl">
        <div className="mb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Catalogue</p>
          <h1 className="section-title mb-4">Product Catalogue</h1>
          <p className="text-text-secondary leading-relaxed">
            Download our complete product catalogue as a professionally designed PDF —
            ready to share with buyers, exporters, and interior designers.
          </p>
        </div>

        <div className="bg-surface border border-border p-8">
          <div className="w-16 h-16 bg-accent-light flex items-center justify-center mx-auto mb-6">
            <BookOpen size={24} className="text-accent" />
          </div>

          <h2 className="font-display text-xl font-semibold text-text-primary text-center mb-1">
            Carpet Petals — Full Catalogue
          </h2>
          <p className="text-sm text-text-secondary text-center mb-6">
            All categories, subcategories, and product details with images.
          </p>

          {loading ? (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-background animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Package,  value: products.length,    label: "Products" },
                { icon: Tag,      value: categories.length,  label: "Collections" },
                { icon: BookOpen, value: totalSubcategories, label: "Subcategories" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="bg-background border border-border p-4 text-center">
                  <Icon size={16} className="text-accent mx-auto mb-2" />
                  <p className="font-display text-xl font-semibold text-text-primary">{value}</p>
                  <p className="text-xs text-text-muted mt-0.5 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border border-border p-4 mb-6 space-y-2">
            <p className="text-xs uppercase tracking-widest text-text-muted mb-3">What's included</p>
            {[
              "Cover page with brand identity",
              "Collections overview with subcategories",
              "All products with images, materials & dimensions",
              "Featured product badges",
              "Contact & ordering information",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 mb-4" role="alert">
              {error}
            </div>
          )}

          <button
            onClick={generatePDF}
            disabled={generating || loading}
            className="btn-primary w-full py-3.5 justify-center disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader size={16} className="animate-spin" />
                {genStep || "Generating…"}
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
          Generated live from the admin dashboard · Always up to date
        </p>
      </div>
    </div>
  );
}