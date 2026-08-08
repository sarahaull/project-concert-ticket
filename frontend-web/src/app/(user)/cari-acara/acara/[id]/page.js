// pages/index.js atau app/page.js (tergantung versi Next.js)

import { useState } from 'react';
import Head from 'next/head';
import { Star, MapPin, Calendar, Clock, Music, Users, Ticket, ChevronRight } from 'lucide-react';

export default function EventDetail() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const ticketCategories = [
    { id: 'vip-standing', name: 'VIP Standing', price: 2500000, available: 120, icon: '🎫' },
    { id: 'vip-seated', name: 'VIP Seated', price: 2000000, available: 80, icon: '💺' },
    { id: 'festival', name: 'Festival', price: 1500000, available: 200, icon: '🎵' },
    { id: 'tribune', name: 'Tribune', price: 1000000, available: 300, icon: '🏟️' },
  ];

  const handleTicketSelect = (ticketId) => {
    setSelectedTicket(ticketId === selectedTicket ? null : ticketId);
  };

  const selectedTicketData = ticketCategories.find(t => t.id === selectedTicket);

  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <Head>
        <title>Coldplay - Music of The Spheres World Tour Jakarta</title>
        <meta name="description" content="Coldplay World Tour Jakarta 2025" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar */}
      <nav className="bg-[#112250] text-[#F5F4F0] p-4 fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6" />
            <span className="font-bold text-xl">TicketMaster</span>
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#" className="hover:text-[#BEB7A7] transition">Home</a>
            <a href="#" className="hover:text-[#BEB7A7] transition">Events</a>
            <a href="#" className="hover:text-[#BEB7A7] transition">My Tickets</a>
          </div>
          <button className="bg-[#BEB7A7] text-[#112250] px-4 py-2 rounded-lg font-semibold hover:bg-[#E7E2CE] transition">
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20">
        <div className="relative h-[60vh] bg-gradient-to-r from-[#112250] to-[#3B507D] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
            <div className="text-center text-[#F5F4F0] max-w-4xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="bg-[#BEB7A7] text-[#112250] px-4 py-1 rounded-full text-sm font-semibold">
                  ★ 4.9
                </span>
                <span className="text-[#E7E2CE]">12.5k+ interested</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Coldplay</h1>
              <h2 className="text-2xl md:text-4xl font-light text-[#E7E2CE] mb-6">
                Music of The Spheres World Tour
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span>Gelora Bung Karno, Jakarta</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>15 Juni 2025</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>19:00 WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-[#112250] mb-4">About This Event</h3>
              <p className="text-[#3B507D] leading-relaxed">
                Coldplay kembali hadir di Jakarta dengan pertunjukan spektakuler penuh cahaya, musik, dan energi. 
                Bergabunglah dengan ribuan penggemar untuk malam yang tak terlupakan di Gelora Bung Karno. 
                Saksikan pertunjukan live dari band legendaris ini dengan visual effects yang memukau dan 
                setlist hits terbaik mereka.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-[#E7E2CE] text-[#112250] px-3 py-1 rounded-full text-sm">Rock</span>
                <span className="bg-[#E7E2CE] text-[#112250] px-3 py-1 rounded-full text-sm">Alternative</span>
                <span className="bg-[#E7E2CE] text-[#112250] px-3 py-1 rounded-full text-sm">International</span>
              </div>
            </div>

            {/* Venue Map */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-[#112250] mb-4">Venue Layout</h3>
              <div className="relative bg-[#F5F4F0] rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                <div className="relative w-full max-w-2xl">
                  {/* Stage */}
                  <div className="bg-[#112250] text-[#F5F4F0] text-center py-4 rounded-lg mb-8 font-bold">
                    🎵 STAGE
                  </div>
                  
                  {/* VIP Standing */}
                  <div className="bg-[#3B507D] text-[#F5F4F0] text-center py-3 rounded-lg mb-2">
                    VIP STANDING
                  </div>
                  
                  {/* VIP Seated */}
                  <div className="bg-[#3B507D] text-[#F5F4F0] text-center py-3 rounded-lg mb-2 opacity-80">
                    VIP SEATED
                  </div>
                  
                  {/* Festival Area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <div className="bg-[#BEB7A7] text-[#112250] text-center py-3 rounded-lg col-span-2">
                      FESTIVAL AREA
                    </div>
                    <div className="bg-[#E7E2CE] text-[#112250] text-center py-3 rounded-lg">
                      TRIBUNE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
              <h3 className="text-xl font-bold text-[#112250] mb-6">Pilih Tiket</h3>
              
              <div className="space-y-3">
                {ticketCategories.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleTicketSelect(ticket.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedTicket === ticket.id
                        ? 'border-[#112250] bg-[#E7E2CE]'
                        : 'border-[#BEB7A7] hover:border-[#3B507D]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <div className="font-semibold text-[#112250]">{ticket.name}</div>
                        <div className="text-sm text-[#3B507D]">
                          {ticket.icon} Sisa: {ticket.available}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#112250]">
                          Rp {ticket.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedTicketData && (
                <div className="mt-6 pt-6 border-t border-[#BEB7A7]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#3B507D]">Jumlah Tiket</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-full bg-[#E7E2CE] text-[#112250] font-bold hover:bg-[#BEB7A7] transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-[#112250] w-8 text-center">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedTicketData.available, quantity + 1))}
                        className="w-8 h-8 rounded-full bg-[#E7E2CE] text-[#112250] font-bold hover:bg-[#BEB7A7] transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#3B507D]">Total</span>
                    <span className="text-2xl font-bold text-[#112250]">
                      Rp {(selectedTicketData.price * quantity).toLocaleString()}
                    </span>
                  </div>

                  <button className="w-full bg-[#112250] text-[#F5F4F0] py-3 rounded-lg font-bold hover:bg-[#3B507D] transition flex items-center justify-center gap-2">
                    <Ticket className="w-5 h-5" />
                    Beli Tiket
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-[#3B507D]">
                <Users className="w-4 h-4 inline mr-1" />
                12.5k+ people interested
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#BEB7A7]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-[#112250] mb-4">Event</h4>
              <ul className="space-y-2 text-[#3B507D]">
                <li><a href="#" className="hover:text-[#112250]">Upcoming</a></li>
                <li><a href="#" className="hover:text-[#112250]">Past Events</a></li>
                <li><a href="#" className="hover:text-[#112250]">Venues</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#112250] mb-4">Support</h4>
              <ul className="space-y-2 text-[#3B507D]">
                <li><a href="#" className="hover:text-[#112250]">Help Center</a></li>
                <li><a href="#" className="hover:text-[#112250]">Refund Policy</a></li>
                <li><a href="#" className="hover:text-[#112250]">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#112250] mb-4">Company</h4>
              <ul className="space-y-2 text-[#3B507D]">
                <li><a href="#" className="hover:text-[#112250]">About</a></li>
                <li><a href="#" className="hover:text-[#112250]">Careers</a></li>
                <li><a href="#" className="hover:text-[#112250]">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#112250] mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-[#3B507D] hover:text-[#112250]">Instagram</a>
                <a href="#" className="text-[#3B507D] hover:text-[#112250]">Twitter</a>
                <a href="#" className="text-[#3B507D] hover:text-[#112250]">YouTube</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-[#E7E2CE] text-center text-sm text-[#3B507D]">
            <p>© 2025 TicketMaster. All rights reserved. Designed with ❤️ by Mawast Studio</p>
            <p className="mt-1 text-xs text-[#BEB7A7]">Color palette inspired by @mawast_studio</p>
          </div>
        </footer>
      </div>
    </div>
  );
}