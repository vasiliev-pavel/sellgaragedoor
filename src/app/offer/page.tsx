"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, Check, AlertTriangle, Eye, Sparkles } from "lucide-react";

// --- ОБНОВЛЕННЫЕ ТИПЫ ДАННЫХ ---

type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

type DoorDesign = {
  id: string;
  name: string;
  imageUrl: string;
};

type DoorColor = {
  name: string;
  hex: string;
};

// Данные, которые мы получаем со страницы формы
interface UserIntake {
  phone: string;
  email: string;
  singleDoors: number;
  doubleDoors: number;
  material: Material;
  newDoorDesign: DoorDesign;
  newDoorColor: DoorColor;
}

// Данные, хранящиеся в sessionStorage
interface PagePayload {
  imageData: string;         // Сгенерированное изображение (base64)
  originalImageData: string; // Оригинальное изображение (base64)
  intake: UserIntake;
}

// Описание дверей в нашем каталоге
interface DoorOption {
  id: string; // Должен совпадать с id из DoorDesignPicker
  name: string;
  material: string;
  rValue?: number;
  basePrice: number;
  installPrice: number;
  description: string;
}

// --- КАТАЛОГ ДВЕРЕЙ ---
// ID теперь совпадают с ID из компонента DoorDesignPicker для легкого поиска
const DOOR_CATALOG: DoorOption[] = [
  {
    id: "bridgeport_stell",
    name: "Bridgeport steel",
    material: "Insulated Steel",
    rValue: 13,
    basePrice: 1250,
    installPrice: 400,
    description: "Sleek, durable, and energy-efficient. A popular choice for a timeless look.",
  },
  {
    id: "modern_steel",
    name: "Modern Steel",
    material: "Insulated Steel",
    rValue: 13,
    basePrice: 1350,
    installPrice: 400,
    description: "A minimalist and clean design, perfect for contemporary homes.",
  },
  {
    id: "gallery_steel",
    name: "Gallery Steel",
    material: "Wood Composite",
    rValue: 10,
    basePrice: 1590,
    installPrice: 450,
    description: "Classic charm without the maintenance of real wood. Great curb appeal.",
  },
  {
    id: "classic-steel",
    name: "Classic Steel",
    material: "Aluminum & Glass",
    rValue: 4,
    basePrice: 2100,
    installPrice: 550,
    description: "Maximizes natural light and provides a stunning, contemporary look.",
  },
];

// Функция расчета скидки
function computeTradeInCredit(singleDoors: number, doubleDoors: number, material: Material): number {
  const singleDoorCredit = material === "wood" ? 75 : 120;
  const doubleDoorCredit = material === "wood" ? 130 : 200;
  return singleDoors * singleDoorCredit + doubleDoors * doubleDoorCredit;
}


