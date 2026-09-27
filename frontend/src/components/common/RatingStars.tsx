import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (newRating: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <span
            key={index}
            onClick={() => interactive && onChange && onChange(starValue)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.15s ease',
              display: 'inline-flex',
            }}
            onMouseEnter={(e) => {
              if (interactive) (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              if (interactive) (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'transparent'}
              color={isFilled ? '#f59e0b' : '#64748b'}
            />
          </span>
        );
      })}
    </div>
  );
};
