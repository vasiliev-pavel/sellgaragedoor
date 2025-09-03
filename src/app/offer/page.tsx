// src/app/offer/page.tsx (ИСПРАВЛЕННАЯ ВЕРСИЯ)

"use client";

import Link from "next/link"; // Already imported, which is good
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TYPES AND MOCK DATA ---
type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

interface UserIntake {
  phone: string;
  email: string;
  doors: string;
  material: Material;
}

interface PagePayload {
  originalImage?: string;
  generatedImage?: string;
  intake?: UserIntake;
}

interface DoorOption {
  id: string;
  name: string;
  material: string;
  rValue?: number;
  basePrice: number;
  installPrice: number;
  imageLabel: "A" | "B" | "C" | "D";
  description: string;
}

const DOOR_CATALOG: DoorOption[] = [
  {
    id: "steel-flush",
    name: "Modern Steel",
    material: "Insulated Steel",
    rValue: 13,
    basePrice: 1250,
    installPrice: 400,
    imageLabel: "A",
    description:
      "Sleek, durable, and energy-efficient. A popular choice for modern homes.",
  },
  {
    id: "carriage-composite",
    name: "Carriage House",
    material: "Wood Composite",
    rValue: 10,
    basePrice: 1590,
    installPrice: 450,
    imageLabel: "B",
    description:
      "Classic charm without the maintenance of real wood. Great curb appeal.",
  },
  {
    id: "aluminum-glass",
    name: "Full-View Glass",
    material: "Aluminum & Glass",
    rValue: 4,
    basePrice: 2100,
    installPrice: 550,
    imageLabel: "C",
    description:
      "Maximizes natural light and provides a stunning, contemporary look.",
  },
  {
    id: "wood-panel",
    name: "Raised Panel Wood",
    material: "Solid Hemlock",
    basePrice: 1950,
    installPrice: 500,
    imageLabel: "D",
    description: "The timeless beauty and premium feel of natural wood grain.",
  },
];

function computeTradeInCredit(doors: string, material: Material): number {
  const count = Math.max(1, parseInt(doors || "1", 10));
  const perDoorCredit = material === "wood" ? 75 : 120;
  return perDoorCredit * count;
}