export default function OfferPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<PagePayload | null>(null);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [isShowingOriginal, setIsShowingOriginal] = useState(false);
  
  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    const savedData = sessionStorage.getItem("garageDesigns");
    if (!savedData) {
      router.push("/");
      return;
    }
    try {
      const parsedData: PagePayload = JSON.parse(savedData);
      
      // Валидация данных
      if (!parsedData.imageData || !parsedData.intake?.newDoorDesign) {
         throw new Error("Invalid data structure in sessionStorage");
      }

      // Приводим строковые значения к числам
      parsedData.intake.singleDoors = Number(parsedData.intake.singleDoors || 0);
      parsedData.intake.doubleDoors = Number(parsedData.intake.doubleDoors || 0);

      setPayload(parsedData);
    } catch (e) {
      console.error("Failed to parse session data:", e);
      router.push("/");
    }
  }, [router]);

  // --- ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ---

  const intake = payload?.intake;

  const tradeInCredit = useMemo(() => {
    if (!intake) return 0;
    return computeTradeInCredit(intake.singleDoors, intake.doubleDoors, intake.material);
  }, [intake]);

  // Находим полную информацию о выбранной двери в нашем каталоге
  const selectedDoorDetails = useMemo(() => {
    if (!intake?.newDoorDesign.id) return null;
    return DOOR_CATALOG.find((d) => d.id === intake.newDoorDesign.id) ?? null;
  }, [intake]);

  const fullPrice = selectedDoorDetails ? selectedDoorDetails.basePrice + selectedDoorDetails.installPrice : 0;
  const finalPrice = Math.max(0, fullPrice - tradeInCredit);

  // --- ОБРАБОТЧИКИ СОБЫТИЙ ---
  
  const handleConfirmOffer = async () => {
    if (!payload || !selectedDoorDetails) return;
    setEmailStatus("sending");
    try {
      // Здесь будет логика отправки письма
      // Например, вызов fetch('/api/confirm-offer', ...)
      console.log("Sending confirmation:", {
        userInfo: payload.intake,
        selectedDoor: selectedDoorDetails,
        tradeInCredit,
        finalPrice,
        generatedImage: payload.imageData,
      });
       // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmailStatus("success");
    } catch (error) {
      console.error("Failed to send confirmation:", error);
      setEmailStatus("error");
    }
  };

  // --- РЕНДЕР КОМПОНЕНТОВ ---

  // Компонент кнопки подтверждения с разными состояниями
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

  // Экран загрузки
  if (!payload || !intake || !selectedDoorDetails) {
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

  // Основной рендер страницы
  return (
    <main className="bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 min-h-screen pb-40 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          
          {/* Левая колонка: Визуализация и детали выбора */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                {"Your Home's Transformation & Instant Savings"}
              </h1>
              <p className="mt-3 text-lg text-slate-600">
                {"Here is a preview of your new garage door. Use the toggle to compare it with your original photo."}
              </p>
            </section>
            
            {/* Секция с изображением До/После */}
            <section className="space-y-4">
              <div className="flex justify-center">
                 <button
                  onClick={() => setIsShowingOriginal(!isShowingOriginal)}
                  className="flex items-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
                >
                  {isShowingOriginal ? <Sparkles className="h-5 w-5 text-blue-500" /> : <Eye className="h-5 w-5 text-slate-500" />}
                  <span>{isShowingOriginal ? "Show New Design" : "Show Original"}</span>
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
            src={`data:image/jpeg;base64,${payload.originalImageData}`}
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
          key="after"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={`data:image/png;base64,${payload.imageData}`}
            alt={`After view - ${selectedDoorDetails.name}`}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded">
            AFTER
          </div>
        </motion.div>
      )}
   </AnimatePresence>
</div>
            </section>

            {/* Секция с деталями выбранного дизайна */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight">Your Selection</h2>
              <div className="mt-4 bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-lg ring-2 ring-blue-200">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xl text-slate-900">{selectedDoorDetails.name}</p>
                      <p className="text-sm text-slate-500">{selectedDoorDetails.material}{selectedDoorDetails.rValue && ` • R-${selectedDoorDetails.rValue}`}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-600 text-sm">{intake.newDoorColor.name}</span>
                        <div className="h-8 w-8 rounded-full border-2 border-white/80 shadow-md" style={{ backgroundColor: intake.newDoorColor.hex }}></div>
                    </div>
                 </div>
                 <p className="mt-3 text-sm text-slate-600">{selectedDoorDetails.description}</p>
                 <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 md:items-center gap-4">
                    <div className="text-center md:text-left">
                        <p className="text-xs text-slate-500">MSRP + Install</p>
                        <p className="text-lg font-semibold line-through">${fullPrice}</p>
                    </div>
                     <div className="text-center md:text-left">
                        <p className="text-xs text-slate-500">Your Trade-in Credit</p>
                        <p className="text-lg font-semibold text-red-600">-${tradeInCredit}</p>
                    </div>
                     <div className="bg-emerald-50 rounded-lg p-3 text-center">
                        <p className="text-sm font-semibold text-emerald-800">Final Price</p>
                        <p className="text-3xl font-bold text-emerald-600">${finalPrice}</p>
                    </div>
                 </div>
              </div>
            </section>
          </div>
          
          {/* Правая колонка (сайдбар): Оффер и кнопки */}
          <aside className="hidden lg:block lg:col-span-1 mt-12 lg:mt-0">
             {/* ... (код для aside остается без изменений) ... */}
          </aside>
        </div>
      </div>
      
      {/* Нижняя плашка для мобильных устройств */}
      <AnimatePresence>
        {selectedDoorDetails && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] p-3"
          >
            <div className="mx-auto max-w-md flex items-center gap-3">
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{selectedDoorDetails.name}</p>
                <p className="text-xs text-slate-500">{"Final Price:"}{" "}<span className="font-bold text-lg text-emerald-600">${finalPrice}</span></p>
              </div>
              <div className="flex-shrink-0 w-36">
                <ConfirmButton isMobile={true} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}