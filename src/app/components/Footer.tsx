import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  CalendarDays,
  PhoneCall,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronRight,
} from "lucide-react";

// Иконки для социальных сетей
const socialLinks = [
  { Icon: Facebook, href: "#" },
  { Icon: Twitter, href: "#" },
  { Icon: Instagram, href: "#" },
  // Замените иконки-плейсхолдеры на нужные вам (например, Yelp, Houzz)
  { Icon: Phone, href: "#" },
  { Icon: MapPin, href: "#" },
  { Icon: Youtube, href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-[#191919] text-gray-300 font-sans">
        <div className="mx-auto max-w-screen-2xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          {/* Иконки социальных сетей */}
          <div className="flex justify-center mb-8 border-b border-gray-800 pb-8">
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white h-9 w-9 rounded-full border-2 border-gray-600 flex items-center justify-center transition-colors"
                >
                  <social.Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Основная сетка футера */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            {/* Колонка 1: Ссылки по сайту */}
            <div className="md:col-span-1">
              <h3 className="font-semibold text-white mb-4 tracking-wide">
                Site Links{" "}
              </h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Home{" "}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Garage Door Installation{" "}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Garage Door Repair
                    <ChevronRight className=" h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Garage Door Openers{" "}
                    <ChevronRight className=" h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Garage Door Springs{" "}
                    <ChevronRight className=" h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Garage Door Cables{" "}
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="group inline-flex items-center hover:text-white transition-colors"
                  >
                    Contact Us
                    <ChevronRight className=" h-4 w-4  group-hover:translate-x-0.5" />
                  </Link>
                </li>
              </ul>
              <hr className="mt-4 border-gray-700" />
            </div>

            {/* Колонка 2: Информация о компании */}
            <div className="lg:col-span-2 text-center flex flex-col items-center">
              <h3 className="font-semibold text-white mb-4 tracking-wide">
                Illinois Garage Door Repair | Northbrook IL
              </h3>

              {/* Контейнер для контактной информации */}
              <div className="space-y-3 max-w-xs mx-auto">
                {/* Строка с адресом */}
                <div className="flex items-start text-left">
                  <MapPin className="h-4 w-4 mr-3 mt-1 flex-shrink-0 text-gray-400" />
                  <div>
                    <strong className="text-white">
                      Main Office / Northwestern Suburbs
                    </strong>
                    <p className="text-gray-400">
                      3605 Woodhead Dr #104a, Northbrook, IL 60062
                    </p>
                  </div>
                </div>

                {/* Строка с телефоном */}
                <div className="flex items-center text-left">
                  <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-400">847-250-1663</span>
                </div>
              </div>

              <div className="my-4 flex justify-center">
                <img
                  src="/logo2.png"
                  alt="Garage Door Repair Logo"
                  style={{ width: "120px" }}
                />
              </div>
              <p className="mt-2 text-white font-semibold tracking-wide">
                Local Garage Door Experts | Northbrook
              </p>
              <p className="mt-2 text-xs text-gray-500 max-w-sm mx-auto">
                We provide garage door repair and installation services across
                the vast majority of Northwest Suburbs of Chicago.
              </p>
            </div>

            {/* Колонка 3: Оплата и действия */}
            <div className="md:col-span-1">
              <h3 className="font-semibold text-white mb-4 tracking-wide">
                Various Payment Options
              </h3>
              <div className="flex items-center gap-1 mb-8">
                {/* Замените это изображение на ваше собственное с иконками оплаты */}
                <Image
                  src="varpay.png"
                  alt="Payment options"
                  width={240}
                  height={40}
                />
              </div>
              <h3 className="font-semibold text-white mb-4 tracking-wide">
                Need Garage Door Service in Northbrook?
              </h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-500 text-white rounded-md hover:bg-white hover:text-black transition-colors font-semibold"
                >
                  <CalendarDays size={16} />
                  BOOK ONLINE
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#D06224] text-white rounded-md hover:brightness-110 transition-all font-semibold"
                >
                  <PhoneCall size={16} />
                  CALL US NOW
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
            <p>
              Copyright ©{currentYear} Illinois Garage Door Repair. All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
