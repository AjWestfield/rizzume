"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Briefcase,
  Copy,
  Download,
  Check,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { JobMatchResult } from "@/lib/ai/job-match-analyzer";
import { CoverLetterGate } from "@/components/cover-letters/CoverLetterGate";

interface AIFeatureButtonsProps {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  qualifications?: string[];
}

const USER_EMAIL_KEY = "rizzume_user_email";

// Small component to trigger generation when gate becomes ready
function GateReadyTrigger({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

export function AIFeatureButtons({
  jobTitle,
  companyName,
  jobDescription,
  qualifications,
}: AIFeatureButtonsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cover letter generation state
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const generationTriggeredRef = useRef(false);

  // Convex integration for saving cover letters
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem(USER_EMAIL_KEY);
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const user = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  const createCoverLetterMutation = useMutation(api.coverLetters.create);

  const handleAnalyzeMatch = async () => {
    // Get resume text from localStorage (saved after analysis)
    const savedResumeText = localStorage.getItem("rizzume_resume_text");

    if (!savedResumeText) {
      setError("Please upload and analyze your resume first on the Dashboard.");
      setShowResults(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/jobs/analyze-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: savedResumeText,
          jobTitle,
          companyName,
          jobDescription,
          qualifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze match");
      }

      setMatchResult(data.result);
      setShowResults(true);
    } catch (err) {
      console.error("Match analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze match");
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Opens the modal - CoverLetterGate will handle requirements
  const handleGenerateDocuments = () => {
    // Reset state for new generation
    setCoverLetterError(null);
    setGeneratedCoverLetter(null);
    setCopied(false);
    setSavedToDatabase(false);
    setGateReady(false);
    generationTriggeredRef.current = false;
    setShowCoverLetterModal(true);
  };

  // Actual generation logic - called when gate is ready
  const startCoverLetterGeneration = async () => {
    // Prevent duplicate generations
    if (generationTriggeredRef.current || isGeneratingCoverLetter) return;
    generationTriggeredRef.current = true;

    const savedResumeText = localStorage.getItem("rizzume_resume_text");

    if (!savedResumeText) {
      setCoverLetterError("Resume not found. Please try again.");
      return;
    }

    setIsGeneratingCoverLetter(true);
    setCoverLetterError(null);

    try {
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobDescription,
          resume: savedResumeText,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate cover letter");
      }

      setGeneratedCoverLetter(data.coverLetter);

      // Auto-save to Convex if user is logged in
      if (user?._id) {
        try {
          await createCoverLetterMutation({
            userId: user._id,
            jobTitle,
            companyName,
            content: data.coverLetter,
            jobDescription: jobDescription || undefined,
          });
          setSavedToDatabase(true);
          console.log("Cover letter saved to database");
        } catch (saveErr) {
          console.error("Failed to save cover letter to database:", saveErr);
          // Don't throw - the cover letter was still generated successfully
        }
      }
    } catch (err) {
      console.error("Cover letter generation error:", err);
      setCoverLetterError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Trigger generation when gate becomes ready
  useEffect(() => {
    if (gateReady && showCoverLetterModal && !generationTriggeredRef.current) {
      startCoverLetterGeneration();
    }
  }, [gateReady, showCoverLetterModal]);

  // Handle when gate is ready (called by CoverLetterGate wrapper)
  const handleGateReady = () => {
    setGateReady(true);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedCoverLetter) return;

    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    if (!generatedCoverLetter) return;

    const blob = new Blob([generatedCoverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, "_")}_${jobTitle.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMatchColor = (level: JobMatchResult["matchLevel"]) => {
    switch (level) {
      case "excellent":
        return "text-green-600 bg-green-100 dark:bg-green-900/30";
      case "good":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/30";
      case "fair":
        return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case "poor":
        return "text-red-600 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getMatchIcon = (level: JobMatchResult["matchLevel"]) => {
    switch (level) {
      case "excellent":
      case "good":
        return <CheckCircle2 className="h-5 w-5" />;
      case "fair":
        return <AlertCircle className="h-5 w-5" />;
      case "poor":
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-3 px-4 flex flex-col items-start gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700"
          onClick={handleGenerateDocuments}
          disabled={isGeneratingCoverLetter}
        >
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            {isGeneratingCoverLetter ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="font-medium text-sm">
              {isGeneratingCoverLetter ? "Generating..." : "Generate Documents"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            Create optimized resume and cover letter
          </p>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-3 px-4 flex flex-col items-start gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700"
          onClick={handleAnalyzeMatch}
          disabled={isAnalyzing}
        >
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="font-medium text-sm">
              {isAnalyzing ? "Rizz AI Analyzing..." : "Rizz AI Match Check"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
            AI-powered skills & requirements analysis
          </p>
        </Button>
      </div>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto sm:rounded-2xl p-0 gap-0">
          <div className="bg-white dark:bg-slate-900">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 pb-8">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white text-2xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  Rizz AI Match Analysis
                </DialogTitle>
                <p className="text-indigo-100 mt-2 text-sm">
                  AI-powered analysis of your resume against this job posting
                </p>
              </DialogHeader>
            </div>

            <div className="p-6 lg:p-8 -mt-4">
              {error ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <span className="font-semibold text-lg">Unable to Analyze</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
                  {error.includes("upload") && (
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => {
                        setShowResults(false);
                        window.location.href = "/dashboard";
                      }}
                    >
                      Go to Dashboard
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              ) : matchResult ? (
                <div className="space-y-6">
                  {/* Main Score Card */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Score Circle */}
                        <div className="relative flex-shrink-0">
                          <svg className="w-40 h-40 transform -rotate-90">
                            <circle
                              cx="80" cy="80" r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              className="text-slate-100 dark:text-slate-700"
                            />
                            <circle
                              cx="80" cy="80" r="70"
                              stroke="currentColor"
                              strokeWidth="12"
                              fill="transparent"
                              strokeDasharray={439.8}
                              strokeDashoffset={439.8 * (1 - matchResult.overallMatch / 100)}
                              strokeLinecap="round"
                              className={
                                matchResult.matchLevel === 'excellent' ? 'text-green-500' :
                                matchResult.matchLevel === 'good' ? 'text-blue-500' :
                                matchResult.matchLevel === 'fair' ? 'text-amber-500' : 'text-red-500'
                              }
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${
                              matchResult.matchLevel === 'excellent' ? 'text-green-600' :
                              matchResult.matchLevel === 'good' ? 'text-blue-600' :
                              matchResult.matchLevel === 'fair' ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {matchResult.overallMatch}%
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Match Score</span>
                          </div>
                        </div>

                        {/* Match Info */}
                        <div className="flex-1 text-center lg:text-left">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3 ${
                            matchResult.matchLevel === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            matchResult.matchLevel === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            matchResult.matchLevel === 'fair' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {getMatchIcon(matchResult.matchLevel)}
                            {matchResult.matchLevel === 'excellent' ? 'Excellent Match!' :
                              matchResult.matchLevel === 'good' ? 'Good Match' :
                              matchResult.matchLevel === 'fair' ? 'Fair Match' : 'Low Match'}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl">
                            {matchResult.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Matched Skills */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          Matched Skills
                        </h4>
                        <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                          {matchResult.matchedSkills.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.matchedSkills.length > 0 ? matchResult.matchedSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-sm rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        )) : (
                          <p className="text-sm text-slate-500 italic py-4">No direct skill matches found.</p>
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          Skills to Develop
                        </h4>
                        <span className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                          {matchResult.missingSkills.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingSkills.length > 0 ? matchResult.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg font-medium"
                          >
                            {skill}
                          </span>
                        )) : (
                          <p className="text-sm text-slate-500 italic py-4">No critical missing skills found.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience Analysis */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Experience Analysis
                      </h4>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                        matchResult.experienceMatch.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        matchResult.experienceMatch.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {matchResult.experienceMatch.score}% Match
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {matchResult.experienceMatch.feedback}
                    </p>
                    {(matchResult.experienceMatch.yearsRequired || matchResult.experienceMatch.yearsHave) && (
                      <div className="flex items-center gap-8 mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        {matchResult.experienceMatch.yearsRequired && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Required</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{matchResult.experienceMatch.yearsRequired}</span>
                          </div>
                        )}
                        {matchResult.experienceMatch.yearsRequired && matchResult.experienceMatch.yearsHave && (
                          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
                        )}
                        {matchResult.experienceMatch.yearsHave && (
                          <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Your Experience</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{matchResult.experienceMatch.yearsHave}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        Your Strengths
                      </h4>
                      <ul className="space-y-3">
                        {matchResult.strengths.map((strength, i) => (
                          <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Gaps */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Areas to Improve
                      </h4>
                      <ul className="space-y-3">
                        {matchResult.gaps.map((gap, i) => (
                          <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
                            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {matchResult.recommendations.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-5 flex items-center gap-2 text-lg">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        Rizz AI Recommendations
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matchResult.recommendations.slice(0, 3).map((rec, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 flex flex-col h-full"
                          >
                            <span
                              className={`self-start px-2.5 py-1 text-xs uppercase tracking-wider font-bold rounded-md mb-3 ${
                                rec.priority === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                                  : rec.priority === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {rec.priority}
                            </span>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug">
                              {rec.action}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-auto leading-relaxed">
                              {rec.impact}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Analyzing your resume match...</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Letter Modal */}
      <Dialog open={showCoverLetterModal} onOpenChange={setShowCoverLetterModal}>
        <DialogContent className="max-w-5xl sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto sm:rounded-2xl p-0 gap-0">
          <div className="bg-white dark:bg-slate-900">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 pb-8">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-white text-2xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <FileText className="h-6 w-6" />
                  </div>
                  {gateReady ? "Generated Cover Letter" : "Cover Letter Setup"}
                </DialogTitle>
                <p className="text-indigo-100 mt-2 text-sm">
                  {companyName} - {jobTitle}
                </p>
              </DialogHeader>
            </div>

            <div className="p-6 lg:p-8 -mt-4">
              <CoverLetterGate onCancel={() => setShowCoverLetterModal(false)}>
                {/* This content renders when gate requirements are met */}
                <GateReadyTrigger onReady={handleGateReady} />

                {coverLetterError ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-lg">Unable to Generate</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{coverLetterError}</p>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => {
                        generationTriggeredRef.current = false;
                        startCoverLetterGeneration();
                      }}
                    >
                      Try Again
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                ) : generatedCoverLetter ? (
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    {/* Editable Cover Letter Content */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
                      <textarea
                        value={generatedCoverLetter}
                        onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                        className="w-full min-h-[500px] p-4 lg:p-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed bg-transparent border-0 resize-none focus:outline-none focus:ring-0"
                        placeholder="Your cover letter will appear here..."
                      />
                    </div>

                    {/* Edit Hint */}
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">
                        Click anywhere in the text above to edit. Make any personal adjustments before copying or downloading.
                      </p>
                    </div>

                    {/* Saved to Database Indicator */}
                    {savedToDatabase && (
                      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-800 dark:text-green-300">
                          Saved to your Cover Letters library. <a href="/cover-letters" className="underline font-medium hover:text-green-900 dark:hover:text-green-200">View all cover letters →</a>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Generating your cover letter...</p>
                  </div>
                )}
              </CoverLetterGate>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
