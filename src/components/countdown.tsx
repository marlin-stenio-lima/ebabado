import { useEffect, useState } from "react";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function Countdown({ targetDate }: { targetDate: string }) {
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) return null;

    return (
        <div className="grid grid-cols-4 gap-4 text-center">
            <TimeUnit value={timeLeft.days} label="DIAS" />
            <TimeUnit value={timeLeft.hours} label="HRS" />
            <TimeUnit value={timeLeft.minutes} label="MIN" />
            <TimeUnit value={timeLeft.seconds} label="SEG" />
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
            <span className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs md:text-sm font-bold text-white/90 tracking-widest mt-1">{label}</span>
        </div>
    );
}
