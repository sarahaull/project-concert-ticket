'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';

import {
  getUserById,
  updateUser,
} from '../../data';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [notFound, setNotFound] =
    useState(false);

  const [formData, setFormData] =
    useState(null);

  useEffect(() => {
    if (!id) return;

    const user = getUserById(id);

    if (!user) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setFormData({
      username: user.username || '',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      gender:
        user.gender || 'Laki-laki',
      address: user.address || '',
      city: user.city || '',
      postalCode:
        user.postalCode || '',
      role: user.role || 'User',
      status:
        user.status || 'Aktif',
      emailVerified:
        user.emailVerified || false,
      password: '',
      confirmPassword: '',
      avatar: user.avatar || '',
    });

    setLoading(false);
  }, [id]);

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

    if (
      formData.password &&
      formData.password.length < 6
    ) {
      alert(
        'Password minimal 6 karakter.'
      );
      return;
    }

    if (
      formData.password !==
        formData.confirmPassword &&
      formData.password
    ) {
      alert(
        'Konfirmasi password tidak sesuai.'
      );
      return;
    }

    setSaving(true);

    const updateData = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate,
      gender: formData.gender,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      role: formData.role,
      status: formData.status,
      emailVerified:
        formData.emailVerified,
      avatar: formData.avatar,
    };

    if (formData.password) {
      updateData.password =
        formData.password;
    }

    updateUser(id, updateData);

    router.push(
      `/superadmin/users/detail/${id}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">

        <div className="text-sm text-[#7e91b2]">
          Memuat data user...
        </div>

      </div>
    );
  }

  if (notFound || !formData) {
    return (
      <div className="bg-white rounded-2xl border border-[#e0e8f0] p-10 text-center">

        <h2 className="text-lg font-bold text-[#0a1628]">
          User tidak ditemukan
        </h2>

        <p className="text-sm text-[#7e91b2] mt-2">
          Data user yang ingin diedit tidak tersedia.
        </p>

        <button
          onClick={() =>
            router.push(
              '/superadmin/users'
            )
          }
          className="mt-5 px-4 py-2.5 rounded-xl bg-[#0a1628] text-white text-sm font-semibold"
        >
          Kembali ke Users
        </button>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() =>
            router.push(
              '/superadmin/users'
            )
          }
          className="w-10 h-10 rounded-xl bg-white border border-[#e0e8f0] flex items-center justify-center text-[#5a7aad] hover:bg-[#f5f8fc]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>

          <div className="flex items-center gap-2">

            <UserCircle className="w-6 h-6 text-[#5a7aad]" />

            <h1 className="text-xl sm:text-2xl font-bold text-[#0a1628]">
              Edit User
            </h1>

          </div>

          <p className="text-xs sm:text-sm text-[#7e91b2] mt-1">
            Perbarui informasi akun pengguna
          </p>

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
          description="Perbarui informasi dasar pengguna"
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
          description="Perbarui informasi alamat pengguna"
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
                className="w-full px-4 py-3 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-sm text-[#0a1628] focus:outline-none focus:ring-2 focus:ring-[#5a7aad]/20 resize-none"
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
            />

          </div>

        </FormSection>

        {/* ACCESS */}

        <FormSection
          icon={ShieldCheck}
          title="Akses & Hak Akses"
          description="Atur role dan status akun"
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

                    <p className="text-xs text-[#7e91b2]">
                      Status verifikasi email pengguna
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
          description="Kosongkan password jika tidak ingin mengubahnya"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Password Baru"
              icon={KeyRound}
              type="password"
              value={formData.password}
              onChange={(value) =>
                handleChange(
                  'password',
                  value
                )
              }
              placeholder="Kosongkan jika tidak diubah"
            />

            <InputField
              label="Konfirmasi Password"
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
              placeholder="Ulangi password baru"
            />

          </div>

        </FormSection>

        {/* AVATAR */}

        <FormSection
          icon={User}
          title="Foto Profil"
          description="Perbarui URL foto profil"
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

        {/* ACTION */}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white border border-[#e0e8f0]/60 rounded-2xl p-4">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/superadmin/users/detail/${id}`
              )
            }
            className="px-5 py-2.5 rounded-xl bg-[#f5f8fc] border border-[#e0e8f0] text-[#0a1628] text-sm font-semibold hover:bg-[#e9eff6]"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0a1628] to-[#1b2f4e] text-white text-sm font-semibold disabled:opacity-60"
          >
            <Save className="w-4 h-4" />

            {saving
              ? 'Menyimpan...'
              : 'Simpan Perubahan'}

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

        <div className="w-10 h-10 rounded-xl bg-[#5a7aad]/10 flex items-center justify-center">

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