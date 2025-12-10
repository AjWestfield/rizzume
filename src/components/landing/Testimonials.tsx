"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "UX Designer at Google",
        image: "/testimonials/sarah.png",
        content: "Rizzume transformed my job search. The AI-tailored resume highlighted my design skills perfectly, and I landed interviews at top tech companies within weeks.",
        stars: 5,
    },
    {
        name: "Michael Ross",
        role: "Project Manager at Spotify",
        image: "/testimonials/michael.png",
        content: "I was struggling to get past ATS filters until I started using Rizzume. The keyword optimization feature is a game-changer. Highly recommended!",
        stars: 5,
    },
    {
        name: "Emily Parker",
        role: "Marketing Director at Airbnb",
        image: "/testimonials/emily.png",
        content: "The cover letter generator saved me hours of work. It captured my voice perfectly and made each application feel personal and unique.",
        stars: 5,
    },
    {
        name: "Alex Thompson",
        role: "Software Engineer at Netflix",
        image: "/testimonials/alex.png",
        content: "Auto-apply is incredible. It applied to hundreds of relevant jobs while I slept. I woke up to interview requests in my inbox. Best investment for my career.",
        stars: 5,
    },
];

export function Testimonials() {
    return (
        <section id="testimonials" className="container py-24 md:py-32 bg-gray-50/50">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                    1,005,991+ experienced job seekers<br />
                    are using Rizzume
                </h2>
            </div>

            <div className="mx-auto max-w-7xl px-4">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {testimonials.map((testimonial, i) => (
                            <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="h-full">
                                    <Card className="h-full border-0 shadow-sm bg-white hover:shadow-md transition-shadow p-6 rounded-2xl">
                                        <CardContent className="p-0 flex flex-col h-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    <Image src={testimonial.image} alt={testimonial.name} width={40} height={40} className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{testimonial.name}</p>
                                                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5 mb-3">
                                                {[...Array(testimonial.stars)].map((_, i) => (
                                                    <div key={i} className="bg-[#00B67A] p-0.5 rounded-[1px]">
                                                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {testimonial.content}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="flex justify-center gap-4 mt-8">
                        <CarouselPrevious variant="outline" className="static translate-y-0" />
                        <CarouselNext variant="outline" className="static translate-y-0" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
