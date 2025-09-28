"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRightLeft, Eye, Wrench } from "lucide-react";

// Импорт компонентов
import TipsModal from "./components/ui/TipsModal";
import Spinner from "./components/ui/Spinner";
import UploadSection from "./components/UploadSection";
import DoorCounter from "./components/DoorCounter";
import MaterialSelector from "./components/MaterialSelector";
import DoorDesignPicker, { DoorDesign, DoorColor } from "./components/DoorDesignPicker";
import TestimonialsSection from "./components/TestimonialsSection";  

// Экспорт типов для дочерних компонентов
export type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

const HeroSection = () => (
    <section className="lg:sticky lg:top-28">
        <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
            We Will <span className="text-[#E86A2F]">Buy Your Old Garage Door!</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 font-medium">...with a purchase of a new door from us.</p>
        <div className="mt-6 relative shadow-xl rounded-2xl ring-1 ring-slate-200">
            <Image
                src="/oldnewdoor.png"
                alt="Comparison of an old and new garage door"
                width={600}
                height={300}
                className="w-full h-auto object-cover rounded-2xl"
            />
        </div>
        <p className="mt-6 text-slate-600 text-lg">
            {"Your old garage door is your down payment on a beautiful new one. Snap a photo to get an instant trade-in credit towards a complete upgrade, professionally installed by our team."}
        </p>
        <div className="mt-8 space-y-4 text-slate-700">
            <div className="flex items-start gap-3">
                <ArrowRightLeft className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Instant Trade-In Value:</strong> Get a guaranteed credit for your old door in seconds, applied directly to your upgrade.</span>
            </div>
            <div className="flex items-start gap-3">
                <Wrench className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Free Removal & Full Service:</strong> When you upgrade, we handle the complete removal and haul-away of your old door at no extra cost.</span>
            </div>
            <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>Visualize Your Upgrade:</strong> See how different styles of new doors will look on your actual home before making a decision.</span>
            </div>
        </div>
    </section>
);


