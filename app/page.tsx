import Hero from "@/components/home/Hero";
import Collection from "@/components/home/Collection";
import Families from "@/components/home/Families";
import Spotlight3D from "@/components/home/Spotlight3D";
import Bestsellers from "@/components/home/Bestsellers";
import Icons from "@/components/home/Icons";
import Craft from "@/components/home/Craft";
import Promises from "@/components/home/Promises";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <Collection />
      <Families />
      <Spotlight3D />
      <Bestsellers />
      <Icons />
      <Craft />
      <Promises />
      <Testimonials />
    </>
  );
}
