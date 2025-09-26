"use client";

import Image from "next/image";
import { UploadCloud } from "lucide-react";

type UploadSectionProps = {
  previewUrl: string | null;
  onUploadClick: () => void;
};

export default function UploadSection({ previewUrl, onUploadClick }: UploadSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-slate-900">Get Your Offer</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-8 bg-[#E86A2F] rounded-full"></div>
          <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
          <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
        </div>
      </div>
      {!previewUrl ? (
        <div className="mt-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="relative block w-full rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-[#E86A2F] bg-slate-50 transition-colors"
          >
            <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
            <span className="mt-3 block font-semibold text-slate-700">Upload a Photo</span>
            <span className="mt-1 block text-xs text-slate-500">or drag and drop</span>
          </button>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden ring-1 ring-slate-200">
          <Image
            src={previewUrl}
            alt="Your garage preview"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
          <button
            type="button"
            onClick={onUploadClick}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-white/80 backdrop-blur-sm px-5 py-2 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-900/10 hover:bg-white transition"
          >
            Change Photo
          </button>
        </div>
      )}
    </div>
  );
}