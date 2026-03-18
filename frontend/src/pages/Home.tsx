import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CollectionsPreview from "../components/home/CollectionsPreview";
import WhyUsSection from "../components/home/WhyUsSection";
import { getHeroContent, getAboutContent, getFeaturedProducts, getCategories } from "../services/api";
import type { HeroContent, AboutContent, Product, Category } from "../types";

interface HomeData {
  hero:       HeroContent | null;
  about:      AboutContent | null;
  products:   Product[];
  categories: Category[];
}

export default function Home() {
  const [data, setData]       = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getHeroContent(),
      getAboutContent(),
      getFeaturedProducts(),
      getCategories(),
    ]).then(([hero, about, products, categories]) => {
      setData({
        hero:       hero.status       === "fulfilled" ? hero.value.data.data           : null,
        about:      about.status      === "fulfilled" ? about.value.data.data          : null,
        products:   products.status   === "fulfilled" ? products.value.data.data ?? [] : [],
        categories: categories.status === "fulfilled" ? categories.value.data.data.slice(0, 3) : [],
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-screen bg-[#1C1917] animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <HeroSection    data={data?.hero       ?? null} />
      <AboutSection   data={data?.about      ?? null} />
      <FeaturedProducts products={data?.products   ?? []} />
      <CollectionsPreview categories={data?.categories ?? []} />
      <WhyUsSection />
    </>
  );
}