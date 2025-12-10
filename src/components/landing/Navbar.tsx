"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/50 backdrop-blur-xl supports-[backdrop-filter]:bg-white/20">
            <div className="container flex h-20 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#6366f1]">
                        aiApply<span className="text-[#a855f7]">*</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                        <Globe className="w-4 h-4" />
                        EN
                    </button>

                    <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">
                        AI Tools
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <Link href="/sign-in" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                        Log in
                    </Link>

                    <Link href="/sign-up">
                        <Button className="bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full px-6 font-medium shadow-lg shadow-indigo-200">
                            Start now for free
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
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
                                <Link href="/sign-in" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                                    Log in
                                </Link>
                                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-[#6366f1] hover:bg-[#5558e6] text-white rounded-full">
                                        Start now for free
                                    </Button>
                                </Link>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
