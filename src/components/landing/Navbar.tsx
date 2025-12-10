"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/20">
            <div className="container flex h-20 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#6366f1]">
                        Rizzume<span className="text-[#a855f7]">*</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 outline-none">
                            <Globe className="w-4 h-4" />
                            EN
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px] p-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[400px] overflow-y-auto">
                            {[
                                { name: "English", flag: "🇺🇸" },
                                { name: "Deutsch", flag: "🇩🇪" },
                                { name: "Español", flag: "🇪🇸" },
                                { name: "Slovenčina", flag: "🇸🇰" },
                                { name: "Português", flag: "🇵🇹" },
                                { name: "English (UK)", flag: "🇬🇧" },
                                { name: "Français", flag: "🇫🇷" },
                                { name: "Čeština", flag: "🇨🇿" },
                                { name: "العربية", flag: "🇸🇦" },
                                { name: "Русский", flag: "🇷🇺" },
                                { name: "Українська", flag: "🇺🇦" },
                                { name: "Svenska", flag: "🇸🇪" },
                                { name: "Italiano", flag: "🇮🇹" },
                            ].map((lang) => (
                                <DropdownMenuItem key={lang.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
                                    <span className="text-lg">{lang.flag}</span>
                                    {lang.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 outline-none">
                            AI Tools
                            <ChevronDown className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-[240px] p-2 bg-white rounded-xl shadow-xl border border-gray-100">
                            {[
                                { name: "Auto Apply", href: "/auto-apply" },
                                { name: "Interview Buddy", href: "#" },
                                { name: "AI Resume Builder", href: "#" },
                                { name: "AI Cover Letter Builder", href: "#" },
                                { name: "AI Mock Interview", href: "#" },
                                { name: "AI Resume Scanner", href: "#" },
                            ].map((tool) => (
                                <Link key={tool.name} href={tool.href} className="block">
                                    <DropdownMenuItem className="px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-50 text-[15px] font-medium text-gray-700">
                                        {tool.name}
                                    </DropdownMenuItem>
                                </Link>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Log in
                    </Link>

                    <Link href="/signup">
                        <Button className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full px-6 font-medium shadow-lg shadow-indigo-200">
                            Start now for free
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    {mounted && (
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <div className="flex flex-col gap-6 mt-8">
                                    <Link href="#" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                                        AI Tools
                                    </Link>
                                    <Link href="/login" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                                        Log in
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full">
                                            Start now for free
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </nav>
    );
}
