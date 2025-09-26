"use client";

import { Material } from "../app/page"; // Предполагается, что тип Material экспортируется из page.tsx

const materials = [
  { v: "steel", l: "Steel" },
  { v: "wood", l: "Wood" },
  { v: "aluminum", l: "Aluminum" },
  { v: "fiberglass_composite", l: "Fiberglass" },
];

type MaterialSelectorProps = {
  selectedMaterial: Material;
  onMaterialSelect: (material: Material) => void;
};

export default function MaterialSelector({ selectedMaterial, onMaterialSelect }: MaterialSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-3">
        Material of Old Door(s)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {materials.map((m) => (
          <button
            key={m.v}
            type="button"
            onClick={() => onMaterialSelect(m.v as Material)}
            className={`p-3 rounded-xl border-2 text-center text-sm font-semibold text-slate-900 transition-all duration-200 ${
              selectedMaterial === m.v
                ? "border-transparent bg-[#E86A2F] text-white shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            {m.l}
          </button>
        ))}
      </div>
    </div>
  );
}