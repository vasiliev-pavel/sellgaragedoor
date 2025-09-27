"use client";

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

// Типы данных
export type DoorDesign = {
  id: string;
  name: string;
  imageUrl: string;
};

export type DoorColor = {
  name: string;
  hex: string;
};

type DoorDesignPickerProps = {
  onSelectionChange: (selection: { design: DoorDesign | null; color: DoorColor | null }) => void;
};

// Данные для компонента
const doorDesigns: DoorDesign[] = [
  { id: 'bridgeport_stell', name: 'Bridgeport steel', imageUrl: '/designs/placeholder-door-1.png' },
  { id: 'modern_steel', name: 'Modern Steel', imageUrl: '/designs/placeholder-door-2.png' },
  { id: 'gallery_steel', name: 'Gallery Steel', imageUrl: '/designs/placeholder-door-3.png' },
  { id: 'classic-steel', name: 'Classic Steel', imageUrl: '/designs/placeholder-door-4.png' },
];

const doorColors: DoorColor[] = [
  { name: 'Classic White', hex: '#F5F5F5' },
  { name: 'Sandstone', hex: '#D2B48C' },
  { name: 'Charcoal Gray', hex: '#36454F' },
  { name: 'Deep Brown', hex: '#5C4033' },
  { name: 'Hunter Green', hex: '#355E3B' },
  { name: 'Midnight Black', hex: '#1A1A1A' },
  { name: 'Crimson Red', hex: '#990000' },
];


export default function DoorDesignPicker({ onSelectionChange }: DoorDesignPickerProps) {
  const [selectedDesign, setSelectedDesign] = useState<DoorDesign | null>(null);
  const [selectedColor, setSelectedColor] = useState<DoorColor | null>(doorColors[0]);
  const [showMoreColors, setShowMoreColors] = useState(false);

  const handleDesignSelect = (design: DoorDesign) => {
    const newDesign = selectedDesign?.id === design.id ? null : design;
    setSelectedDesign(newDesign);
    onSelectionChange({ design: newDesign, color: selectedColor });
  };

  const handleColorSelect = (color: DoorColor) => {
    setSelectedColor(color);
    onSelectionChange({ design: selectedDesign, color });
  };

  const visibleColors = showMoreColors ? doorColors : doorColors.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Выбор дизайна */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-3">
          New Door Design
        </label>
        <div className="grid grid-cols-2 gap-4">
          {doorDesigns.map((design) => (
            <div
              key={design.id}
              onClick={() => handleDesignSelect(design)}
              className={`relative rounded-xl cursor-pointer ring-2 transition-all duration-200 group overflow-hidden ${
                selectedDesign?.id === design.id
                  ? 'ring-[#E86A2F] ring-offset-2'
                  : 'ring-transparent hover:ring-slate-300'
              }`}
            >
              <Image
                src={design.imageUrl}
                alt={design.name}
                width={300}
                height={200}
                className="w-full h-auto object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-lg"></div>
              <span className="absolute bottom-2 left-3 text-white font-semibold text-sm">
                {design.name}
              </span>
              {selectedDesign?.id === design.id && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow">
                  <CheckCircle className="h-5 w-5 text-[#E86A2F]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Выбор цвета */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-3">
          New Door Color
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {visibleColors.map((color) => (
            <button
              key={color.name}
              type="button"
              title={color.name}
              onClick={() => handleColorSelect(color)}
              className={`h-9 w-9 rounded-full border-2 transition-all duration-200 ease-in-out ${
                selectedColor?.hex === color.hex
                  ? 'border-transparent ring-2 ring-offset-2 ring-[#E86A2F] scale-110 shadow-md'
                  : 'border-white/50 hover:scale-110'
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select color ${color.name}`}
            />
          ))}
           {!showMoreColors && doorColors.length > 3 && (
              <button
                type="button"
                onClick={() => setShowMoreColors(true)}
                className="text-sm font-semibold text-[#0E4A7B] hover:underline"
              >
                Show More...
              </button>
            )}
        </div>
      </div>
    </div>
  );
}