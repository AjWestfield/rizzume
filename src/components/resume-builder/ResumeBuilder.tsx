"use client";

import { ResumeData } from "@/lib/resume-builder/types";
import { ResumeForm } from "./ResumeForm";
import { ResumePreview } from "./ResumePreview";

interface ResumeBuilderProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export function ResumeBuilder({ data, onChange }: ResumeBuilderProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row h-[850px] overflow-hidden">
                {/* Left Column: Form Editor */}
                <div className="w-full lg:w-1/2 p-6 overflow-y-auto scrollbar-thin border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Resume Information</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your details below to generate your resume.</p>
                    </div>

                    <ResumeForm data={data} onChange={onChange} />
                </div>

                {/* Right Column: Preview */}
                <div className="w-full lg:w-1/2 bg-slate-100 dark:bg-slate-950/50 p-6 lg:p-12 overflow-y-auto scrollbar-thin flex items-start justify-center">
                    <div className="w-full max-w-[600px] shadow-2xl rounded-sm overflow-hidden">
                        <ResumePreview data={data} />
                    </div>
                </div>
            </div>
        </div>
    );
}
