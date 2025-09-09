import Image from "next/image";
import Link from "next/link";
import { PhoneCall, CalendarDays, Clock, CalendarCheck } from "lucide-react";
import StarRating from "./StarRating"; // Предполагается, что StarRating в этой же папке

export default function Header() {
  return (
    <header className="font-sans border-b">
      {/* Верхняя часть хедера */}
      <div className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1. Логотип */}
            <div className="flex justify-center md:justify-start">
              <Link href="/" className="flex flex-col items-center">
                {/* ЗАМЕНИТЕ ЭТОТ ПУТЬ НА ВАШ ЛОГОТИП */}
                <Image
                  src="https://illinoisgaragedoorrepair.com/images/logo-new-illinois-garage-door-repair-company-lake-cook-county-il350x171.webp"
                  alt="Illinois Garage Door Repair Logo"
                  width={220}
                  height={120}
                  className="h-auto"
                />
              </Link>
            </div>

            {/* 2. Центральная информация */}
            <div className="text-center">
              <p className="text-sm text-[#0F2D4A]">
                Garage Door Repair Lake, Cook, McHenry, DuPage, Kane, Will
                Counties
              </p>
              <h1 className="text-3xl font-extrabold text-[#0F2D4A] my-2 tracking-tight">
                ILLINOIS GARAGE DOOR REPAIR®
              </h1>
              <div className="inline-flex items-center gap-4 text-sm text-gray-600 border-t border-b border-[#0F2D4A] py-1.5 px-4">
                <div className="flex items-center gap-1.5">
                  <Clock size={18} className="text-red-500" />
                  <span>24/7 Emergency Service</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarCheck size={18} className="text-red-500" />
                  <span>Same-Day Appointment</span>
                </div>
              </div>
            </div>

            {/* 3. Кнопки действий */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-sm text-gray-600">
                Local Service.{" "}
                <span className="font-semibold text-[#D95D1A]">
                  Contact Us Now!
                </span>
              </p>
              <a
                href="tel:847-250-9587"
                className="w-full md:w-auto text-center px-6 py-2.5 font-bold bg-[#D95D1A] text-white rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall size={18} />
                847-250-9587
              </a>
              <a
                href="#"
                className="w-full md:w-auto text-center px-6 py-2.5 font-bold bg-[#0F2D4A] text-white rounded-md hover:bg-black transition-colors flex items-center justify-center gap-2"
              >
                <CalendarDays size={18} />
                BOOK ONLINE
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя навигационная полоса */}
      <nav className="bg-[#0F2D4A] h-6"></nav>
    </header>
  );
}
