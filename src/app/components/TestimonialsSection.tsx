"use client";

import { Star } from "lucide-react";

// Вспомогательный компонент для отображения рейтинга
const StarRating = ({ rating = 5 }: { rating?: number }) => (
  <div className="flex items-center gap-0.5">
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

// Данные для отзывов
const testimonials = [
  {
    name: "Sarah L.",
    rating: 5,
    quote:
      "The entire process was seamless! From uploading a photo to the final installation, the team was professional and efficient. My new garage door looks amazing.",
    location: "Naperville, IL",
  },
  {
    name: "Mark P.",
    rating: 5,
    quote:
      "I was skeptical about the AI visualization, but it was surprisingly accurate and helped us choose the perfect style. The trade-in offer was fair. Highly recommend!",
    location: "Northbrook, IL",
  },
  {
    name: "David Chen",
    rating: 5,
    quote:
      "Great service and a fantastic deal. Getting a credit for our old, beat-up door was a huge plus. The installers were courteous and cleaned up everything.",
    location: "Chicago, IL",
  },
];


export default function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Trusted by Homeowners Across Chicagoland
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-slate-600">
            We&apos;re proud of our reputation for quality work and happy
            customers.
          </p>
        </div>
        <div className="mt-20 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-lg transform hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">
                  {testimonial.name}
                </p>
                <StarRating rating={testimonial.rating} />
              </div>
              <blockquote className="mt-4 text-slate-700 italic">
                <p>{`"${testimonial.quote}"`}</p>
              </blockquote>
              <footer className="mt-4 text-sm text-slate-500">
                From{" "}
                <span className="font-semibold text-slate-600">
                  {testimonial.location}
                </span>
              </footer>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <a
            href="https://www.google.com/search?q=illinois+garage+door+repair#reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-800 shadow-md ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
          >
            Read More Reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}