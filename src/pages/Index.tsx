import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PipelineDemos from "@/components/landing/PipelineDemos";
import ClipShowcase from "@/components/landing/ClipShowcase";
import TryItBar from "@/components/landing/TryItBar";
import Footer from "@/components/landing/Footer";
import CustomCursor from "@/components/landing/CustomCursor";

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.03], [0, 1]);

  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div className="min-h-screen relative" style={{ cursor: "none", background: "#09090B" }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(circle at 50% -8%, rgba(167,139,250,0.12) 0%, rgba(10,9,11,0) 34%), radial-gradient(circle at 14% 30%, rgba(34,211,238,0.08) 0%, rgba(10,9,11,0) 26%), radial-gradient(circle at 86% 24%, rgba(167,139,250,0.08) 0%, rgba(10,9,11,0) 30%), linear-gradient(180deg, #0B0A10 0%, #09090B 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          opacity: 0.36,
          backgroundImage: "radial-gradient(rgba(196,181,253,0.45) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "#A78BFA",
          scaleX,
          transformOrigin: "left",
          opacity,
          zIndex: 200,
        }}
      />
      <div className="relative z-10">
        <CustomCursor />
        <Navbar />
        <Hero />
        <HowItWorks />
        <PipelineDemos />
        <ClipShowcase />
        <TryItBar />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
