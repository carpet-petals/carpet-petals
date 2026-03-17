import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { getCategories } from "../../services/api";
import type { Category } from "../../types";

export default function CollectionsPreview() {
  const [categories, setCategories] = useState<Category[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data.slice(0, 3)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="section-padding bg-surface" id="collections">
      <div className="container-max">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Our Collections</p>
            <h2 className="section-title">Carpets for Every Space</h2>
          </div>
          <Link to="/collections" className="flex items-center gap-2 text-sm text-accent font-medium hover:text-accent-hover transition-colors shrink-0">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/3] bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Link to={`/collections/${cat.slug}`} className="group block card">
                  <div className="aspect-[4/3] overflow-hidden bg-surface">
                    {cat.coverImage ? (
                      <img src={cat.coverImage} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface">
                        <span className="text-text-muted text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && <p className="text-sm text-text-secondary">{cat.description}</p>}
                    {cat.subcategories?.length > 0 && (
                      <p className="text-xs text-text-muted mt-2">
                        {cat.subcategories.map(s => s.name).join(" · ")}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs text-accent mt-3 font-medium">
                      Explore <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}