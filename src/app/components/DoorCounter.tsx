"use client";

import { Plus, Minus } from "lucide-react";

type DoorCounterProps = {
  label: string;
  count: number;
  onCountChange: (amount: number) => void;
  maxCount?: number;
};

export default function DoorCounter({ label, count, onCountChange, maxCount = 5 }: DoorCounterProps) {
  return (
    <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between">
      <span className="font-semibold text-slate-700 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCountChange(-1)}
          disabled={count <= 0}
          className="h-6 w-6 rounded-full bg-white text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
        >
          <Minus size={14} className="mx-auto" />
        </button>
        <span className="font-bold text-slate-900 w-5 text-center">{count}</span>
        <button
          type="button"
          onClick={() => onCountChange(1)}
          disabled={count >= maxCount}
          className="h-6 w-6 rounded-full bg-white text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition"
        >
          <Plus size={14} className="mx-auto" />
        </button>
      </div>
    </div>
  );
}