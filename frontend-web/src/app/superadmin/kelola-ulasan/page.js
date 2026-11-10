"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  StarIcon,
  TrashIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon,
  FunnelIcon,
  EyeSlashIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const initialReviews = [
  {
    id: 1,
    user: "Aisyah Putri",
    email: "aisyahp@gmail.com",
    event: "Coldplay - Music of The Spheres",
    rating: 5,
    date: "2025-06-10T14:30:00",
    comment: "Konser paling epik yang pernah saya tonton! Sound system luar biasa, visualnya memukau. Coldplay never disappoints!",
    status: "Published",
  },
  {
    id: 2,
    user: "Muhammad Alif",
    email: "alif.muhammad@gmail.com",
    event: "Blackpink - Born Pink",
    rating: 4,
    date: "2025-06-09T20:15:00",
    comment: "Secara keseluruhan bagus, tapi antrean masuk agak lama. Penampilan BLACKPINK tetap luar biasa.",
    status: "Published",
  },
  {
    id: 3,
    user: "Jonathan Lee",
    email: "jonathanlee@gmail.com",
    event: "NCT Dream - The Dream Show 3",
    rating: 5,
    date: "2025-06-08T18:45:00",
    comment: "Energi para member NCT benar-benar luar biasa! Stage production-nya keren banget.",
    status: "Hidden",
  },
  {
    id: 4,
    user: "Nadia Rahma",
    email: "nadirahma@gmail.com",
    event: "Sheila On 7 - Tunggu Aku di Jakarta",
    rating: 3,
    date: "2025-06-07T21:00:00",
    comment: "Lagu-lagunya nostalgia, tapi sayangnya sound agak pecah di area festival.",
    status: "Published",
  },
];

export default function KelolaUlasan() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState("Semua");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    setIsModalOpen(false);
  };

  const toggleStatus = (id) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, status: r.status === "Published" ? "Hidden" : "Published" } : r
    ));
    if (selectedReview && selectedReview.id === id) {
      setSelectedReview({ ...selectedReview, status: selectedReview.status === "Published" ? "Hidden" : "Published" });
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterRating === "Semua") return true;
    return r.rating === parseInt(filterRating);
  });

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/superadmin" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3">
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white flex items-center gap-3">
              <StarIcon className="w-8 h-8 text-[#8ab4f8]" />
              Kelola Ulasan Konser
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Moderasi, pantau, dan kelola ulasan dari pengguna terkait event.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <FunnelIcon className="w-4 h-4 text-[#5a7aad]" />
          <span className="text-xs font-semibold text-[#0a1628]">Filter Rating:</span>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-[#f8fafc] border border-[#d0d8e4] rounded-xl px-3 py-1.5 text-xs font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] cursor-pointer"
          >
            <option value="Semua">Semua Bintang</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
            <option value="2">2 Bintang</option>
            <option value="1">1 Bintang</option>
          </select>
        </div>
        <div className="text-xs font-semibold text-[#7e91b2] bg-[#f0f5fc] px-3 py-1.5 rounded-lg">
          Menampilkan {filteredReviews.length} Ulasan
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className={`bg-white/90 backdrop-blur-sm border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group ${review.status === 'Hidden' ? 'border-red-200 bg-red-50/30' : 'border-[#e0e8f0]/50'}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] flex items-center justify-center text-white font-bold text-sm">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0a1628]">{review.user}</p>
                  <p className="text-[10px] text-[#7e91b2]">{review.event}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400" : "text-[#e0e8f0]"}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-[#4a5a7a] leading-relaxed line-clamp-3 mb-4 group-hover:text-[#0a1628] transition-colors">
              "{review.comment}"
            </p>
            <div className="flex justify-between items-center pt-3 border-t border-[#e0e8f0]/50">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                review.status === "Published" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              }`}>
                {review.status === "Published" ? "Tampil" : "Disembunyikan"}
              </span>
              <button
                onClick={() => { setSelectedReview(review); setIsModalOpen(true); }}
                className="text-[11px] font-bold text-[#5a7aad] hover:text-[#0a1628] transition-colors flex items-center gap-1"
              >
                <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5" />
                Kelola Ulasan
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1b2f4e] flex items-center justify-center text-white font-bold text-lg">
                    {selectedReview.user.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0a1628]">{selectedReview.user}</h3>
                    <p className="text-xs text-[#7e91b2]">{selectedReview.email}</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-[#7e91b2] hover:text-red-500 transition-colors">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-[10px] font-bold text-[#7e91b2] uppercase tracking-wider mb-1">Event</p>
                <p className="text-sm font-semibold text-[#0a1628]">{selectedReview.event}</p>
              </div>

              <div className="flex gap-1 mb-4 items-center">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={i} className={`w-5 h-5 ${i < selectedReview.rating ? "text-amber-400" : "text-[#e0e8f0]"}`} />
                ))}
                <span className="text-sm font-bold text-[#0a1628] ml-2">{selectedReview.rating}.0 / 5.0</span>
              </div>
              
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-[#e0e8f0] mb-6 relative">
                <div className="absolute -top-3 left-4 text-4xl text-[#d0d8e4] font-serif">"</div>
                <p className="text-sm text-[#0a1628] leading-relaxed italic relative z-10 pt-2">
                  {selectedReview.comment}
                </p>
                <p className="text-[10px] text-[#7e91b2] mt-3">{formatDate(selectedReview.date)}</p>
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(selectedReview.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                      selectedReview.status === "Published" 
                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {selectedReview.status === "Published" ? (
                      <><EyeSlashIcon className="w-4 h-4" /> Sembunyikan</>
                    ) : (
                      <><EyeIcon className="w-4 h-4" /> Tampilkan</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedReview.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.6s ease both; }
        .delay-75 { animation-delay: 0.75s; }
        .fade-in { opacity: 1; }
      `}</style>
    </div>
  );
}