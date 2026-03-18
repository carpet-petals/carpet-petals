import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CollectionsPreview from "../components/home/CollectionsPreview";
import WhyUsSection from "../components/home/WhyUsSection";
import ContactCTA from "../components/home/ContactCTA";
import { getFeaturedProducts, getCategories } from "../services/api";
import type { Product, Category } from "../types";

export default function Home() {
  const [products,   setProducts]   = useState<Product[]  | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  useEffect(() => {
    // Hero + About are hardcoded — zero API wait, instant render above the fold.
    // Only truly dynamic data (inventory) is fetched here.
    getFeaturedProducts()
      .then((r) => setProducts(r.data.data ?? []))
      .catch(() => setProducts([]));

    getCategories()
      .then((r) => setCategories(r.data.data.slice(0, 3) ?? []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedProducts   products={products} />
      <CollectionsPreview categories={categories} />
      <WhyUsSection />
      <ContactCTA />
    </>
  );
}