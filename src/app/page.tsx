import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { ResumeExamples } from "@/components/landing/ResumeExamples";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <ResumeExamples />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
