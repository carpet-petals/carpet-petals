import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getProducts, getCategories } from "../services/api";
import type { Product, Category } from "../types";
import SEOHead from "../components/SEOHead";

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;
    Promise.all([getProducts(categorySlug), getCategories()])
      .then(([productsRes, catsRes]) => {
        setProducts(productsRes.data.data);
        const found = catsRes.data.data.find((c) => c.slug === categorySlug);
        setCategory(found || null);
      })
      .catch(() => { setProducts([]); setCategory(null); })
      .finally(() => setLoading(false));
  }, [categorySlug]);

  return (
    <>
      <SEOHead
        title={category?.seo?.metaTitle || category?.name}
        description={category?.seo?.metaDescription || category?.description}
      />
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container-max px-4 sm:px-6 lg:px-8">

          <Link to="/collections" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors mb-10">
            <ArrowLeft size={15} />
            All Collections
          </Link>

          <div className="mb-14 max-w-xl">
            <p className="text-xs tracking-[0.25em] uppercase text-accent mb-3">Collection</p>
            <h1 className="section-title mb-4">
              {category ? category.name : categorySlug?.replace(/-/g, " ")}
            </h1>
            {category?.description && (
              <p className="text-text-secondary leading-relaxed">{category.description}</p>
            )}
            {category?.subcategories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {category.subcategories.map((s) => (
                  <span key={s._id} className="text-xs bg-accent-light text-accent px-3 py-1 tracking-wide">
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-surface animate-pulse aspect-[3/4]" />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-24">
              <p className="text-text-muted text-sm">No products in this collection yet.</p>
              <Link to="/contact" className="btn-primary mt-6 inline-flex">Enquire Now</Link>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link to={`/product/${product._id}`} className="group block card">
                    <div className="aspect-[3/4] overflow-hidden bg-surface">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-surface flex items-center justify-center">
                          <span className="text-text-muted text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="font-display text-lg font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
                        {product.title}
                      </h2>
                      {product.subcategory && (
                        <p className="text-xs text-accent uppercase tracking-wide mb-0.5">{product.subcategory}</p>
                      )}
                      {product.material && (
                        <p className="text-xs text-text-muted uppercase tracking-wide">{product.material}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-accent mt-3 font-medium">
                        View Details <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}