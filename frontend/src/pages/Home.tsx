import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CollectionsPreview from "../components/home/CollectionsPreview";
import WhyUsSection from "../components/home/WhyUsSection";
import { getHeroContent, getAboutContent, getFeaturedProducts, getCategories } from "../services/api";
import type { HeroContent, AboutContent, Product, Category } from "../types";

export default function Home() {
  const [hero,       setHero]       = useState<HeroContent  | null>(null);
  const [about,      setAbout]      = useState<AboutContent | null>(null);
  const [products,   setProducts]   = useState<Product[]    | null>(null);
  const [categories, setCategories] = useState<Category[]   | null>(null);

  useEffect(() => {
    // Fire all requests in parallel — each updates independently as it resolves.
    // null = loading, [] / specific value = loaded (even if empty)
    getHeroContent()
      .then((r) => setHero(r.data.data))
      .catch(() => setHero({} as HeroContent));

    getAboutContent()
      .then((r) => setAbout(r.data.data))
      .catch(() => setAbout({} as AboutContent));

    getFeaturedProducts()
      .then((r) => setProducts(r.data.data ?? []))
      .catch(() => setProducts([]));

    getCategories()
      .then((r) => setCategories(r.data.data.slice(0, 3) ?? []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <>
      <HeroSection        data={hero} />
      <AboutSection       data={about} />
      <FeaturedProducts   products={products} />
      <CollectionsPreview categories={categories} />
      <WhyUsSection />
    </>
  );
}