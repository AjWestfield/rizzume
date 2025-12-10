"use client";

import { ResumeData } from "@/lib/resume-builder/types";
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

interface ResumePreviewProps {
    data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    const { personalInfo, professionalTitle, summary, experience, education, skills } = data;

    return (
        <div className="bg-white text-slate-900 p-8 min-h-[800px] font-serif">
            {/* Header */}
            <header className="text-center border-b border-slate-300 pb-6 mb-6">
                <h1 className="text-3xl font-bold tracking-wide mb-1">
                    {personalInfo.fullName || "Your Name"}
                </h1>
                {professionalTitle && (
                    <p className="text-lg text-slate-600 mb-3">{professionalTitle}</p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                    {personalInfo.email && (
                        <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {personalInfo.email}
                        </span>
                    )}
                    {personalInfo.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {personalInfo.location}
                        </span>
                    )}
                    {personalInfo.linkedIn && (
                        <span className="flex items-center gap-1">
                            <Linkedin className="w-3 h-3" />
                            {personalInfo.linkedIn}
                        </span>
                    )}
                    {personalInfo.website && (
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {personalInfo.website}
                        </span>
                    )}
                </div>
            </header>

            {/* Summary */}
            {summary && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                        Professional Summary
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-700">{summary}</p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                        Experience
                    </h2>
                    <div className="space-y-4">
                        {experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-sm">{exp.position}</h3>
                                        <p className="text-sm text-slate-600">
                                            {exp.company}
                                            {exp.location && ` • ${exp.location}`}
                                        </p>
                                    </div>
                                    <span className="text-sm text-slate-500 whitespace-nowrap">
                                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                    </span>
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                        Education
                    </h2>
                    <div className="space-y-3">
                        {education.map((edu) => (
                            <div key={edu.id} className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-sm">{edu.institution}</h3>
                                    <p className="text-sm text-slate-600">
                                        {edu.degree}
                                        {edu.field && ` in ${edu.field}`}
                                        {edu.location && ` • ${edu.location}`}
                                    </p>
                                </div>
                                <span className="text-sm text-slate-500 whitespace-nowrap">
                                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3">
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill.id}
                                className="text-sm bg-slate-100 px-3 py-1 rounded"
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
