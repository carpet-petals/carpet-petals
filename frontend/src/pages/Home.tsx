import { Suspense } from "react";
import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CollectionsPreview from "../components/home/CollectionsPreview";
import WhyUsSection from "../components/home/WhyUsSection";

function AboutSkeleton() {
  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/5] bg-surface animate-pulse" />
          <div className="space-y-4">
            <div className="h-3 bg-surface animate-pulse w-32" />
            <div className="h-8 bg-surface animate-pulse w-3/4" />
            <div className="h-4 bg-surface animate-pulse w-full" />
            <div className="h-4 bg-surface animate-pulse w-5/6" />
            <div className="h-4 bg-surface animate-pulse w-4/6" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<AboutSkeleton />}>
        <AboutSection />
      </Suspense>
      <FeaturedProducts />
      <CollectionsPreview />
      <WhyUsSection />
    </>
  );
}