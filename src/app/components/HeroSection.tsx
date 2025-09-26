"use client";

import Image from "next/image";
import { ArrowRightLeft, Eye, Wrench } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="lg:sticky lg:top-28">
      <h1 className="mt-2 text-4xl sm:text-5xl font-extrabold leading-tight text-slate-900">
        We Will{" "}
        <span className="text-[#E86A2F]">
          Buy Your Old Garage Door!
        </span>
      </h1>
      <p className="mt-3 text-lg text-slate-600 font-medium">
        ...with a purchase of a new door from us.
      </p>
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
        {
          "Your old garage door is your down payment on a beautiful new one. Snap a photo to get an instant trade-in credit towards a complete upgrade, professionally installed by our team."
        }
      </p>
      <div className="mt-8 space-y-4 text-slate-700">
        <div className="flex items-start gap-3">
          <ArrowRightLeft className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Instant Trade-In Value:</strong> Get a guaranteed
            credit for your old door in seconds, applied directly to
            your upgrade.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <Wrench className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Free Removal & Full Service:</strong> When you
            upgrade, we handle the complete removal and haul-away of
            your old door at no extra cost.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <Eye className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Visualize Your Upgrade:</strong> See how different
            styles of new doors will look on your actual home before
            making a decision.
          </span>
        </div>
      </div>
    </section>
  );
}