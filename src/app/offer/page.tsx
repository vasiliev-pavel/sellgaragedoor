"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Material = "steel" | "wood" | "aluminum" | "fiberglass_composite";

interface Intake {
  phone: string;
  email: string;
  doors: string; // "1" | "2" | "3"
  garageType: string; // "1-car" | "2-car"
  material: Material;
}

interface Payload {
  originalImage?: string;
  generatedImage?: string;
  userInfo?: any;
  intake?: Intake;
}

interface OfferOption {
  id: string;
  name: string;
  material: string;
  rValue?: number;
  msrp: number;
  install: number;
  imageLabel: "A" | "B" | "C" | "D";
}

const CATALOG: OfferOption[] = [
  {
    id: "modern-flush",
    name: "Modern Flush",
    material: "Insulated Steel",
    rValue: 12,
    msrp: 1190,
    install: 380,
    imageLabel: "A",
  },
  {
    id: "raised-panel",
    name: "Traditional Raised Panel",
    material: "Steel",
    rValue: 9,
    msrp: 990,
    install: 360,
    imageLabel: "B",
  },
  {
    id: "carriage",
    name: "Carriage House",
    material: "Composite",
    rValue: 10,
    msrp: 1490,
    install: 420,
    imageLabel: "C",
  },
  {
    id: "glass",
    name: "Contemporary Glass",
    material: "Aluminum/Glass",
    rValue: 3,
    msrp: 1890,
    install: 520,
    imageLabel: "D",
  },
];

// простая логика скидки на основе материала и количества дверей
function computeTradeInCredit(doors: string, material: Material): number {
  const count = Math.max(1, parseInt(doors || "1", 10));
  const perDoor = material === "wood" ? 50 : 80; // дерево = $50, «металл» = $80
  return perDoor * count;
}

