import { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
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
    <div className="min-h-screen" style={{ cursor: "none" }}>
      {/* Scroll progress bar */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "var(--color-violet)",
          scaleX,
          transformOrigin: "left",
          opacity,
          zIndex: 200,
        }}
      />
      <CustomCursor />
      <Navbar />
      <Hero />
      <HowItWorks />
      {/* Ambient accent between pipeline and features */}
      <div className="relative w-full" style={{ height: 1, overflow: "visible" }}>
        <div
          className="absolute left-1/2"
          style={{
            width: 600,
            height: 120,
            marginLeft: -300,
            top: -60,
            background: "radial-gradient(ellipse at center, rgba(167,139,250,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>
      <Features />
      <ClipShowcase />
      <TryItBar />
      <Footer />
    </div>
  );
};

export default Index;
