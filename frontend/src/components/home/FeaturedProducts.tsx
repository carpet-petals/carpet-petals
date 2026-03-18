import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getFeaturedProducts } from "../../services/api";
import type { Product } from "../../types";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then((res) => setProducts(res.data.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="section-padding bg-surface">
      <div className="container-max">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Handpicked</p>
            <h2 className="section-title">Featured Pieces</h2>
          </div>
          <Link
            to="/collections"
            className="flex items-center gap-2 text-sm text-accent font-medium hover:text-accent-hover transition-colors shrink-0"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-[3/4] bg-background animate-pulse border border-border" />
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/product/${product._id}`} className="group block card">
                  <div className="aspect-[3/4] overflow-hidden bg-background">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-text-muted text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                      {product.title}
                    </h3>
                    {product.material && (
                      <p className="text-xs text-text-muted mt-1 uppercase tracking-wide">{product.material}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-accent mt-3 font-medium">
                      View Details <ArrowRight size={12} />
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