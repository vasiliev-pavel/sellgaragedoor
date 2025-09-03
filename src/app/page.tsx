// src/app/page.tsx (ФИНАЛЬНАЯ ВЕРСИЯ С НОВЫМ ЗАГОЛОВКОМ)

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRightLeft,
  Eye,
  Wrench,
  UploadCloud,
  Star,
  Phone,
} from "lucide-react";

type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const StarRating = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? "text-yellow-400" : "text-slate-300"
        }`}
        fill="currentColor"
      />
    ))}
  </div>
);

export default function Home() {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("garageFormPhone") || "";
      const savedEmail = localStorage.getItem("garageFormEmail") || "";
      return {
        phone: savedPhone,
        email: savedEmail,
        doors: "1",
        material: "steel" as Material,
      };
    }
    return { phone: "", email: "", doors: "1", material: "steel" as Material };
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- Все ваши функции-обработчики остаются без изменений ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") localStorage.setItem("garageFormPhone", value);
    if (name === "email") localStorage.setItem("garageFormEmail", value);
  };
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;
    if (len < 4) return phoneNumber;
    if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    localStorage.setItem("garageFormPhone", formatted);
  };
  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const maxWidth = 1200,
          maxHeight = 1200;
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(
              blob ? new File([blob], file.name, { type: "image/jpeg" }) : file
            );
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
    });
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = await compressImage(e.target.files[0]);
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);
  const handleDoorSelect = (doors: string) =>
    setFormData((p) => ({ ...p, doors }));
  const handleMaterialSelect = (material: Material) =>
    setFormData((p) => ({ ...p, material }));
  const validatePhoneNumber = (phone: string) =>
    phone.replace(/[^\d]/g, "").length === 10;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please upload a photo of your garage.");
      return;
    }
    if (!validatePhoneNumber(formData.phone)) {
      alert("Please enter a valid 10-digit US phone number.");
      return;
    }
    setLoading(true);
    const intake = { ...formData };
    const formDataToSend = new FormData();
    formDataToSend.append("image", selectedFile);
    Object.entries(intake).forEach(([k, v]) =>
      formDataToSend.append(k, String(v))
    );
    try {
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
        alert(
          "An error occurred while processing your request. Please try again."
        );
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Illinois Garage Door Repair — home"
            className="flex items-center"
          >
            <Image
              src="https://illinoisgaragedoorrepair.com/images/logo-new-illinois-garage-door-repair-company-lake-cook-county-il3T50x171.webp"
              alt="Illinois Garage Door Repair Chicago logo"
              width={350}
              height={171}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <a
            href="tel:+18472500221"
            className="text-sm font-semibold text-slate-800 hover:text-blue-700 flex items-center gap-2"
          >
            <Phone size={16} />
            <span className="hidden sm:inline">{"Questions? Call Us:"}</span>
            <span className="font-bold">(847) 250-0221</span>
          </a>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-12 xl:gap-16 items-start">
            <section className="lg:col-span-2 lg:sticky lg:top-28">
              {/* ИЗМЕНЕНИЕ: Новый заголовок и подзаголовок в соответствии с вашим запросом */}
              <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
                We Will{" "}
                <span className="text-[#E86A2F]">
                  Buy Your Old Garage Door!
                </span>
              </h1>
              <p className="mt-3 text-lg text-slate-600 font-medium">
                ...with a purchase of a new door from us.
              </p>

              {/* ИЗМЕНЕНИЕ: Основной текст переписан, чтобы соответствовать новому заголовку */}
              <p className="mt-5 text-slate-600 text-lg">
                {
                  "Your old garage door is your down payment on a beautiful new one. Snap a photo to get an instant trade-in credit towards a complete upgrade, professionally installed by our team."
                }
              </p>

              <div className="mt-8 space-y-4 text-slate-700">
                <div className="flex items-start gap-3">
                  <ArrowRightLeft className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Trade-In Value:</strong> Get a guaranteed
                    credit for your old door in seconds, applied directly to
                    your upgrade.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Free Removal & Full Service:</strong> When you
                    upgrade, we handle the complete removal and haul-away of
                    your old door at no extra cost.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Visualize Your Upgrade:</strong> See how different
                    styles of new doors will look on your actual home before
                    making a decision.
                  </span>
                </div>
              </div>
            </section>

            <section className="lg:col-span-3">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#0E4A7B] text-white font-bold">
                        1
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Upload a Photo of Your Current Door
                      </h3>
                    </div>
                    {!previewUrl ? (
                      <div className="mt-2">
                        <label
                          htmlFor="file-upload"
                          className="relative block w-full rounded-xl border-2 border-dashed border-slate-300 p-12 text-center hover:border-[#0E4A7B] cursor-pointer bg-slate-50/80 transition-colors"
                        >
                          <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                          <span className="mt-2 block font-semibold text-[#0E4A7B]">
                            Click to upload a photo
                          </span>
                          <span className="mt-1 block text-xs text-slate-500">
                            or drag and drop
                          </span>
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
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-200">
                        <Image
                          src={previewUrl}
                          alt="Your garage preview"
                          width={600}
                          height={400}
                          className="w-full h-auto object-cover"
                        />
                        <label
                          htmlFor="file-upload"
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer rounded-lg bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-slate-800 shadow-md ring-1 ring-slate-900/10 hover:bg-white transition"
                        >
                          Change Photo
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#0E4A7B] text-white font-bold">
                        2
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Tell Us About Your Old Door
                      </h3>
                    </div>
                    <div>
                      <label className="block text-base font-medium text-slate-800 mb-3">
                        Number of Doors
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["1", "2", "3+"].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => handleDoorSelect(d)}
                            className={`text-center p-4 rounded-lg border-2 transition-all duration-200 ${
                              formData.doors === d
                                ? "border-[#0E4A7B] bg-blue-50  ring-[#0E4A7B]"
                                : "border-slate-300 bg-white hover:border-slate-400"
                            }`}
                          >
                            <div className="text-2xl font-bold text-slate-900">
                              {d}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-base font-medium text-slate-800 mb-3">
                        Material of Your Old Door{" "}
                        <span className="text-[#E86A2F]">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { v: "steel", l: "Steel" },
                          { v: "wood", l: "Wood" },
                          { v: "aluminum", l: "Aluminum" },
                          { v: "fiberglass_composite", l: "Fiberglass" },
                        ].map((m) => (
                          <button
                            key={m.v}
                            type="button"
                            onClick={() =>
                              handleMaterialSelect(m.v as Material)
                            }
                            className={`p-3 rounded-lg border-2 text-sm font-semibold text-slate-900 transition-all duration-200 ${
                              formData.material === m.v
                                ? "border-[#0E4A7B] bg-blue-50  ring-[#0E4A7B]"
                                : "border-slate-300 bg-white hover:border-slate-400"
                            }`}
                          >
                            {m.l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#0E4A7B] text-white font-bold">
                        3
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        Where to Send Your Trade-In Offer
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-semibold text-slate-800 mb-2"
                        >
                          Phone Number <span className="text-[#E86A2F]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          required
                          className="block w-full bg-white border border-slate-300 rounded-lg px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-[#0E4A7B] focus:border-transparent transition-all"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          maxLength={14}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-slate-800 mb-2"
                        >
                          Email Address{" "}
                          <span className="text-[#E86A2F]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          className="block w-full bg-white border border-slate-300 rounded-lg px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-[#0E4A7B] focus:border-transparent transition-all"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center gap-3 py-4 px-6 rounded-xl text-lg font-semibold text-white bg-[#E86A2F] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E86A2F] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      {loading ? (
                        <>
                          {" "}
                          <Spinner /> Calculating Your Credit...{" "}
                        </>
                      ) : (
                        "Get My Trade-In Offer"
                      )}
                    </button>
                    <p className="mt-4 text-xs text-center text-slate-500">
                      By submitting, you agree to receive texts & emails about
                      your offer.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Trusted by Homeowners Across Chicagoland
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
                {
                  "We're proud of our reputation for quality work and happy customers."
                }
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Sarah L.</p>
                  <StarRating rating={5} />
                </div>
                <blockquote className="mt-4 text-slate-700 italic">
                  <p>
                    {
                      "The entire process was seamless! From uploading a photo to the final installation, the team was professional and efficient. My new garage door looks amazing."
                    }
                  </p>
                </blockquote>
                <footer className="mt-4 text-sm text-slate-500">
                  From{" "}
                  <span className="font-semibold text-slate-600">
                    Naperville, IL
                  </span>
                </footer>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">Mark P.</p>
                  <StarRating rating={5} />
                </div>
                <blockquote className="mt-4 text-slate-700 italic">
                  <p>
                    {
                      "I was skeptical about the AI visualization, but it was surprisingly accurate and helped us choose the perfect style. The trade-in offer was fair. Highly recommend!"
                    }
                  </p>
                </blockquote>
                <footer className="mt-4 text-sm text-slate-500">
                  From{" "}
                  <span className="font-semibold text-slate-600">
                    Northbrook, IL
                  </span>
                </footer>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">David Chen</p>
                  <StarRating rating={5} />
                </div>
                <blockquote className="mt-4 text-slate-700 italic">
                  <p>
                    {
                      "Great service and a fantastic deal. Getting a credit for our old, beat-up door was a huge plus. The installers were courteous and cleaned up everything."
                    }
                  </p>
                </blockquote>
                <footer className="mt-4 text-sm text-slate-500">
                  From{" "}
                  <span className="font-semibold text-slate-600">
                    Chicago, IL
                  </span>
                </footer>
              </div>
            </div>
            <div className="mt-12 text-center">
              <a
                href="https://www.google.com/search?q=illinois+garage+door+repair#reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
              >
                Read More Reviews on Google
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Illinois Garage Door Repair Co.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {"Proudly Serving Chicago & All Suburbs."}
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-500 lg:mt-0">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