export default function OfferPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<Payload | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<
    null | "A" | "B" | "C" | "D"
  >(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("garageDesigns");
    if (!saved) {
      router.push("/");
      return;
    }
    try {
      setPayload(JSON.parse(saved) as Payload);
    } catch {
      router.push("/");
    }
  }, [router]);

  const intake = payload?.intake;

  const credit = useMemo(() => {
    if (!intake) return 0;
    return computeTradeInCredit(intake.doors, intake.material);
  }, [intake]);

  if (!payload) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-[#0E4A7B] mx-auto"></div>
          <p className="mt-6 text-lg text-slate-700 font-semibold">
            Loading your offer…
          </p>
        </div>
      </div>
    );
  }

  const composite = payload.generatedImage;
  const msrpInstall = (o: OfferOption) => o.msrp + o.install;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#0E4A7B] grid place-items-center">
              <span className="text-white text-sm font-bold">IGD</span>
            </div>
            <span className="text-slate-800 font-semibold">
              Illinois Garage Door Repair
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Main
            </a>
            <a
              href="tel:+18472500221"
              className="inline-flex items-center gap-2 rounded-lg bg-[#E86A2F] px-3 py-2 text-sm font-semibold text-white shadow hover:brightness-110 transition"
            >
              24/7 (847) 250-0221
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero preview with interactive quadrants */}
            <section className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200">
                <p className="uppercase tracking-widest text-[#0E4A7B] text-xs font-bold">
                  Preview
                </p>
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Your Home with 4 Door Styles
                </h1>
                <p className="text-slate-600 mt-1">
                  We applied four options on your own photo. Click a quadrant to
                  focus.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden ring-1 ring-slate-200 bg-slate-50">
                  {composite ? (
                    <>
                      <img
                        src={`data:image/png;base64,${composite}`}
                        alt="Composite with 4 styles"
                        className="w-full h-full object-cover"
                      />

                      {/* quadrant overlays */}
                      {(["A", "B", "C", "D"] as const).map((label, idx) => {
                        // positions: A TL, B TR, C BL, D BR
                        const pos = [
                          "top-0 left-0", // A
                          "top-0 right-0", // B
                          "bottom-0 left-0", // C
                          "bottom-0 right-0", // D
                        ][idx];
                        return (
                          <button
                            key={label}
                            aria-label={`Select style ${label}`}
                            onClick={() => setSelectedQuadrant(label)}
                            className={`absolute ${pos} w-1/2 h-1/2 outline-none transition-[box-shadow,background]`}
                            style={{ background: "transparent" }}
                          >
                            {/* inner highlight frame */}
                            <span
                              className={`absolute inset-2 rounded-lg transition ring-2
                                ${
                                  selectedQuadrant === label
                                    ? "ring-[#0E4A7B]"
                                    : "ring-transparent hover:ring-slate-300"
                                }`}
                            ></span>
                            {/* tiny label */}
                            <span
                              className={`absolute m-3 inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-bold
                                ${
                                  selectedQuadrant === label
                                    ? "bg-[#0E4A7B] text-white"
                                    : "bg-black/60 text-white"
                                }`}
                              style={{ top: 0, left: 0 }}
                            >
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <div className="w-full h-full grid place-items-center text-slate-500">
                      Composite not available
                    </div>
                  )}
                </div>

                {/* Mini legend */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "A", name: "Modern Flush" },
                    { label: "B", name: "Traditional Raised Panel" },
                    { label: "C", name: "Carriage House" },
                    { label: "D", name: "Contemporary Glass" },
                  ].map((x) => (
                    <button
                      key={x.label}
                      onClick={() =>
                        setSelectedQuadrant(x.label as "A" | "B" | "C" | "D")
                      }
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1
                        ${
                          selectedQuadrant === x.label
                            ? "ring-[#0E4A7B] bg-slate-50"
                            : "ring-slate-300 bg-white hover:bg-slate-50"
                        }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold
                        ${
                          selectedQuadrant === x.label
                            ? "bg-[#0E4A7B] text-white"
                            : "bg-slate-800 text-white"
                        }`}
                      >
                        {x.label}
                      </span>
                      <span className="text-slate-800">{x.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Value props */}
            <section className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Why homeowners choose us
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-700">
                <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                  ♻️ We buy your old door — instant credit applied.
                </div>
                <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                  🧰 Pro install & haul-away included.
                </div>
                <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                  🛡️ Parts & labor warranty.
                </div>
                <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                  ⏱️ Same/next-day appointments available.
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">FAQs</h3>
              <details className="group border-t border-slate-200 py-3">
                <summary className="cursor-pointer font-medium text-slate-800">
                  How is the trade-in credit calculated?
                </summary>
                <div className="mt-2 text-sm text-slate-600">
                  We keep it simple: wood door = $50 per door, metal door
                  (steel/aluminum/fiberglass) = $80 per door. The credit
                  multiplies by the number of doors.
                </div>
              </details>
              <details className="group border-t border-slate-200 py-3">
                <summary className="cursor-pointer font-medium text-slate-800">
                  What happens to my old door?
                </summary>
                <div className="mt-2 text-sm text-slate-600">
                  We remove it, recycle or refurbish usable materials, and apply
                  the credit to your new installation.
                </div>
              </details>
              <details className="group border-t border-slate-200 py-3">
                <summary className="cursor-pointer font-medium text-slate-800">
                  Can I change the design later?
                </summary>
                <div className="mt-2 text-sm text-slate-600">
                  Yes—your price hold lasts 7 days. We’ll confirm final style at
                  the free in-home measure.
                </div>
              </details>
            </section>
          </div>

          {/* RIGHT COLUMN (sticky) */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-4">
              {/* Summary / credit */}
              <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Your Trade-in
                </h3>
                {intake ? (
                  <>
                    <div className="mt-1 text-sm text-slate-600">
                      Current door:&nbsp;
                      <span className="font-medium capitalize">
                        {String(intake.material).replace("_", " ")}
                      </span>
                      &nbsp; • {intake.doors}{" "}
                      {intake.doors === "1" ? "door" : "doors"}
                    </div>
                    <div className="mt-3 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 p-3">
                      <div className="text-emerald-700 text-sm font-medium">
                        Estimated credit
                      </div>
                      <div className="text-2xl font-extrabold text-emerald-800">
                        ${credit}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Based on material & number of doors. Final offer confirmed
                      during on-site measure.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    Fill the form to estimate trade-in.
                  </p>
                )}
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  Edit Details
                </button>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Recommended Doors
                </h3>
                <div className="space-y-3">
                  {CATALOG.map((opt) => {
                    const subtotal = msrpInstall(opt);
                    const after = Math.max(0, subtotal - credit);
                    const selected = selectedQuadrant === opt.imageLabel;
                    return (
                      <div
                        key={opt.id}
                        className={`rounded-xl p-4 ring-1 bg-slate-50 ${
                          selected ? "ring-[#0E4A7B]" : "ring-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-900">
                              {opt.name}
                            </div>
                            <div className="text-xs text-slate-600">
                              {opt.material}
                              {opt.rValue ? ` • R${opt.rValue}` : ""}
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                            ${
                              selected
                                ? "bg-[#0E4A7B] text-white"
                                : "bg-[#0E4A7B]/10 text-[#0E4A7B]"
                            }`}
                          >
                            {selected ? "Selected" : "Trade-in applied"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-700">
                          After trade-in:{" "}
                          <span className="font-bold">${after}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500 line-through">
                          MSRP + install: ${subtotal}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="flex-1 rounded-lg bg-white ring-1 ring-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                            onClick={() => setSelectedQuadrant(opt.imageLabel)}
                          >
                            See on My Home ({opt.imageLabel})
                          </button>
                          <button
                            className="flex-1 rounded-lg bg-[#0E4A7B] text-white px-3 py-2 text-sm font-semibold hover:brightness-110"
                            onClick={() =>
                              alert(
                                "We’ll reach out to schedule a free measure."
                              )
                            }
                          >
                            Choose
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTA card */}
              <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900">Next step</h3>
                <p className="text-slate-700 text-sm mt-1">
                  Schedule a free in-home measure to finalize your offer.
                </p>
                <button
                  className="mt-4 w-full rounded-lg bg-[#E86A2F] text-white px-4 py-3 font-semibold hover:brightness-110"
                  onClick={() =>
                    alert("Open scheduling modal / link to booking.")
                  }
                >
                  Schedule Free Measure
                </button>
                <button className="mt-2 w-full rounded-lg bg-white ring-1 ring-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50">
                  Lock this price for 7 days
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-3 inset-x-3">
        <button
          onClick={() => alert("Open scheduling modal / link to booking.")}
          className="w-full rounded-xl shadow-xl bg-[#E86A2F] text-white font-semibold py-3"
        >
          Schedule Free Measure
        </button>
      </div>
    </div>
  );
}
