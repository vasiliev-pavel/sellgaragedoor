"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface GarageDesignResult {
  originalImage: string;
  generatedImage: string;
  userInfo: {
    phone: string;
    email: string;
    doors: string;
    garageType: string;
  };
}

export default function Results() {
  const [designResult, setDesignResult] = useState<GarageDesignResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedData = sessionStorage.getItem("garageDesigns");

    if (!savedData) {
      router.push("/");
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);
      setDesignResult(parsedData);
    } catch (error) {
      console.error("Error parsing saved data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleStartOver = () => {
    sessionStorage.removeItem("garageDesigns");
    // Очищаем localStorage при создании нового дизайна
    localStorage.removeItem("garageFormPhone");
    localStorage.removeItem("garageFormEmail");
    router.push("/");
  };

  const handleDownloadImage = () => {
    if (designResult?.generatedImage) {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${designResult.generatedImage}`;
      link.download = "garage-designs.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRegenerateDesigns = async () => {
    if (!designResult) return;

    setRegenerating(true);

    try {
      // Создаем FormData с оригинальным изображением и данными пользователя
      const formDataToSend = new FormData();

      // Конвертируем base64 обратно в файл
      const base64Response = await fetch(
        `data:image/jpeg;base64,${designResult.originalImage}`
      );
      const blob = await base64Response.blob();
      const file = new File([blob], "garage-photo.jpg", { type: "image/jpeg" });

      formDataToSend.append("image", file);
      formDataToSend.append("phone", designResult.userInfo.phone);
      formDataToSend.append("email", designResult.userInfo.email);
      formDataToSend.append("doors", designResult.userInfo.doors);
      formDataToSend.append("garageType", designResult.userInfo.garageType);

      const response = await fetch("/api/generate-designs", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const newResult = await response.json();
        setDesignResult(newResult);
        // Обновляем данные в sessionStorage
        sessionStorage.setItem("garageDesigns", JSON.stringify(newResult));
        // Сохраняем контактные данные обратно в localStorage
        localStorage.setItem("garageFormPhone", designResult.userInfo.phone);
        localStorage.setItem("garageFormEmail", designResult.userInfo.email);
      } else {
        alert("Failed to regenerate designs. Please try again.");
      }
    } catch (error) {
      console.error("Error regenerating designs:", error);
      alert("An error occurred while regenerating designs.");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-[#0E4A7B] mx-auto"></div>
          <p className="mt-6 text-lg text-slate-700 font-semibold">
            Loading your designs...
          </p>
        </div>
      </div>
    );
  }

  if (!designResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-700 mb-6">No data found</p>
          <button
            onClick={handleStartOver}
            className="rounded-lg border border-slate-300 bg-white text-slate-800 px-6 py-3 hover:bg-slate-50 font-semibold shadow-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0E4A7B] grid place-items-center">
              <span className="text-white text-sm font-bold">IGD</span>
            </div>
            <span className="text-slate-800 font-semibold tracking-wide">
              Illinois Garage Door Repair
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4A1 1 0 018.707 6.707L6.414 9H18a1 1 0 110 2H6.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Main
            </a>
            <a
              href="tel:+18472500221"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E86A2F] px-3 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M2.25 6.75c0-1.243 1.007-2.25 2.25-2.25h2.153a1.5 1.5 0 011.408 1.03l1.043 3.13a1.5 1.5 0 01-.376 1.566L7.9 11.124a12.042 12.042 0 005.976 5.976l.898-0.828a1.5 1.5 0 011.566-.376l3.13 1.043a1.5 1.5 0 011.03 1.408V20.5a2.25 2.25 0 01-2.25 2.25H17.25C9.44 22.75 2.25 15.56 2.25 7.75V6.75z" />
              </svg>
              24/7 (847) 250-0221
            </a>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest text-[#0E4A7B] text-sm font-bold">
              Design Results
            </p>
            <h1 className="text-4xl font-extrabold text-slate-900">
              Your Garage Door Concepts
            </h1>
            <p className="mt-2 text-slate-600">
              Professional garage door transformation completed
            </p>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Order Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4">
                <span className="block text-sm font-medium text-slate-600 mb-1">
                  Phone
                </span>
                <span className="text-lg text-slate-900 font-semibold">
                  {designResult.userInfo.phone}
                </span>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4">
                <span className="block text-sm font-medium text-slate-600 mb-1">
                  Email
                </span>
                <span className="text-lg text-slate-900 font-semibold">
                  {designResult.userInfo.email}
                </span>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4">
                <span className="block text-sm font-medium text-slate-600 mb-1">
                  Number of Doors
                </span>
                <span className="text-lg text-slate-900 font-semibold">
                  {designResult.userInfo.doors}{" "}
                  {designResult.userInfo.doors === "1" ? "Door" : "Doors"}
                </span>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4">
                <span className="block text-sm font-medium text-slate-600 mb-1">
                  Garage Type
                </span>
                <span className="text-lg text-slate-900 font-semibold">
                  {designResult.userInfo.garageType === "1-car"
                    ? "Single Car"
                    : "Double Car"}
                </span>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {/* Original Image */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[#0E4A7B]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Your Original Garage
                </h3>
              </div>
              <div className="p-6">
                <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden ring-1 ring-slate-200">
                  <img
                    src={`data:image/jpeg;base64,${designResult.originalImage}`}
                    alt="Original garage"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Generated Image */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  4 Unique Door Styles
                </h3>
              </div>
              <div className="p-6">
                <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden ring-1 ring-slate-200">
                  {regenerating ? (
                    <div className="w-full h-full flex items-center justify-center bg-white/70">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-[#0E4A7B] mx-auto mb-4"></div>
                        <p className="text-slate-800 font-semibold">
                          Generating new designs...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={`data:image/png;base64,${designResult.generatedImage}`}
                      alt="New garage designs"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleDownloadImage}
              className="rounded-xl border border-slate-300 bg-white text-slate-800 px-6 py-3 hover:bg-slate-50 font-semibold text-base shadow-sm transition flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download
            </button>
            <button
              onClick={handleRegenerateDesigns}
              disabled={regenerating}
              className="rounded-xl bg-[#0E4A7B] hover:brightness-110 disabled:brightness-100 text-white px-6 py-3 font-semibold text-base shadow transition flex items-center justify-center disabled:opacity-60"
            >
              {regenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Regenerating...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Regenerate
                </>
              )}
            </button>
            <button
              onClick={handleStartOver}
              className="rounded-xl bg-[#E86A2F] hover:brightness-110 text-white px-6 py-3 font-semibold text-base shadow transition flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              New Design
            </button>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              What&apos;s Next?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 flex items-start">
                <div className="text-2xl mr-4">🎨</div>
                <div>
                  <h4 className="text-slate-900 font-semibold mb-1">
                    Design Options
                  </h4>
                  <p className="text-slate-700">
                    4 distinct styles: Modern Minimalist, Traditional Raised
                    Panel, Carriage House, and Contemporary Glass Panel. Use
                    &quot;Regenerate&quot; to get new variations.
                  </p>
                </div>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 flex items-start">
                <div className="text-2xl mr-4">📱</div>
                <div>
                  <h4 className="text-slate-900 font-semibold mb-1">
                    Personal Contact
                  </h4>
                  <p className="text-slate-700">
                    Our manager will contact you via phone to discuss details.
                  </p>
                </div>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 flex items-start">
                <div className="text-2xl mr-4">📧</div>
                <div>
                  <h4 className="text-slate-900 font-semibold mb-1">
                    Email Delivery
                  </h4>
                  <p className="text-slate-700">
                    A copy of your designs will be sent to your email address.
                  </p>
                </div>
              </div>
              <div className="rounded-xl ring-1 ring-slate-200 bg-slate-50 p-4 flex items-start">
                <div className="text-2xl mr-4">🏗️</div>
                <div>
                  <h4 className="text-slate-900 font-semibold mb-1">
                    Implementation
                  </h4>
                  <p className="text-slate-700">
                    We&apos;ll help bring your chosen design to reality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
