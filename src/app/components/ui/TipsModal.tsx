"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, CheckCircle } from "lucide-react";

// Определяем типы для пропсов компонента
type TipsModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  onTogglePersist: (v: boolean) => void;
  persist: boolean;
};

export default function TipsModal({
  open,
  onClose,
  onContinue,
  onTogglePersist,
  persist,
}: TipsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Фон с размытием */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Контент модального окна */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-slate-500" />
                <h3 className="text-xl font-bold text-slate-900">
                  How to Take the Perfect Photo
                </h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                A good photo helps us give you an accurate offer and a realistic preview.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-3">
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src="/good-photo-example.png"
                      alt="The perfect shot for a garage door"
                      width={1280}
                      height={720}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-700">
                    The Perfect Shot
                  </p>
                </div>
                <ul className="space-y-3 text-slate-700 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-px flex-shrink-0 text-[#0E4A7B]" />
                    <span>Shoot <strong>horizontally</strong>, standing 15-25 ft back.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-px flex-shrink-0 text-[#0E4A7B]" />
                    <span>Capture the <strong>entire door</strong> plus some of the wall around it.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-px flex-shrink-0 text-[#0E4A7B]" />
                    <span>Take the photo during the <strong>day</strong> with good, even light.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-px flex-shrink-0 text-[#0E4A7B]" />
                    <span>Ensure the door is <strong>closed</strong> and nothing is blocking it.</span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Футер модального окна */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#0E4A7B] focus:ring-[#0E4A7B] focus:ring-offset-2"
                  checked={persist}
                  onChange={(e) => onTogglePersist(e.target.checked)}
                />
                Don’t show this again
              </label>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-200/70 hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#E86A2F] hover:brightness-110 shadow-sm transition"
                >
                  Continue to Upload
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}