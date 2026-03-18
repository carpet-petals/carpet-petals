import { useEffect, useState } from "react";
import { Star, StarOff, Loader } from "lucide-react";
import api, { getProducts } from "../../services/api";
import type { Product } from "../../types";

function getCategoryName(category: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "object" && category !== null) return category.name || "";
  return "";
}

export default function FeaturedAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState<"all" | "featured">("all");

  async function load() {
    setError("");
    try {
      const pr = await getProducts();
      setProducts(pr.data.data || []);
    } catch {
      setError("Failed to load products. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleFeatured(product: Product) {
    setToggling(product._id);
    setError("");
    try {
      await api.put(`/products/${product._id}`, {
        title:       product.title,
        category:    typeof product.category === "object" ? product.category._id : product.category,
        subcategory: product.subcategory  || "",
        description: product.description || "",
        material:    product.material    || "",
        dimensions:  product.dimensions  || "",
        images:      product.images      || [],
        featured:    !product.featured,
        seo:         product.seo         || {},
      });
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, featured: !p.featured } : p)
      );
    } catch {
      setError(`Failed to update "${product.title}". Please try again.`);
    } finally {
      setToggling(null);
    }
  }

  const displayed     = filter === "featured" ? products.filter((p) => p.featured) : products;
  const featuredCount = products.filter((p) => p.featured).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 bg-surface animate-pulse w-56 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-20 bg-surface animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">Featured Products</h1>
          <p className="text-sm text-text-muted mt-1">
            {featuredCount} of {products.length} product{products.length !== 1 ? "s" : ""} featured · shown on homepage
          </p>
        </div>
        <div className="flex border border-border overflow-hidden">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm transition-colors ${filter === "all" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary bg-background"}`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilter("featured")}
            className={`px-4 py-2 text-sm transition-colors border-l border-border ${filter === "featured" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary bg-background"}`}
          >
            Featured ({featuredCount})
          </button>
        </div>
      </div>

      <div className="bg-accent-light border border-accent/20 px-4 py-3 mb-6 flex items-start gap-3">
        <Star size={15} className="text-accent mt-0.5 shrink-0" />
        <p className="text-sm text-text-secondary">
          Featured products appear in the <strong className="text-text-primary">Featured Pieces</strong> section on the homepage.
          Toggle the star to feature or unfeature a product instantly.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 mb-6" role="alert">
          {error}
        </div>
      )}

      {displayed.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border">
          <Star size={24} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            {filter === "featured"
              ? "No featured products yet. Star a product to feature it."
              : "No products found."}
          </p>
          {filter === "featured" && (
            <button onClick={() => setFilter("all")} className="text-accent text-sm mt-2 hover:underline">
              View all products
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {displayed.map((product) => {
          const catName    = getCategoryName(product.category);
          const isToggling = toggling === product._id;

          return (
            <div
              key={product._id}
              className={`bg-white border p-4 flex items-center gap-4 transition-colors ${
                product.featured ? "border-accent/40 bg-accent-light/20" : "border-border"
              }`}
            >
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-16 h-16 object-cover border border-border shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-16 h-16 bg-surface border border-border shrink-0 flex items-center justify-center">
                  <span className="text-text-muted text-[10px] text-center leading-tight px-1">No image</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text-primary truncate">{product.title}</p>
                  {product.featured && (
                    <span className="text-[10px] bg-accent text-white px-2 py-0.5 uppercase tracking-wide shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {catName
                    ? catName + (product.subcategory ? " · " + product.subcategory : "")
                    : <span className="text-red-400">No category</span>
                  }
                </p>
                {product.material && (
                  <p className="text-xs text-text-muted">{product.material}</p>
                )}
              </div>

              <button
                onClick={() => toggleFeatured(product)}
                disabled={isToggling}
                title={product.featured ? "Remove from featured" : "Add to featured"}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm border transition-colors disabled:opacity-60 ${
                  product.featured
                    ? "border-accent text-accent hover:bg-red-50 hover:border-red-300 hover:text-red-500"
                    : "border-border text-text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {isToggling ? (
                  <Loader size={15} className="animate-spin" />
                ) : product.featured ? (
                  <StarOff size={15} />
                ) : (
                  <Star size={15} />
                )}
                {isToggling ? "Saving…" : product.featured ? "Unfeature" : "Feature"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}