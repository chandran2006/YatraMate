import Layout from "@/components/layout/Layout";
import HeroSlider from "@/components/home/HeroSlider";
import PopularDestinations from "@/components/home/PopularDestinations";
import FeaturesSection from "@/components/home/FeaturesSection";

const Index = () => (
  <Layout>
    <HeroSlider />
    <PopularDestinations />
    <FeaturesSection />
  </Layout>
);

export default Index;
