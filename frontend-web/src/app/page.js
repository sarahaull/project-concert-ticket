// app/page.js
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowToBook from '@/components/HowToBook';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-ivory text-navy">
      <Navbar />
      <Hero />
      <Features />
      <HowToBook />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}