import { useState, useEffect } from 'react';

interface FlashSaleCountdownProps {
  targetDate: Date | { toDate: () => Date } | null;
  className?: string;
}

export default function FlashSaleCountdown({ targetDate, className = '' }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!targetDate) return;

    const target = typeof targetDate === 'object' && 'toDate' in targetDate ? targetDate.toDate() : new Date(targetDate);

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-accent">{pad(timeLeft.hours)}</span>
        </div>
        <span className="text-white font-bold">:</span>
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-accent">{pad(timeLeft.minutes)}</span>
        </div>
        <span className="text-white font-bold">:</span>
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-accent">{pad(timeLeft.seconds)}</span>
        </div>
      </div>
      <div className="flex gap-3 ml-1">
        <span className="text-[10px] text-white/80 font-medium">Jam</span>
        <span className="text-[10px] text-white/80 font-medium">Men</span>
        <span className="text-[10px] text-white/80 font-medium">Dtk</span>
      </div>
    </div>
  );
}
