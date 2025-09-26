"use client";

import { Star } from "lucide-react";

// Определяем тип для пропсов
type StarRatingProps = {
  rating?: number;
};

export default function StarRating({ rating = 5 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {/* Создаем массив из 5 элементов для рендеринга звезд */}
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
}