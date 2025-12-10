"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, TrendingUp, XCircle, Sparkles, Brain, Search, Zap, Download, ChevronRight } from "lucide-react";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ResumeAnalysis, Suggestion, Skill, Experience } from "@/lib/ai/resume-analyzer";
import type { OptimizationResult } from "@/lib/ai/resume-optimizer";
import { ResumeComparisonTabs } from "@/components/resume/ResumeComparisonTabs";
import type { Job } from "@/types/job";
import { GradientBackground } from "@/components/ui/GradientBackground";

interface ParsedData {
  skills: Skill[];
  experience: Experience[];
  summary?: string;
}

interface JobWithMatch extends Job {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// Full analysis state with resume text for optimization
interface AnalysisState {
    analysis: ResumeAnalysis;
    scoreColor: "red" | "yellow" | "green";
    scoreLabel: string;
    resumeText: string;
}

// Optimization state
interface OptimizationState {
    optimization: OptimizationResult;
    scoreColor: "red" | "yellow" | "green";
    scoreLabel: string;
}

export default function DashboardPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisState | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isOptimized, setIsOptimized] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<OptimizationState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processingStep, setProcessingStep] = useState(0);
    const [preloadedJobs, setPreloadedJobs] = useState<JobWithMatch[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<string | undefined>(undefined);

    // Detect user location on mount using IP geolocation
    useEffect(() => {
        const detectLocation = async () => {
            try {
                // Use a free IP geolocation API
                const response = await fetch("https://ipapi.co/json/");
                if (response.ok) {
                    const data = await response.json();
                    // Format location as "City, State, Country" or "City, Country"
                    const parts = [data.city, data.region, data.country_name].filter(Boolean);
                    const location = parts.length > 0 ? parts.join(", ") : undefined;
                    console.log("[Dashboard] Detected user location:", location);
                    setUserLocation(location);
                }
            } catch (err) {
                console.log("[Dashboard] Could not detect location:", err);
                // Default to US if detection fails
                setUserLocation("United States");
            }
        };
        detectLocation();
    }, []);

    // Agentic processing messages - Gen Z Rizz branding
    const analyzeSteps = [
        { icon: Search, text: "Reading your resume..." },
        { icon: Brain, text: "Running the vibe check..." },
        { icon: Sparkles, text: "Checking your skills..." },
        { icon: Zap, text: "Evaluating your impact..." },
        { icon: FileText, text: "Testing ATS compatibility..." },
        { icon: TrendingUp, text: "Calculating your rizz score..." },
    ];

    const optimizeSteps = [
        { icon: Brain, text: "Finding glow-up opportunities..." },
        { icon: Sparkles, text: "Boosting your descriptions..." },
        { icon: Zap, text: "Adding power words..." },
        { icon: TrendingUp, text: "Injecting keyword rizz..." },
        { icon: FileText, text: "Leveling up your content..." },
        { icon: CheckCircle2, text: "Locking in the rizz..." },
    ];

    // Rotating low score messages for variety
    const lowScoreMessages = [
        "Your resume needs rizz to stand out to recruiters and pass ATS systems.",
        "No rizz detected. Let's fix that so you can secure the bag.",
        "Rizz level: low. Time for a glow-up to catch recruiters' attention.",
        "Your resume is giving... basic. Let's make it unforgettable.",
    ];
    const getLowScoreMessage = () => lowScoreMessages[Math.floor(Math.random() * lowScoreMessages.length)];

    // Rotating low score badges
    const lowScoreBadges = ["Needs Rizz", "No Rizz", "Mid"];
    const getLowScoreBadge = () => lowScoreBadges[Math.floor(Math.random() * lowScoreBadges.length)];

    // Cycle through processing steps
    useEffect(() => {
        if (isAnalyzing || isOptimizing) {
            const interval = setInterval(() => {
                setProcessingStep((prev) => (prev + 1) % 6);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setProcessingStep(0);
        }
    }, [isAnalyzing, isOptimizing]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.pdf') && !selectedFile.name.endsWith('.docx')) {
            setError('Please upload a PDF or DOCX file.');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setIsAnalyzing(true);
        setIsOptimized(false);

        try {
            // Create form data and send to API
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze resume');
            }

            setAnalysisResult({
                analysis: data.analysis,
                scoreColor: data.scoreColor,
                scoreLabel: data.scoreLabel,
                resumeText: data.resumeText,
            });

            // Save resume text to localStorage for job match analysis
            if (data.resumeText) {
                localStorage.setItem("rizzume_resume_text", data.resumeText);
            }
        } catch (err) {
            console.error('Resume analysis error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during analysis');
            setFile(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async (e?: React.MouseEvent) => {
        // Prevent event bubbling that could interfere with AnimatePresence
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!analysisResult || isOptimizing) return;

        setIsOptimizing(true);
        setError(null);

        try {
            const response = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: analysisResult.resumeText,
                    analysis: analysisResult.analysis,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to optimize resume');
            }

            setOptimizationResult({
                optimization: data.optimization,
                scoreColor: data.scoreColor,
                scoreLabel: data.scoreLabel,
            });
            setIsOptimized(true);

            // Pre-fetch jobs in the background after optimization
            if (analysisResult?.analysis.parsedData) {
                fetchRecommendedJobs(analysisResult.analysis.parsedData);
            }
        } catch (err) {
            console.error('Resume optimization error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during optimization');
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleDownloadOptimized = () => {
        if (!optimizationResult?.optimization.optimizedResume) return;

        const blob = new Blob([optimizationResult.optimization.optimizedResume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized-resume.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Pre-fetch recommended jobs after optimization
    const fetchRecommendedJobs = async (parsedData: ParsedData) => {
        setJobsLoading(true);
        try {
            console.log("[Dashboard] Fetching jobs with location:", userLocation);
            const response = await fetch("/api/jobs/recommendations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parsedData, location: userLocation }),
            });
            const data = await response.json();
            if (response.ok) {
                setPreloadedJobs(data.jobs || []);
            }
        } catch (err) {
            console.error("Failed to preload jobs:", err);
        } finally {
            setJobsLoading(false);
        }
    };

    return (
        <div className="h-screen font-sans flex flex-col overflow-hidden relative">
            <GradientBackground />
            <DashboardNavbar />

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col overflow-hidden">
                <div className="mb-3">
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-slate-500" />
                        {isOptimized ? "Your Resume is Ready!" : "Upload Your Resume"}
                    </h1>
                </div>

                <Card className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!file ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center w-full h-full"
                            >
                                <div
                                    className={`
                                        w-full max-w-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300 rounded-2xl p-10
                                        ${isDragging
                                            ? "bg-indigo-50 dark:bg-indigo-950/30 border-2 border-dashed border-indigo-400 scale-[1.02]"
                                            : "bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:from-indigo-50/50 hover:to-indigo-100/50 dark:hover:from-indigo-950/20 dark:hover:to-indigo-900/20"}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('resume-upload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileInput}
                                    />
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
                                        isDragging
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                            : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                    }`}>
                                        <UploadCloud className="h-8 w-8" />
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                        {isDragging ? "Drop your resume here" : "Drop your resume here"}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">or click to browse files</p>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-lg shadow-indigo-500/20">
                                        <UploadCloud className="h-4 w-4 mr-2" />
                                        Select File
                                    </Button>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Supports PDF, DOCX up to 10MB</p>
                                </div>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300 max-w-lg"
                                    >
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                        <span className="text-sm">{error}</span>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : isAnalyzing || isOptimizing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="flex flex-col items-center justify-center text-center"
                            >
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                                    <motion.div
                                        className="relative h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-700"
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        {(() => {
                                            const steps = isOptimizing ? optimizeSteps : analyzeSteps;
                                            const CurrentIcon = steps[processingStep].icon;
                                            return <CurrentIcon className="h-8 w-8 text-indigo-600" />;
                                        })()}
                                    </motion.div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                    {isOptimizing ? "Rizzing your resume..." : "Checking for Rizz..."}
                                </h3>
                                <p className="text-slate-500 max-w-sm mb-6">
                                    {isOptimizing ? "Our AI is adding that main character energy." : "Our AI is checking your experience, skills, and overall vibe."}
                                </p>

                                {/* Agentic step indicator with shimmer */}
                                <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-full px-6 py-3">
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={processingStep}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                            <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] bg-clip-text text-transparent">
                                                {(isOptimizing ? optimizeSteps : analyzeSteps)[processingStep].text}
                                            </span>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Progress dots */}
                                <div className="flex gap-1.5 mt-4">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <motion.div
                                            key={i}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                i <= processingStep
                                                    ? 'w-4 bg-indigo-600'
                                                    : 'w-1.5 bg-slate-300 dark:bg-slate-600'
                                            }`}
                                            animate={i === processingStep ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 0.5 }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full h-full flex flex-col"
                            >
                                {/* Top Section: Score + CTA */}
                                <div className="flex items-center gap-6 mb-4 shrink-0">
                                    {/* Score Circle */}
                                    <div className="relative">
                                        <div className="relative h-28 w-28 flex items-center justify-center">
                                            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-700" />
                                                <motion.circle
                                                    key={isOptimized ? 'optimized' : 'original'}
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: (isOptimized && optimizationResult ? optimizationResult.optimization.newScore : analysisResult?.analysis.score || 0) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                                                    strokeDasharray="1"
                                                    strokeLinecap="round"
                                                    className={
                                                        isOptimized ? 'text-green-500' :
                                                        analysisResult?.scoreColor === 'red' ? 'text-red-500' :
                                                        analysisResult?.scoreColor === 'yellow' ? 'text-amber-500' :
                                                        'text-green-500'
                                                    }
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className={`text-3xl font-bold ${
                                                    isOptimized ? 'text-green-600' :
                                                    analysisResult?.scoreColor === 'red' ? 'text-red-600' :
                                                    analysisResult?.scoreColor === 'yellow' ? 'text-amber-600' :
                                                    'text-green-600'
                                                }`}>{isOptimized && optimizationResult ? optimizationResult.optimization.newScore : analysisResult?.analysis.score}</span>
                                                <span className="text-xs text-slate-500 font-medium">/ 100</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Info + CTA */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className={`text-2xl font-bold ${
                                                isOptimized ? 'text-green-600' :
                                                analysisResult?.scoreColor === 'red' ? 'text-red-600' :
                                                analysisResult?.scoreColor === 'yellow' ? 'text-amber-600' :
                                                'text-green-600'
                                            }`}>
                                                {isOptimized ? "Resume Rizzed!" : analysisResult?.scoreLabel}
                                            </h2>
                                            {!isOptimized && analysisResult?.scoreColor === 'red' && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">{getLowScoreBadge()}</span>
                                            )}
                                            {!isOptimized && analysisResult?.scoreColor === 'yellow' && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Some Rizz</span>
                                            )}
                                            {!isOptimized && analysisResult?.scoreColor === 'green' && (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Max Rizz</span>
                                            )}
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                                            {isOptimized
                                                ? "Your resume just leveled up and is ready to secure the bag."
                                                : analysisResult?.scoreColor === 'red'
                                                    ? getLowScoreMessage()
                                                    : analysisResult?.scoreColor === 'yellow'
                                                        ? "Your resume has potential but needs more rizz to really pop off."
                                                        : "Your resume is fully rizzed and ready to get that bag!"}
                                        </p>
                                        {!isOptimized ? (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={(e) => handleOptimize(e)}
                                                    disabled={isOptimizing}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 px-6"
                                                >
                                                    <Sparkles className="h-5 w-5 mr-2" />
                                                    Rizz My Resume
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => {
                                                        setFile(null);
                                                        setIsOptimized(false);
                                                        setAnalysisResult(null);
                                                        setOptimizationResult(null);
                                                        setError(null);
                                                    }}
                                                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                                                >
                                                    <UploadCloud className="h-4 w-4 mr-2" />
                                                    Upload Different
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    onClick={handleDownloadOptimized}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 px-6"
                                                >
                                                    <FileText className="h-5 w-5 mr-2" />
                                                    Download Rizzed Resume
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    onClick={() => {
                                                        setFile(null);
                                                        setIsOptimized(false);
                                                        setAnalysisResult(null);
                                                        setOptimizationResult(null);
                                                        setError(null);
                                                    }}
                                                    className="border-slate-300 text-slate-600 hover:bg-slate-50"
                                                >
                                                    <UploadCloud className="h-4 w-4 mr-2" />
                                                    Upload Different
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Score Breakdown Cards */}
                                {!isOptimized && analysisResult?.analysis.scoreBreakdown && (
                                    <div className="grid grid-cols-5 gap-3 mb-4 shrink-0">
                                        {Object.entries(analysisResult.analysis.scoreBreakdown).map(([key, value], index) => {
                                            const labels: Record<string, string> = {
                                                completeness: 'Completeness',
                                                skillsRelevance: 'Skills',
                                                experienceQuality: 'Experience',
                                                formatting: 'Format',
                                                keywordOptimization: 'Keyword Rizz'
                                            };
                                            const icons: Record<string, React.ReactNode> = {
                                                completeness: <FileText className="h-4 w-4" />,
                                                skillsRelevance: <Zap className="h-4 w-4" />,
                                                experienceQuality: <TrendingUp className="h-4 w-4" />,
                                                formatting: <CheckCircle2 className="h-4 w-4" />,
                                                keywordOptimization: <Search className="h-4 w-4" />
                                            };
                                            const color = value < 60 ? 'red' : value < 80 ? 'amber' : 'green';
                                            return (
                                                <motion.div
                                                    key={key}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    className={`bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800 rounded-xl p-3 text-center`}
                                                    style={{
                                                        backgroundColor: color === 'red' ? 'rgb(254 242 242)' : color === 'amber' ? 'rgb(255 251 235)' : 'rgb(240 253 244)',
                                                        borderColor: color === 'red' ? 'rgb(254 202 202)' : color === 'amber' ? 'rgb(253 230 138)' : 'rgb(187 247 208)'
                                                    }}
                                                >
                                                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-2 ${
                                                        color === 'red' ? 'bg-red-100 text-red-600' :
                                                        color === 'amber' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                        {icons[key]}
                                                    </div>
                                                    <div className={`text-2xl font-bold ${
                                                        color === 'red' ? 'text-red-600' :
                                                        color === 'amber' ? 'text-amber-600' :
                                                        'text-green-600'
                                                    }`}>{value}</div>
                                                    <div className="text-xs text-slate-600 font-medium">{labels[key] || key}</div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Feedback Section */}
                                <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
                                    {/* Strengths */}
                                    {!isOptimized && (
                                        <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200 dark:border-green-800 flex flex-col h-full overflow-hidden">
                                            <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2 shrink-0">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                What&apos;s Hitting
                                                <span className="ml-auto text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                                                    {analysisResult?.analysis.strengths?.length || 0}
                                                </span>
                                            </h3>
                                            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
                                                {analysisResult?.analysis.strengths?.map((item, i) => (
                                                    <motion.div
                                                        key={`strength-${i}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + (i * 0.05) }}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                                        <p className="text-sm text-green-700 dark:text-green-300">{item}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Issues */}
                                    {!isOptimized && (
                                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800 flex flex-col h-full overflow-hidden">
                                            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2 shrink-0">
                                                <AlertCircle className="h-5 w-5 text-red-600" />
                                                Rizz Opportunities
                                                <span className="ml-auto text-xs bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">
                                                    {analysisResult?.analysis.weaknesses?.length || 0}
                                                </span>
                                            </h3>
                                            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-2 scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-transparent">
                                                {analysisResult?.analysis.weaknesses?.map((item, i) => (
                                                    <motion.div
                                                        key={`weakness-${i}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + (i * 0.05) }}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                                        <p className="text-sm text-red-700 dark:text-red-300">{item}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Recommendations */}
                                    {!isOptimized && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800 flex flex-col h-full overflow-hidden">
                                            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2 shrink-0">
                                                <Sparkles className="h-5 w-5 text-indigo-600" />
                                                Rizz Tips
                                                <span className="ml-auto text-xs bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                                                    {analysisResult?.analysis.suggestions?.length || 0}
                                                </span>
                                            </h3>
                                            <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent">
                                                {analysisResult?.analysis.suggestions?.map((suggestion: Suggestion, i: number) => (
                                                    <motion.div
                                                        key={`suggestion-${i}`}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + (i * 0.05) }}
                                                        className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                                suggestion.priority === 'high'
                                                                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                                                    : suggestion.priority === 'medium'
                                                                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                                            }`}>
                                                                {suggestion.priority}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded">
                                                                {suggestion.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-700 dark:text-slate-300">{suggestion.suggestion}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Optimized State - Comparison View with Jobs Tab */}
                                    {isOptimized && optimizationResult && analysisResult && (
                                        <div className="col-span-3 h-full overflow-y-auto pr-2 scrollbar-thin">
                                            <ResumeComparisonTabs
                                                originalText={analysisResult.resumeText}
                                                optimizedText={optimizationResult.optimization.optimizedResume}
                                                changes={optimizationResult.optimization.changes}
                                                originalScore={analysisResult.analysis.score}
                                                newScore={optimizationResult.optimization.newScore}
                                                weaknesses={analysisResult.analysis.weaknesses}
                                                parsedData={analysisResult.analysis.parsedData}
                                                preloadedJobs={preloadedJobs}
                                                preloadedJobsLoading={jobsLoading}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Browse Jobs Link */}
                                {!isOptimized && (
                                    <div className="flex justify-end mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
                                        <Link href="/find-jobs" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                            Browse Jobs <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </main>
        </div>
    );
}
