import Navbar from "@/components/landing-page/Navbar";
import Hero from "@/components/landing-page/Hero";
import Concerts from "@/components/landing-page/Concerts";
import Features from "@/components/landing-page/Features";
import HowToBook from "@/components/landing-page/HowToBook";
import Stats from "@/components/landing-page/Stats";
import Testimonials from "@/components/landing-page/Testimonials";
import CTA from "@/components/landing-page/CTA";
import Footer from "@/components/landing-page/Footer";

export const metadata = {
  title: "TicketVerse | Platform Tiket Konser & Festival Resmi #1 Indonesia",
  description:
    "Akses resmi dan terpercaya tiket konser musik musisi idola, festival akbar, dan tur spektakuler di seluruh Indonesia dengan jaminan e-tiket QR instan.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#040814] text-white selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* 1. Header & Navigation */}
      <Navbar />

      {/* 2. Hero Section with Particle Canvas & Live Search */}
      <Hero />

      {/* 3. Trending & Upcoming Concerts with Category Filters */}
      <Concerts />

      {/* 4. Why TicketVerse Bento Features */}
      <Features />

      {/* 5. 4-Step How to Book Timeline */}
      <HowToBook />

      {/* 6. Live Interactive Stats & Venue Partners */}
      <Stats />

      {/* 7. Audience Stories & Testimonials Carousel */}
      <Testimonials />

      {/* 8. High-Impact VIP Conversion CTA */}
      <CTA />

      {/* 9. Comprehensive Footer & Newsletter */}
      <Footer />
    </main>
  );
}
