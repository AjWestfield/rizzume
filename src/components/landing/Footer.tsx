
import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram, Cloud } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="bg-[#fcfbf9] pt-24 pb-12">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                Rizzume
                            </span>
                            <span className="text-purple-500 text-xl">✨</span>
                        </div>

                        <div className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full w-fit">
                            <span className="text-xs font-semibold">🇺🇸 English</span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <Link href="#" className="block hover:text-gray-900">Privacy Policy</Link>
                            <Link href="#" className="block hover:text-gray-900">Terms of Service</Link>
                            <Link href="#" className="block hover:text-gray-900">Student discount</Link>
                        </div>

                        <div className="pt-4">
                            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                                <div className="bg-orange-500/10 p-1 rounded">
                                    {/* Placeholder for Google Cloud Partner Logo */}
                                    <Cloud className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-semibold leading-none">Google Cloud</span>
                                    <span className="text-xs text-gray-900 font-bold leading-none">Partner</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tools Column */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">TOOLS</h4>
                        <div className="space-y-3 text-sm text-gray-600">
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Auto Apply To Jobs</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">AI Cover Letter</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">AI Resume Builder</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Mock Job Interview</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Interview Buddy</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Resume Translator</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Job Board</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">LinkedIn to Resume</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Resume Examples</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Cover Letter Examples</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">AI Resume Scanner</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">All Free tools</Link>
                        </div>
                    </div>

                    {/* Businesses Column */}
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">BUSINESSES</h4>
                        <div className="space-y-3 text-sm text-gray-600">
                            <Link href="#" className="block hover:text-gray-900 hover:underline">White Label</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Affiliate</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Post a Job</Link>
                        </div>
                    </div>

                    {/* Blog Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">BLOG</h4>
                        <div className="space-y-3 text-sm text-gray-600">
                            <Link href="#" className="block hover:text-gray-900 hover:underline">How to write a resignation letter</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Structuring your resume objective for a career change</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">Should my resume be in reverse chronological order?</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">How to make a resume for your first job</Link>
                            <Link href="#" className="block hover:text-gray-900 hover:underline">All Posts</Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Rizzume Limited. All rights reserved</p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-gray-400 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                            </svg>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-900">
                            <Instagram className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                            </svg>
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path clipRule="evenodd" d="M12.48 10.92v3.28h.78c2.64 0 4.98-.93 5.98-3.28.14-.33 1.2-2.71 1.2-2.71.36-.78.72-1.68 1.44-1.68h2.09c.8 0 1.44.62 1.44 1.39 0 2.22-4.13 6.6-4.99 7.49-.86.89-1.8 1.79-2.7 2.68 0 0 .54 1.62.77 2.05.23.43.5 1.13.92 1.93.42.8.96 1.7 1.44 1.7h2.39c.81 0 1.44-.63 1.44-1.39 0-.74-.53-1.42-.9-2.12-.37-.7-1.1-2.09-1.38-2.58-.28-.49-1.12-2.11-1.12-2.11-.2-.36-.46-.72-.64-1.07-.18-.35-.38-.71-.53-1.07-.15-.36-.08-.74.1-1.05.18-.31.62-.83 1.05-1.52.43-.69.83-1.35 1.23-2.02.4-.67.78-1.34 1.13-2.02.35-.68.61-1.39.61-2.09 0-.77-.63-1.39-1.44-1.39h-2.12c-.75 0-1.27.76-1.64 1.21-.37.45-.73.9-1.08 1.34-.35.44-.7 1.03-1.04 1.63-.34.6-.68 1.21-1.02 1.81-.34.6-.68 1.21-1.02 1.81-.34.6-.69 1.2-1.03 1.81-.34.61-.69 1.16-1.03 1.46-.34.3-.83.63-1.36.63h-1.1v-8.08c0-.77-.63-1.39-1.44-1.39h-2.06c-.81 0-1.44.62-1.44 1.39v10.87c0 .77.63 1.39 1.44 1.39h2.06c.81 0 1.44-.62 1.44-1.39v-3.79z" fillRule="evenodd" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