export default function OfferPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<PagePayload | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<"A" | "B" | "C" | "D">(
    "A"
  );

  useEffect(() => {
    const savedData = sessionStorage.getItem("garageDesigns");
    if (!savedData) {
      router.push("/");
      return;
    }
    try {
      setPayload(JSON.parse(savedData) as PagePayload);
    } catch {
      router.push("/");
    }
  }, [router]);

  const intake = payload?.intake;

  const tradeInCredit = useMemo(() => {
    if (!intake) return 0;
    return computeTradeInCredit(intake.doors, intake.material);
  }, [intake]);

  const getFullPrice = (option: DoorOption) =>
    option.basePrice + option.installPrice;

  if (!payload || !intake) {
    return (
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-slate-700">
            {"Generating your personalized offer..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 min-h-screen">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          {/* FIX 1: Using <Link> for internal navigation */}
          <Link
            href="/"
            aria-label="Illinois Garage Door Repair — home"
            className="flex items-center"
          >
            <Image
              src="https://illinoisgaragedoorrepair.com/images/logo-new-illinois-garage-door-repair-company-lake-cook-county-il350x171.webp"
              alt="Illinois Garage Door Repair Chicago logo"
              width={350}
              height={171}
              priority
              className="h-14 w-auto"
            />
          </Link>
          {/* External links like "tel:" correctly use the <a> tag */}
          <a
            href="tel:+18472500221"
            className="text-sm font-semibold text-slate-800 hover:text-blue-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M2 5l5-2 3 5-3 2a16 16 0 007 7l2-3 5 3-2 5c-7 1-16-8-15-17z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">{"Questions? Call Us:"}</span>
            <span className="font-bold">(847) 250-0221</span>
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              {/* FIX 3: Escaping apostrophe */}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                {"Your Home's Transformation & Instant Savings"}
              </h1>
              {/* FIX 3: Escaping apostrophes */}
              <p className="mt-3 text-lg text-slate-600">
                {
                  "You're one step away from a stunning new look. We've applied 4 popular styles to your photo. Select an option below to see your final price with your trade-in credit applied."
                }
              </p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-100">
                {payload.generatedImage ? (
                  <>
                    {/* FIX 2: Using <Image> instead of <img> */}
                    <Image
                      src={`data:image/png;base64,${payload.generatedImage}`}
                      alt="A composite image showing four different garage door styles on your home"
                      layout="fill"
                      objectFit="cover"
                    />
                    {(["A", "B", "C", "D"] as const).map((label, idx) => {
                      const pos = [
                        "top-0 left-0",
                        "top-0 right-0",
                        "bottom-0 left-0",
                        "bottom-0 right-0",
                      ][idx];
                      return (
                        <div
                          key={label}
                          className={`absolute ${pos} w-1/2 h-1/2`}
                        >
                          <span
                            className={`absolute inset-2 rounded-lg transition-all duration-300 ring-4 ${
                              selectedStyle === label
                                ? "ring-blue-600 ring-offset-2 ring-offset-slate-900/50"
                                : "ring-transparent"
                            }`}
                          ></span>
                          <span
                            className={`absolute top-3 left-3 inline-flex items-center justify-center rounded-md px-2.5 py-1 text-sm font-bold transition ${
                              selectedStyle === label
                                ? "bg-blue-600 text-white"
                                : "bg-slate-900/60 text-white"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="w-full h-full grid place-items-center text-slate-500 font-medium">
                    Preview Image Not Available
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight">
                Select a Style to See Your Price
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {DOOR_CATALOG.map((opt) => {
                  const isSelected = selectedStyle === opt.imageLabel;
                  const fullPrice = getFullPrice(opt);
                  const finalPrice = Math.max(0, fullPrice - tradeInCredit);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedStyle(opt.imageLabel)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-white border-blue-600 shadow-lg"
                          : "bg-white border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg text-slate-900">
                            {opt.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {opt.material}
                            {opt.rValue && ` • R-${opt.rValue}`}
                          </p>
                        </div>
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-800 text-white"
                          }`}
                        >
                          {opt.imageLabel}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        {opt.description}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 line-through">
                          MSRP + Install: ${fullPrice}
                        </p>
                        <p className="text-sm">
                          {"After Trade-in:"}{" "}
                          <span className="text-2xl font-bold text-emerald-600">
                            ${finalPrice}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Your Exclusive Trade-In Offer
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  For your {intake.doors} old{" "}
                  <span className="font-medium capitalize">
                    {intake.material.replace("_", " ")}
                  </span>{" "}
                  door(s).
                </p>
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-800">
                    Instant Credit Value
                  </p>
                  <p className="text-4xl font-extrabold text-emerald-600">
                    ${tradeInCredit}
                  </p>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  We haul away your old door for free. Final value confirmed
                  during your on-site measurement.
                </p>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold">
                  Ready to Finalize Your Choice?
                </h3>
                <p className="mt-2 text-slate-300 text-sm">
                  Lock in your price and get a precise, no-obligation quote. Our
                  Chicago-based team is ready to help. An expert will confirm
                  measurements and answer all your questions.
                </p>
                <a
                  href="tel:+18472500221"
                  className="mt-5 block w-full text-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
                >
                  Schedule Free Measure & Lock Price
                </a>
                <button
                  onClick={() => router.push("/")}
                  className="mt-3 w-full text-center rounded-xl bg-transparent border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  Or Edit My Details
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Illinois Garage Door Repair Co.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {
                "Proudly Serving Chicago & All Suburbs. Your neighbors trust us."
              }
            </p>
          </div>
          <p className="mt-4 text-sm text-slate-500 lg:mt-0">
            © {new Date().getFullYear()} All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
