import HeroSection from "../components/home/HeroSection";
import AboutSection from "../components/home/AboutSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import CollectionsPreview from "../components/home/CollectionsPreview";
import WhyUsSection from "../components/home/WhyUsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedProducts />
      <CollectionsPreview />
      <WhyUsSection />
    </>
  );
}