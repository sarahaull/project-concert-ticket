'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  UserCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Lock,
  KeyRound,
  BadgeCheck,
  CircleUserRound,
  Building2,
} from 'lucide-react';

import { createUser } from '../data';

const initialForm = {
  username: '',
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: 'Laki-laki',
  address: '',
  city: '',
  postalCode: '',
  role: 'User',
  status: 'Aktif',
  emailVerified: false,
  password: '',
  confirmPassword: '',
  avatar: '',
};

export default function TambahUserPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const handleChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama lengkap wajib diisi.');
      return;
    }

    if (!formData.username.trim()) {
      alert('Username wajib diisi.');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email wajib diisi.');
      return;
    }

    if (!formData.password) {
      alert('Password wajib diisi.');
      return;
    }

    if (formData.password.length < 6) {
      alert(
        'Password minimal 6 karakter.'
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      alert(
        'Konfirmasi password tidak sesuai.'
      );
      return;
    }

    setSaving(true);

    const newUser = createUser(
      formData
    );

    router.push(
      `/superadmin/users/detail/${newUser.id}`
    );
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() =>
              router.push(
                '/superadmin/users'
              )
            }
            className="w-10 h-10 rounded-xl bg-white border border-[#e0e8f0] flex items-center justify-center text-[#5a7aad] hover:bg-[#f5f8fc] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>

            <div className="flex items-center gap-2">

              <UserCircle className="w-6 h-6 text-[#5a7aad]" />

              <h1 className="text-xl sm:text-2xl font-bold text-[#0a1628]">
                Tambah User
              </h1>

            </div>

            <p className="text-xs sm:text-sm text-[#7e91b2] mt-1">
              Tambahkan akun pengguna baru ke platform TicketVerse
            </p>

          </div>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* PROFILE */}

        <FormSection
          icon={CircleUserRound}
          title="Informasi Profil"
          description="Informasi dasar pengguna"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Nama Lengkap"
              required
              icon={User}
              value={formData.name}
              onChange={(value) =>
                handleChange(
                  'name',
                  value
                )
              }
              placeholder="Masukkan nama lengkap"
            />

            <InputField
              label="Username"
              required
              icon={UserCircle}
              value={formData.username}
              onChange={(value) =>
                handleChange(
                  'username',
                  value
                )
              }
              placeholder="Contoh: aisyahputri"
            />

            <InputField
              label="Email"
              required
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={(value) =>
                handleChange(
                  'email',
                  value
                )
              }
              placeholder="nama@email.com"
            />

            <InputField
              label="No. Telepon"
              icon={Phone}
              value={formData.phone}
              onChange={(value) =>
                handleChange(
                  'phone',
                  value
                )
              }
              placeholder="08xxxxxxxxxx"
            />

            <InputField
              label="Tanggal Lahir"
              icon={Calendar}
              type="date"
              value={formData.birthDate}
              onChange={(value) =>
                handleChange(
                  'birthDate',
                  value
                )
              }
            />

            <SelectField
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(value) =>
                handleChange(
                  'gender',
                  value
                )
              }
              options={[
                'Laki-laki',
                'Perempuan',
              ]}
            />

          </div>

        </FormSection>

        {/* ADDRESS */}

        <FormSection
          icon={MapPin}
          title="Alamat"
          description="Informasi alamat pengguna"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="md:col-span-2">

              <label className="block text-xs font-semibold text-[#0a1628]/70 mb-1.5">
                Alamat Lengkap
              </label>

              <textarea
                rows={4}
                value={formData.address}
                onChange={(e) =>
                  handleChange(
                    'address',
                    e.target.value
                  )
                }
                placeholder="Masukkan alamat lengkap"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-sm text-[#0a1628] placeholder:text-[#9aa9bf] focus:outline-none focus:ring-2 focus:ring-[#5a7aad]/20 resize-none"
              />

            </div>

            <SelectField
              label="Kota"
              value={formData.city}
              onChange={(value) =>
                handleChange(
                  'city',
                  value
                )
              }
              options={[
                'Jakarta',
                'Bandung',
                'Surabaya',
                'Yogyakarta',
                'Semarang',
                'Medan',
                'Makassar',
              ]}
              placeholder="Pilih kota"
            />

            <InputField
              label="Kode Pos"
              value={formData.postalCode}
              onChange={(value) =>
                handleChange(
                  'postalCode',
                  value
                )
              }
              placeholder="Contoh: 10110"
            />

          </div>

        </FormSection>

        {/* ACCESS */}

        <FormSection
          icon={ShieldCheck}
          title="Akses & Hak Akses"
          description="Atur role dan status akun pengguna"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <SelectField
              label="Role"
              required
              value={formData.role}
              onChange={(value) =>
                handleChange(
                  'role',
                  value
                )
              }
              options={[
                'User',
                'Organizer',
                'Admin',
                'Super Admin',
              ]}
            />

            <SelectField
              label="Status Akun"
              value={formData.status}
              onChange={(value) =>
                handleChange(
                  'status',
                  value
                )
              }
              options={[
                'Aktif',
                'Tidak Aktif',
              ]}
            />

            <div className="md:col-span-2">

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] cursor-pointer">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">

                    <BadgeCheck className="w-5 h-5 text-emerald-600" />

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-[#0a1628]">
                      Email Terverifikasi
                    </p>

                    <p className="text-xs text-[#7e91b2] mt-0.5">
                      Tandai email pengguna sebagai sudah terverifikasi
                    </p>

                  </div>

                </div>

                <input
                  type="checkbox"
                  checked={
                    formData.emailVerified
                  }
                  onChange={(e) =>
                    handleChange(
                      'emailVerified',
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-[#5a7aad]"
                />

              </label>

            </div>

          </div>

        </FormSection>

        {/* SECURITY */}

        <FormSection
          icon={Lock}
          title="Keamanan Akun"
          description="Buat password untuk akun baru"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Password"
              required
              icon={KeyRound}
              type="password"
              value={formData.password}
              onChange={(value) =>
                handleChange(
                  'password',
                  value
                )
              }
              placeholder="Minimal 6 karakter"
            />

            <InputField
              label="Konfirmasi Password"
              required
              icon={Lock}
              type="password"
              value={
                formData.confirmPassword
              }
              onChange={(value) =>
                handleChange(
                  'confirmPassword',
                  value
                )
              }
              placeholder="Ulangi password"
            />

          </div>

        </FormSection>

        {/* AVATAR */}

        <FormSection
          icon={User}
          title="Foto Profil"
          description="Gunakan URL gambar untuk foto profil"
        >

          <InputField
            label="URL Foto Profil"
            icon={User}
            value={formData.avatar}
            onChange={(value) =>
              handleChange(
                'avatar',
                value
              )
            }
            placeholder="https://..."
          />

        </FormSection>

        {/* FOOTER */}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white border border-[#e0e8f0]/60 rounded-2xl p-4">

          <button
            type="button"
            onClick={() =>
              router.push(
                '/superadmin/users'
              )
            }
            className="px-5 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-[#0a1628] text-sm font-semibold hover:bg-[#e9eff6]"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving
              ? 'Menyimpan...'
              : 'Simpan User'}
          </button>

        </div>

      </form>

    </div>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#e0e8f0]/60 shadow-[0_4px_20px_rgba(10,20,40,0.06)] p-5 sm:p-6">

      <div className="flex items-start gap-3 mb-5">

        <div className="w-10 h-10 rounded-xl bg-[#5a7aad]/10 flex items-center justify-center flex-shrink-0">

          <Icon className="w-5 h-5 text-[#5a7aad]" />

        </div>

        <div>

          <h2 className="text-sm font-bold text-[#0a1628]">
            {title}
          </h2>

          <p className="text-xs text-[#7e91b2] mt-0.5">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

function InputField({
  label,
  required = false,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-[#0a1628]/70 mb-1.5">

        {label}

        {required && (
          <span className="text-rose-500 ml-1">
            *
          </span>
        )}

      </label>

      <div className="relative">

        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e91b2]" />
        )}

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className={`w-full ${
            Icon ? 'pl-10' : 'px-4'
          } pr-4 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-sm text-[#0a1628] placeholder:text-[#9aa9bf] focus:outline-none focus:ring-2 focus:ring-[#5a7aad]/20`}
        />

      </div>

    </div>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options = [],
  placeholder,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-[#0a1628]/70 mb-1.5">

        {label}

        {required && (
          <span className="text-rose-500 ml-1">
            *
          </span>
        )}

      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-sm text-[#0a1628] focus:outline-none focus:ring-2 focus:ring-[#5a7aad]/20"
      >

        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}