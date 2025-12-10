"use client";

import { ResumeData, ExperienceItem, EducationItem, SkillItem } from "@/lib/resume-builder/types";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ResumeFormProps {
    data: ResumeData;
    onChange: (data: ResumeData) => void;
}

export function ResumeForm({ data, onChange }: ResumeFormProps) {

    const updatePersonalInfo = (field: keyof ResumeData["personalInfo"], value: string) => {
        onChange({
            ...data,
            personalInfo: {
                ...data.personalInfo,
                [field]: value
            }
        });
    };

    const updateRootField = (field: "professionalTitle" | "summary", value: string) => {
        onChange({
            ...data,
            [field]: value
        });
    };

    return (
        <div className="space-y-8">
            {/* Personal Info */}
            <section className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                        id="fullName"
                        value={data.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                        placeholder="Ex: Steve Jobs"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={data.personalInfo.email}
                            onChange={(e) => updatePersonalInfo("email", e.target.value)}
                            placeholder="steve@apple.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={data.personalInfo.location}
                            onChange={(e) => updatePersonalInfo("location", e.target.value)}
                            placeholder="Cupertino, CA"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={data.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                            placeholder="+1 555-0100"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedIn">LinkedIn</Label>
                        <Input
                            id="linkedIn"
                            value={data.personalInfo.linkedIn}
                            onChange={(e) => updatePersonalInfo("linkedIn", e.target.value)}
                            placeholder="linkedin.com/in/stevejobs"
                        />
                    </div>
                </div>
            </section>

            {/* Professional Title */}
            <section className="space-y-2">
                <Label htmlFor="professionalTitle">Professional Title</Label>
                <Input
                    id="professionalTitle"
                    value={data.professionalTitle}
                    onChange={(e) => updateRootField("professionalTitle", e.target.value)}
                    placeholder="Ex: Senior Software Engineer"
                />
            </section>

            {/* Summary */}
            <section className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <div className="relative">
                    <Textarea
                        id="summary"
                        value={data.summary}
                        onChange={(e) => updateRootField("summary", e.target.value)}
                        placeholder="Briefly describe your professional background..."
                        className="min-h-[120px] pb-12 resize-none"
                    />
                    {/* AI Assistant Button Overlay */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            <span>Make it less wordy</span>
                            <Sparkles className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </section>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Experience */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Experience</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newItem: ExperienceItem = {
                                id: Date.now().toString(),
                                company: "New Company",
                                position: "Position",
                                location: "",
                                startDate: "2023",
                                endDate: "Present",
                                current: false,
                                description: ""
                            };
                            onChange({ ...data, experience: [...data.experience, newItem] });
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>

                <div className="space-y-6">
                    {data.experience.map((exp, index) => (
                        <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 group relative">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        const newExp = data.experience.filter(e => e.id !== exp.id);
                                        onChange({ ...data, experience: newExp });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-slate-500 mb-1 block">Company</Label>
                                    <Input
                                        value={exp.company}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].company = e.target.value;
                                            onChange({ ...data, experience: newExp });
                                        }}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500 mb-1 block">Position</Label>
                                    <Input
                                        value={exp.position}
                                        onChange={(e) => {
                                            const newExp = [...data.experience];
                                            newExp[index].position = e.target.value;
                                            onChange({ ...data, experience: newExp });
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500 mb-1 block">Description</Label>
                                <Textarea
                                    value={exp.description}
                                    onChange={(e) => {
                                        const newExp = [...data.experience];
                                        newExp[index].description = e.target.value;
                                        onChange({ ...data, experience: newExp });
                                    }}
                                    className="h-20 text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Education</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const newItem: EducationItem = {
                                id: Date.now().toString(),
                                institution: "University",
                                degree: "Degree",
                                field: "Field of Study",
                                location: "",
                                startDate: "2018",
                                endDate: "2022",
                                current: false
                            };
                            onChange({ ...data, education: [...data.education, newItem] });
                        }}
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                </div>
                <div className="space-y-4">
                    {data.education.map((edu, index) => (
                        <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 relative group">
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                        const newEdu = data.education.filter(e => e.id !== edu.id);
                                        onChange({ ...data, education: newEdu });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div>
                                <Label className="text-xs text-slate-500 mb-1 block">Institution</Label>
                                <Input
                                    value={edu.institution}
                                    onChange={(e) => {
                                        const newEdu = [...data.education];
                                        newEdu[index].institution = e.target.value;
                                        onChange({ ...data, education: newEdu });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="space-y-4 pb-12">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Skills</h3>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a skill..."
                            className="w-40 h-8 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = e.currentTarget.value.trim();
                                    if (val) {
                                        onChange({
                                            ...data,
                                            skills: [...data.skills, { id: Date.now().toString(), name: val, level: "Expert" }]
                                        });
                                        e.currentTarget.value = "";
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                        <div key={skill.id} className="group flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                            {skill.name}
                            <button
                                onClick={() => {
                                    const newSkills = data.skills.filter(s => s.id !== skill.id);
                                    onChange({ ...data, skills: newSkills });
                                }}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
