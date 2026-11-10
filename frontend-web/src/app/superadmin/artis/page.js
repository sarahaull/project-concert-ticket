"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MicrophoneIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  StarIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  GlobeAltIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const mockArtists = [
  {
    id: 1,
    name: "Coldplay",
    genre: "Alternative Rock",
    origin: "London, UK",
    events: 2,
    popularity: 98,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=150&h=150&fit=crop",
  },
  {
    id: 2,
    name: "BLACKPINK",
    genre: "K-Pop",
    origin: "Seoul, KR",
    events: 3,
    popularity: 99,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=150&h=150&fit=crop",
  },
  {
    id: 3,
    name: "NCT DREAM",
    genre: "K-Pop",
    origin: "Seoul, KR",
    events: 1,
    popularity: 92,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150&h=150&fit=crop",
  },
  {
    id: 4,
    name: "Sheila On 7",
    genre: "Pop Rock",
    origin: "Yogyakarta, ID",
    events: 4,
    popularity: 95,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=150&h=150&fit=crop",
  },
  {
    id: 5,
    name: "Deep Purple",
    genre: "Hard Rock",
    origin: "Hertford, UK",
    events: 1,
    popularity: 88,
    status: "Tidak Aktif",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop",
  },
  {
    id: 6,
    name: "Taylor Swift",
    genre: "Pop",
    origin: "Nashville, US",
    events: 2,
    popularity: 100,
    status: "Aktif",
    image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=150&fit=crop",
  },
];

export default function DataArtis() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const filteredArtists = mockArtists.filter((artist) => {
    const matchSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "Semua" || artist.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className={`w-full space-y-6 ${isLoaded ? "animate-in fade-in duration-500" : "opacity-0"}`}>
      <section className="relative overflow-hidden w-full rounded-2xl px-6 py-8 shadow-[0_8px_30px_rgba(10,20,40,0.25)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#13213b] to-[#1b2f4e]" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#5a8ad0]/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#8ab4f8]/10 blur-3xl animate-pulse delay-75" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-[#4a6b9a]/15 blur-2xl animate-pulse delay-150" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/superadmin"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#8aa0c0] hover:text-white transition-colors mb-3"
            >
              <ArrowLeftIcon className="w-3 h-3" />
              Kembali ke Dashboard
            </Link>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] text-white">
              Data <span className="bg-gradient-to-r from-[#8ab4f8] to-[#b0c8e0] bg-clip-text text-transparent">Artis</span>
            </h1>
            <p className="mt-1.5 text-sm text-[#8aa0c0] max-w-xl">
              Kelola daftar artis, musisi, dan performer yang terdaftar di platform TicketVerse.
            </p>
          </div>
          
          <button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ab4f8] to-[#5a8ad0] text-[#0a1628] text-sm font-bold px-5 py-3 rounded-xl hover:shadow-[0_8px_25px_rgba(138,180,248,0.3)] hover:-translate-y-0.5 transition-all duration-300 self-start sm:self-auto">
            <PlusIcon className="w-4 h-4" />
            Tambah Artis
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-5 shadow-[0_4px_20px_rgba(10,20,40,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e6f0fa] flex items-center justify-center text-[#4a6b9a]">
            <MicrophoneIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#7e91b2] uppercase tracking-wider">Total Artis</p>
            <p className="text-xl font-bold text-[#0a1628]">{mockArtists.length}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-5 shadow-[0_4px_20px_rgba(10,20,40,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#7e91b2] uppercase tracking-wider">Artis Aktif</p>
            <p className="text-xl font-bold text-[#0a1628]">
              {mockArtists.filter((a) => a.status === "Aktif").length}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 p-5 shadow-[0_4px_20px_rgba(10,20,40,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <MusicalNoteIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#7e91b2] uppercase tracking-wider">Total Event</p>
            <p className="text-xl font-bold text-[#0a1628]">
              {mockArtists.reduce((acc, curr) => acc + curr.events, 0)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white/90 backdrop-blur-sm border border-[#e0e8f0]/50 shadow-[0_4px_20px_rgba(10,20,40,0.06)] hover:shadow-[0_8px_30px_rgba(10,20,40,0.10)] transition-all duration-300 overflow-hidden">
        <div className="p-6 border-b border-[#e0e8f0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-[#0a1628] flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#4a6b9a]" />
              Daftar Artis
            </h2>
            <p className="text-[11px] text-[#7e91b2] mt-0.5">
              Menampilkan {filteredArtists.length} dari {mockArtists.length} artis
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-[#7e91b2]" />
              </div>
              <input
                type="text"
                placeholder="Cari nama artis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-[#f8fafc] border border-[#d0d8e4] rounded-xl text-xs font-medium text-[#0a1628] placeholder:text-[#a0b0c8] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#d0d8e4] rounded-xl px-3 py-2 text-xs font-medium text-[#0a1628] outline-none focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 cursor-pointer transition"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e0e8f0]">
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">Artis</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">Genre</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">Asal</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider text-center">Event</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">Popularitas</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-[10px] font-semibold text-[#7e91b2] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e8f0]/50">
              {filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <tr key={artist.id} className="group hover:bg-[#f0f5fc] transition-colors duration-200">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0a1628]">{artist.name}</span>
                          <span className="text-[10px] text-[#7e91b2]">ID: ART-{artist.id.toString().padStart(3, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#e6f0fa] text-[10px] font-medium text-[#4a6b9a] border border-[#d0d8e4]">
                        {artist.genre}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-[#0a1628]">
                        <GlobeAltIcon className="w-3.5 h-3.5 text-[#7e91b2]" />
                        {artist.origin}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f0f5fc] text-xs font-bold text-[#0a1628]">
                        {artist.events}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] h-1.5 bg-[#e0e8f0] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8ab4f8] to-[#4a6b9a] rounded-full"
                            style={{ width: `${artist.popularity}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#0a1628]">{artist.popularity}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold ${
                        artist.status === "Aktif"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                          : "bg-red-500/10 border-red-500/20 text-red-600"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${artist.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"}`} />
                        {artist.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1.5 rounded-lg text-[#7e91b2] hover:text-[#0a1628] hover:bg-white transition-colors" title="Edit">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg text-[#7e91b2] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm text-[#7e91b2]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserGroupIcon className="w-8 h-8 text-[#d0d8e4]" />
                      <p>Tidak ada data artis yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[#e0e8f0]/50 flex items-center justify-between text-[11px] text-[#7e91b2]">
          <span>Menampilkan 1-{filteredArtists.length} dari {filteredArtists.length} data</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-[#d0d8e4] hover:bg-[#f8fafc] transition-colors disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1.5 rounded-lg border border-[#d0d8e4] hover:bg-[#f8fafc] transition-colors">Selanjutnya</button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: fadeInUp 0.6s ease both;
        }

        .delay-75 {
          animation-delay: 0.75s;
        }
        .delay-150 {
          animation-delay: 1.5s;
        }

        .fade-in {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}