export default function Home() {
  const [formData, setFormData] = useState(() => {
    const initialData = {
      phone: "",
      email: "",
      singleDoors: 1,
      doubleDoors: 0,
      material: "steel" as Material,
      newDoorDesign: null as DoorDesign | null,
      newDoorColor: { name: 'Classic White', hex: '#F5F5F5' } as DoorColor | null,
    };
    if (typeof window !== "undefined") {
      initialData.phone = localStorage.getItem("garageFormPhone") || "";
      initialData.email = localStorage.getItem("garageFormEmail") || "";
    }
    return initialData;
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("garageTipsDismissed") === "1";
      setDontShowAgain(dismissed);
    }
  }, []);

  const handleTogglePersist = (persist: boolean) => {
    setDontShowAgain(persist);
    localStorage.setItem("garageTipsDismissed", persist ? "1" : "0");
  };

  const handleUploadClick = () => {
    if (dontShowAgain) {
      fileInputRef.current?.click();
    } else {
      setShowTips(true);
    }
  };
  // Вспомогательная функция для конвертации File -> base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Результат будет 'data:image/jpeg;base64,....', нам нужна только часть после запятой
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  const continueToUpload = () => {
    setShowTips(false);
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email") localStorage.setItem("garageFormEmail", value);
  };
  
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;
    if (len < 4) return phoneNumber;
    if (len < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
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
      setShowTips(false);
      const file = await compressImage(e.target.files[0]);
      setSelectedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl]);

  const handleDoorCountChange = (type: "single" | "double", amount: number) => {
    setFormData((prev) => {
        const key = type === 'single' ? 'singleDoors' : 'doubleDoors';
        const newCount = Math.max(0, Math.min(5, prev[key] + amount));
        const otherCount = type === 'single' ? prev.doubleDoors : prev.singleDoors;
        if (newCount === 0 && otherCount === 0) return prev;
        return { ...prev, [key]: newCount };
    });
  };

  const handleMaterialSelect = (material: Material) => setFormData((p) => ({ ...p, material }));

  const handleDesignSelectionChange = ({ design, color }: { design: DoorDesign | null; color: DoorColor | null }) => {
    setFormData(prev => ({ ...prev, newDoorDesign: design, newDoorColor: color }));
  };

  const validatePhoneNumber = (phone: string) => phone.replace(/[^\d]/g, "").length === 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return alert("Please upload a photo of your garage.");
    if (!formData.newDoorDesign) return alert("Please select a new door design.");
    if (!validatePhoneNumber(formData.phone)) return alert("Please enter a valid 10-digit US phone number.");
    
    setLoading(true);

    try {
      // --- ИЗМЕНЕНИЕ 1: ЗАГРУЖАЕМ ИЗОБРАЖЕНИЕ ДИЗАЙНА ---
      // Убеждаемся, что URL изображения дизайна существует
      if (!formData.newDoorDesign.imageUrl) {
        throw new Error("Selected design is missing an image URL.");
      }

      // Загружаем файл изображения дизайна по его URL
      const designImageResponse = await fetch(formData.newDoorDesign.imageUrl);
      if (!designImageResponse.ok) {
        throw new Error(`Failed to fetch design image: ${designImageResponse.statusText}`);
      }
      const designImageBlob = await designImageResponse.blob();

      // --- ИЗМЕНЕНИЕ 2: СОЗДАЕМ FORMDATA С ДВУМЯ ИЗОБРАЖЕНИЯМИ ---
      const formDataToSend = new FormData();
      // Изображение 1: Фото гаража пользователя
      formDataToSend.append("image", selectedFile); 
      // Изображение 2: Фото выбранного дизайна двери
      formDataToSend.append("designImage", designImageBlob, "design.png");

      // Добавляем остальные данные
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
  
      const response = await fetch("/api/generate-designs", { method: "POST", body: formDataToSend });
      
      if (response.ok) {
        const result = await response.json(); 
        const originalImageBase64 = await fileToBase64(selectedFile);
        const payloadForOfferPage = {
          imageData: result.imageData,
          originalImageData: originalImageBase64,
          intake: formData,
        };
        sessionStorage.setItem("garageDesigns", JSON.stringify(payloadForOfferPage));
        localStorage.removeItem("garageFormPhone");
        localStorage.removeItem("garageFormEmail");
        router.push("/offer");
      } else {
         const errorResult = await response.json();
         alert(`An error occurred: ${errorResult.error || "Please try again."}`);
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3]">
      <TipsModal
        open={showTips}
        onClose={() => setShowTips(false)}
        onContinue={continueToUpload}
        persist={dontShowAgain}
        onTogglePersist={handleTogglePersist}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">
            <HeroSection />
            <section>
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <UploadSection previewUrl={previewUrl} onUploadClick={handleUploadClick} />
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-3">Garage Door Setup</label>
                      <div className="grid grid-cols-2 gap-4">
                        <DoorCounter label="Single" count={formData.singleDoors} onCountChange={(amount) => handleDoorCountChange('single', amount)} />
                        <DoorCounter label="Double" count={formData.doubleDoors} onCountChange={(amount) => handleDoorCountChange('double', amount)} />
                      </div>
                    </div>
                    <MaterialSelector selectedMaterial={formData.material} onMaterialSelect={handleMaterialSelect} />
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                      <DoorDesignPicker onSelectionChange={handleDesignSelectionChange} />
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="tel" name="phone" required
                      className="block w-full bg-slate-100 border-transparent text-slate-800 rounded-xl px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-[#E86A2F] transition-all"
                      placeholder="Phone Number *" value={formData.phone} onChange={handlePhoneChange} maxLength={14}
                    />
                    <input
                      type="email" name="email" required
                      className="block w-full bg-slate-100 border-transparent text-slate-800 rounded-xl px-4 py-3 placeholder-slate-400 focus:ring-2 focus:ring-[#E86A2F] transition-all"
                      placeholder="Email Address *" value={formData.email} onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={loading || (formData.singleDoors === 0 && formData.doubleDoors === 0)}
                      className="w-full flex justify-center items-center gap-3 py-4 px-6 rounded-xl text-lg font-semibold text-white bg-[#1A1A1A] hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      {loading ? <><Spinner /> Calculating...</> : "Get My Offer"}
                    </button>
                    <p className="mt-3 text-xs text-center text-slate-500">
                      By submitting, you agree to our terms & conditions.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>

        <TestimonialsSection /> 
      </main>
    </div>
  );
}

