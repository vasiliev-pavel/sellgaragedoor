import { Star } from "lucide-react";

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

export default StarRating;
