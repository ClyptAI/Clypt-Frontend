import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import TryItBar from "@/components/landing/TryItBar";
import Footer from "@/components/landing/Footer";
import CustomCursor from "@/components/landing/CustomCursor";

const Index = () => {
  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ cursor: "none" }}>
      <CustomCursor />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <TryItBar />
      <Footer />
    </div>
  );
};

export default Index;
