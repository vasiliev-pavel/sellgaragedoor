"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, Check, AlertTriangle, Eye, Sparkles } from "lucide-react";

// --- ТИПЫ И ДАННЫЕ ---
type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

// ИЗМЕНЕНИЕ: Обновлен интерфейс для соответствия данным из формы
interface UserIntake {
  phone: string;
  email: string;
  singleDoors: number;
  doubleDoors: number;
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

// ИЗМЕНЕНИЕ: Новая функция для расчета скидки
function computeTradeInCredit(
  singleDoors: number,
  doubleDoors: number,
  material: Material
): number {
  const singleDoorCredit = material === "wood" ? 75 : 120;
  const doubleDoorCredit = material === "wood" ? 130 : 200;
  const totalSingleCredit = singleDoors * singleDoorCredit;
  const totalDoubleCredit = doubleDoors * doubleDoorCredit;
  return totalSingleCredit + totalDoubleCredit;
}

export default function OfferPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<PagePayload | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<"A" | "B" | "C" | "D">(
    "A"
  );
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [splitImages, setSplitImages] = useState<string[]>([]);
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem("garageDesigns");
    if (!savedData) {
      router.push("/");
      return;
    }
    try {
      const parsedData = JSON.parse(savedData) as PagePayload;

      // ИЗМЕНЕНИЕ: Преобразуем строковые значения в числа после получения из sessionStorage
      if (parsedData.intake) {
        parsedData.intake.singleDoors = parseInt(
          String((parsedData.intake as any).singleDoors || 0),
          10
        );
        parsedData.intake.doubleDoors = parseInt(
          String((parsedData.intake as any).doubleDoors || 0),
          10
        );
      }
      setPayload(parsedData);

      if (parsedData.generatedImage) {
        const img = new window.Image();
        img.src = `data:image/png;base64,${parsedData.generatedImage}`;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const w = img.width,
            h = img.height,
            halfW = w / 2,
            halfH = h / 2;
          canvas.width = halfW;
          canvas.height = halfH;
          const quadrants = [
            { x: 0, y: 0 },
            { x: halfW, y: 0 },
            { x: 0, y: halfH },
            { x: halfW, y: halfH },
          ];
          const imagesDataUrls = quadrants.map((q) => {
            ctx.clearRect(0, 0, halfW, halfH);
            ctx.drawImage(img, q.x, q.y, halfW, halfH, 0, 0, halfW, halfH);
            return canvas.toDataURL();
          });
          setSplitImages(imagesDataUrls);
        };
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const intake = payload?.intake;

  // ИЗМЕНЕНИЕ: Вызов функции теперь корректен и не вызовет ошибку
  const tradeInCredit = useMemo(() => {
    if (!intake) return 0;
    return computeTradeInCredit(
      intake.singleDoors,
      intake.doubleDoors,
      intake.material
    );
  }, [intake]);

  const selectedDoor = useMemo(
    () => DOOR_CATALOG.find((d) => d.imageLabel === selectedStyle),
    [selectedStyle]
  );
  const activeAfterImage = useMemo(() => {
    const styleIndex = ["A", "B", "C", "D"].indexOf(selectedStyle);
    return splitImages.length > styleIndex ? splitImages[styleIndex] : null;
  }, [selectedStyle, splitImages]);

  const getFullPrice = (option: DoorOption) =>
    option.basePrice + option.installPrice;

  const handleConfirmOffer = async () => {
    if (
      !payload?.intake ||
      !selectedDoor ||
      !activeAfterImage ||
      !payload.originalImage
    )
      return;
    setEmailStatus("sending");
    try {
      const response = await fetch("/api/confirm-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInfo: payload.intake,
          selectedDoor: selectedDoor,
          tradeInCredit: tradeInCredit,
          originalImage: payload.originalImage,
          selectedDesignImage: activeAfterImage.split(",")[1],
          generatedImage: payload.generatedImage,
        }),
      });
      setEmailStatus(response.ok ? "success" : "error");
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      setEmailStatus("error");
    }
  };

  const ConfirmButton = ({ isMobile = false }: { isMobile?: boolean }) => {
    const baseClasses =
      "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white shadow-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
    switch (emailStatus) {
      case "sending":
        return (
          <button
            disabled
            className={`${baseClasses} bg-slate-400 cursor-not-allowed`}
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Sending...
          </button>
        );
      case "success":
        return (
          <button
            disabled
            className={`${baseClasses} bg-emerald-500 cursor-not-allowed`}
          >
            <Check size={20} /> Offer Sent!
          </button>
        );
      case "error":
        return (
          <button
            onClick={handleConfirmOffer}
            className={`${baseClasses} bg-red-500 hover:bg-red-600 focus-visible:outline-red-600`}
          >
            <AlertTriangle size={20} /> Try Again
          </button>
        );
      default:
        return (
          <button
            onClick={handleConfirmOffer}
            className={`${baseClasses} bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600`}
          >
            <Mail size={isMobile ? 18 : 20} />
            {isMobile ? "Confirm" : "Confirm Offer by Email"}
          </button>
        );
    }
  };

  if (!payload || !intake || !selectedDoor || splitImages.length === 0) {
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

  // Новая функция для форматирования текста о дверях
  const formatDoorDescription = (
    single: number,
    double: number,
    material: string
  ) => {
    const parts = [];
    if (single > 0) {
      parts.push(`${single} single ${material} door${single > 1 ? "s" : ""}`);
    }
    if (double > 0) {
      parts.push(`${double} double ${material} door${double > 1 ? "s" : ""}`);
    }
    if (parts.length === 0) {
      return `For your old ${material} door(s).`;
    }
    return `For your ${parts.join(" and ")}.`;
  };

  const finalPriceForSelected = Math.max(
    0,
    getFullPrice(selectedDoor) - tradeInCredit
  );

  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 min-h-screen pb-40 lg:pb-0">
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
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

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                {"Your Home's Transformation & Instant Savings"}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                {
                  "We've applied 4 popular styles to your photo. Use the toggle to compare with your original door. Select a style below to change the preview."
                }
              </p>
            </section>
            <section className="space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={() => setIsShowingOriginal(!isShowingOriginal)}
                  className="flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
                >
                  {isShowingOriginal ? (
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-500" />
                  )}
                  <span>
                    {isShowingOriginal ? "Show New Design" : "Show Original"}
                  </span>
                </button>
              </div>
              <div className="relative aspect-video w-full rounded-xl bg-slate-100 overflow-hidden ring-1 ring-slate-200">
                <AnimatePresence initial={false}>
                  {isShowingOriginal ? (
                    <motion.div
                      key="before"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={`data:image/png;base64,${payload.originalImage}`}
                        alt="Your original garage door"
                        layout="fill"
                        objectFit="cover"
                      />
                      <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-bold py-1 px-2 rounded">
                        BEFORE
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={selectedStyle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      {activeAfterImage && (
                        <Image
                          src={activeAfterImage}
                          alt={`After view - ${selectedDoor.name}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      )}
                      <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">
                        AFTER
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold tracking-tight">
                {'Select a Style to Update "After" Preview'}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {DOOR_CATALOG.map((opt) => {
                  const isSelected = selectedStyle === opt.imageLabel;
                  const fullPrice = getFullPrice(opt);
                  const finalPrice = Math.max(0, fullPrice - tradeInCredit);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSelectedStyle(opt.imageLabel);
                        setIsShowingOriginal(false);
                      }}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "bg-white border-blue-600 shadow-lg ring-2 ring-blue-200"
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
          <aside className="hidden lg:block lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Your Exclusive Trade-In Offer
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDoorDescription(
                    intake.singleDoors,
                    intake.doubleDoors,
                    intake.material
                  )}
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
                <h3 className="text-xl font-bold">Ready to Finalize?</h3>
                <p className="mt-2 text-slate-300 text-sm">
                  {
                    "Lock in your price by confirming your selection. We'll email you a copy and call you shortly."
                  }
                </p>
                <div className="mt-5 space-y-3">
                  <ConfirmButton />
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase">
                      Or
                    </span>
                    <div className="flex-grow border-t border-slate-600"></div>
                  </div>
                  <a
                    href="tel:+18472500221"
                    className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-white shadow-sm transition-colors bg-slate-700 hover:bg-slate-600"
                  >
                    <Phone size={20} /> Call Us Directly
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <AnimatePresence>
        {selectedDoor && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] p-3"
          >
            <div className="mx-auto max-w-md flex items-center gap-3">
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {selectedDoor.name}
                </p>
                <p className="text-xs text-slate-500">
                  {"Final Price:"}{" "}
                  <span className="font-bold text-lg text-emerald-600">
                    ${finalPriceForSelected}
                  </span>
                </p>
              </div>
              <div className="flex-shrink-0 w-36">
                <ConfirmButton isMobile={true} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
