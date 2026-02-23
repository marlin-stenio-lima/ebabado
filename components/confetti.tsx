"use client";

import { useEffect, useState } from "react";

export function Confetti() {
    const [pieces, setPieces] = useState<{ id: number; style: React.CSSProperties }[]>([]);

    useEffect(() => {
        const colors = ["#FFD700", "#FF4500", "#FF69B4", "#00BFFF", "#32CD32"];
        const newPieces = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            style: {
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                transform: `rotate(${Math.random() * 360}deg)`,
            },
        }));
        setPieces(newPieces);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {pieces.map((piece) => (
                <div
                    key={piece.id}
                    className="absolute top-0 w-3 h-3 rounded-sm animate-fall opacity-0"
                    style={piece.style}
                />
            ))}
            <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
            animation: fall 4s linear infinite;
        }
      `}</style>
        </div>
    );
}
