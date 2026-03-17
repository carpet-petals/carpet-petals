import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getCategories } from "../services/api";
import type { Category } from "../types";

export default function Collections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24 pb-20 bg-background min-h-screen">
      <div className="container-max px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-14 max-w-xl">
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Our Collections</p>
          <h1 className="section-title mb-4">Handcrafted Carpets</h1>
          <p className="text-text-secondary leading-relaxed">
            Each carpet is handmade by skilled artisans in Varanasi using
            traditional techniques passed down through generations.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-surface animate-pulse aspect-[4/3] rounded-sm" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-24">
            <p className="text-text-muted text-sm">No collections available yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/collections/${cat.slug}`} className="group block card">
                  <div className="aspect-[4/3] overflow-hidden bg-surface">
                    {cat.coverImage ? (
                      <img
                        src={cat.coverImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center">
                        <span className="text-text-muted text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-xl font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className="text-sm text-text-secondary leading-relaxed">{cat.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs text-accent mt-3 font-medium">
                      View Products <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}