"use client";

interface GradientBackgroundProps {
    className?: string;
}

export function GradientBackground({ className = "" }: GradientBackgroundProps) {
    return (
        <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6F0] via-[#FCE8EF] to-[#FDF2F8]" />
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-300/40 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-300/50 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-pink-200/40 rounded-full blur-[80px]" />
        </div>
    );
}
