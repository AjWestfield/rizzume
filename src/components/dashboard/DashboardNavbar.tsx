"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, LogOut, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import Image from "next/image";

export function DashboardNavbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links: { href: string; label: string; highlight?: boolean }[] = [
    { href: "/find-jobs", label: "Find Jobs" },
    { href: "/track-jobs", label: "Track Jobs" },
    { href: "/resumes", label: "Resumes" },
    { href: "/cover-letters", label: "Cover Letters" },
    { href: "/network", label: "Network" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear localStorage profile data
      localStorage.removeItem("rizzume_profile");
      localStorage.removeItem("rizzume_user_email");

      // Sign out from Clerk
      await signOut({ redirectUrl: "/login" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-indigo-600 flex items-center gap-1.5",
                  pathname === link.href ? "text-indigo-600 font-semibold" : "text-slate-600 dark:text-slate-400"
                )}
              >
                {link.label}
                {link.highlight && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                    AI
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UpgradeModal>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 text-sm font-medium">
              Upgrade
            </Button>
          </UpgradeModal>
          <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:ring-2 hover:ring-indigo-500 transition-all overflow-hidden">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
