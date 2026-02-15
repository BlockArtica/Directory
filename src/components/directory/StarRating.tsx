"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count: number;
}

export default function StarRating({ rating, count }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, rating - (star - 1)));
          return (
            <div key={star} className="relative h-4 w-4">
              <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
              {fill > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}
