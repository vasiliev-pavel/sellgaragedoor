"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

export default function Home() {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("garageFormPhone") || "";
      const savedEmail = localStorage.getItem("garageFormEmail") || "";
      return {
        phone: savedPhone,
        email: savedEmail,
        doors: "1",
        garageType: "1-car",
        material: "steel" as Material,
      };
    }
    return {
      phone: "",
      email: "",
      doors: "1",
      garageType: "1-car",
      material: "steel" as Material,
    };
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newValue = e.target.value;
    const fieldName = e.target.name as keyof typeof formData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    if (fieldName === "phone") {
      localStorage.setItem("garageFormPhone", String(newValue));
    } else if (fieldName === "email") {
      localStorage.setItem("garageFormEmail", String(newValue));
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phone: formattedPhoneNumber,
    }));
    localStorage.setItem("garageFormPhone", formattedPhoneNumber);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        const compressedFile = await compressImage(originalFile);
        setSelectedFile(compressedFile);
        const url = URL.createObjectURL(compressedFile);
        setPreviewUrl(url);
      } catch (error) {
        setSelectedFile(originalFile);
        const url = URL.createObjectURL(originalFile);
        setPreviewUrl(url);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleDoorSelect = (doors: string) =>
    setFormData((p) => ({ ...p, doors }));
  const handleGarageTypeSelect = (garageType: string) =>
    setFormData((p) => ({ ...p, garageType }));
  const handleMaterialSelect = (material: Material) =>
    setFormData((p) => ({ ...p, material }));

  const clearSavedData = () => {
    localStorage.removeItem("garageFormPhone");
    localStorage.removeItem("garageFormEmail");
    setFormData((p) => ({ ...p, phone: "", email: "" }));
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneDigits = phone.replace(/[^\d]/g, "");
    return phoneDigits.length === 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a garage photo");
      return;
    }
    if (!validatePhoneNumber(formData.phone)) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    const intake = {
      phone: formData.phone,
      email: formData.email,
      doors: formData.doors,
      garageType: formData.garageType,
      material: formData.material,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("image", selectedFile);
    Object.entries({
      phone: intake.phone,
      email: intake.email,
      doors: intake.doors,
      garageType: intake.garageType,
      material: intake.material,
    }).forEach(([k, v]) => formDataToSend.append(k, String(v)));

    try {
      setLoading(true);
      const response = await fetch("/api/generate-designs", {
        method: "POST",
        body: formDataToSend,
      });
      if (response.ok) {
        const result = await response.json();
        const payload = { ...result, intake };
        sessionStorage.setItem("garageDesigns", JSON.stringify(payload));
        localStorage.removeItem("garageFormPhone");
        localStorage.removeItem("garageFormEmail");
        router.push("/offer");
      } else {
        alert("An error occurred while processing your request");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            aria-label="Illinois Garage Door Repair — home"
            className="flex items-center"
          >
            <Image
              src="https://illinoisgaragedoorrepair.com/images/logo-new-illinois-garage-door-repair-company-lake-cook-county-il350x171.webp"
              alt="Illinois Garage Door Repair & More logo"
              width={350}
              height={171}
              priority
              className="h-12 sm:h-18 w-auto"
            />
          </a>

          <a
            href="tel:+18472500221"
            className="inline-flex items-center gap-2 rounded-lg bg-[#E86A2F] px-3 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
          >
            24/7 (847) 250-0221
          </a>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-5 gap-10 items-start">
          <section className="lg:col-span-2">
            <p className="uppercase tracking-widest text-[#0E4A7B] text-sm font-bold">
              Garage Door
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold leading-tight">
              <span className="text-slate-900">Repair</span>
              <span className="text-[#E86A2F]"> &amp; Installation</span>
            </h1>
            <p className="mt-5 text-slate-600 text-lg">
              Trade-in your old door for instant credit toward a new one.
            </p>
            <ul className="mt-6 space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0E4A7B] text-white text-xs font-bold">
                  ✓
                </span>
                Licensed, Bonded, Insured
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0E4A7B] text-white text-xs font-bold">
                  ✓
                </span>
                Same Day Appointment • 24/7 Emergency
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0E4A7B] text-white text-xs font-bold">
                  ✓
                </span>
                We haul away and buy your old door
              </li>
            </ul>
          </section>

          <section className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 sm:p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Design Your Door
                </h2>
                <p className="text-slate-600">
                  Upload a photo and tell us about your current door.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-2">
                    Garage Photo <span className="text-[#E86A2F]">*</span>
                  </label>
                  {!previewUrl ? (
                    <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl border-slate-300 hover:border-slate-400 transition-all bg-slate-50">
                      <div className="space-y-2 text-center">
                        <svg
                          className="mx-auto h-16 w-16 text-slate-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm justify-center text-slate-700">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-lg px-4 py-2 font-semibold text-white bg-[#E86A2F] hover:brightness-110 transition shadow"
                          >
                            <span>Choose file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                          </label>
                          <p className="pl-2 self-center">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-slate-50 ring-1 ring-slate-200">
                      <img
                        src={previewUrl}
                        alt="Garage preview"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-base font-semibold text-slate-900 mb-2"
                    >
                      Phone Number <span className="text-[#E86A2F]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-semibold pointer-events-none">
                        +1
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        className="block w-full bg-white ring-1 rounded-lg pl-12 pr-12 py-3 placeholder-slate-400 focus:ring-2 focus:border-transparent transition-all text-slate-900 ring-slate-300 focus:ring-slate-400"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={14}
                      />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      US, Canada, and Mexico numbers
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-base font-semibold text-slate-900 mb-2"
                    >
                      Email Address <span className="text-[#E86A2F]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="block w-full bg-white ring-1 ring-slate-300 rounded-lg px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Doors */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-3">
                    Number of Garage Doors
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((doorCount) => (
                      <button
                        key={doorCount}
                        type="button"
                        onClick={() => handleDoorSelect(String(doorCount))}
                        className={`relative p-6 rounded-xl ring-1 transition-all ${
                          formData.doors === String(doorCount)
                            ? "ring-[#0E4A7B] bg-slate-50 shadow"
                            : "ring-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-slate-900 mb-1">
                            {doorCount}
                          </div>
                          <div className="text-sm text-slate-600">
                            {doorCount === 1 ? "Door" : "Doors"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garage Type */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-3">
                    Garage Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "1-car", label: "Single Car" },
                      { value: "2-car", label: "Double Car" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => handleGarageTypeSelect(t.value)}
                        className={`relative p-6 rounded-xl ring-1 transition-all ${
                          formData.garageType === t.value
                            ? "ring-[#0E4A7B] bg-slate-50 shadow"
                            : "ring-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-semibold text-slate-900 mb-1">
                            {t.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {t.value === "1-car"
                              ? "For 1 vehicle"
                              : "For 2 vehicles"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material (required) */}
                <div>
                  <label className="block text-base font-semibold text-slate-900 mb-3">
                    Material of Your Current Door{" "}
                    <span className="text-[#E86A2F]">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
                    {[
                      { value: "steel", label: "Steel" },
                      { value: "wood", label: "Wood" },
                      { value: "aluminum", label: "Aluminum" },
                      {
                        value: "fiberglass_composite",
                        label: "Fiberglass/Composite",
                      },
                    ].map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() =>
                          handleMaterialSelect(m.value as Material)
                        }
                        className={`p-3 rounded-lg ring-1 text-sm font-medium ${
                          formData.material === m.value
                            ? "ring-[#0E4A7B] bg-slate-50"
                            : "ring-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-6 rounded-xl text-lg font-semibold text-white bg-[#E86A2F] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E86A2F] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                  >
                    {loading ? "Generating..." : "See My Offers"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
