"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UploadCloud,
  Settings,
  FileText,
  Trash2,
  Star,
  StarOff,
  Eye,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  Briefcase,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface Resume {
  id: string;
  name: string;
  type: "base" | "job-ready" | "uploaded" | "graded" | "general";
  content: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  score?: number;
  jobTitle?: string;
  companyName?: string;
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    score: number;
  };
}

// Tab definitions
const tabs = [
  { id: "base", label: "Base Resumes", icon: Star },
  { id: "job-ready", label: "Job-Ready Resumes", icon: Target },
  { id: "uploaded", label: "Uploaded Resumes", icon: UploadCloud },
  { id: "graded", label: "Graded Resumes", icon: CheckCircle2 },
  { id: "general", label: "General Resumes", icon: FileText },
] as const;

type TabId = (typeof tabs)[number]["id"];

// localStorage keys
const STORAGE_KEY = "rizzume_resumes";

export default function ResumesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("base");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Load resumes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResumes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load resumes:", e);
      }
    }
  }, []);

  // Save resumes to localStorage
  const saveResumes = useCallback((newResumes: Resume[]) => {
    setResumes(newResumes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newResumes));
  }, []);

  // Filter resumes by tab
  const filteredResumes = resumes.filter((r) => r.type === activeTab);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      let content = "";

      if (file.type === "text/plain") {
        content = await file.text();
      } else {
        // For PDF/DOCX, use the API to extract text
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/resume/extract", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          // Fallback: just store file name if extraction fails
          content = `[Resume from ${file.name}]`;
        } else {
          const data = await response.json();
          content = data.text || `[Resume from ${file.name}]`;
        }
      }

      // Determine resume type based on active tab
      const resumeType = activeTab === "base" ? "base" : activeTab === "job-ready" ? "uploaded" : activeTab;

      const newResume: Resume = {
        id: `resume_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: file.name.replace(/\.(pdf|docx|txt)$/i, ""),
        type: resumeType as Resume["type"],
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: activeTab === "base" && filteredResumes.length === 0,
      };

      saveResumes([...resumes, newResume]);

      // Also save to the existing localStorage key for compatibility
      if (activeTab === "base") {
        localStorage.setItem("rizzume_resume_text", content);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Delete resume
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      saveResumes(resumes.filter((r) => r.id !== id));
    }
  };

  // Set as default
  const handleSetDefault = (id: string) => {
    saveResumes(
      resumes.map((r) => ({
        ...r,
        isDefault: r.id === id ? true : r.type === resumes.find((x) => x.id === id)?.type ? false : r.isDefault,
      }))
    );

    // Also update the main localStorage key
    const resume = resumes.find((r) => r.id === id);
    if (resume && resume.type === "base") {
      localStorage.setItem("rizzume_resume_text", resume.content);
    }
  };

  // View resume
  const handleView = (resume: Resume) => {
    setSelectedResume(resume);
    setShowViewModal(true);
  };

  // Download resume
  const handleDownload = (resume: Resume) => {
    const blob = new Blob([resume.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resume.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get tab-specific empty state content
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "base":
        return {
          title: "Your Base Resume",
          description: "A Base Resume is the foundation for optimizing your future job applications.",
          hint: "Upload your master resume with all your experience, skills, and achievements.",
        };
      case "job-ready":
        return {
          title: "Job-Ready Resumes",
          description: "Optimized resumes tailored for specific job applications.",
          hint: "Create job-specific resumes from your base resume using AI optimization.",
        };
      case "uploaded":
        return {
          title: "Uploaded Resumes",
          description: "Raw resumes you've uploaded before optimization.",
          hint: "Upload resumes here to analyze and optimize them later.",
        };
      case "graded":
        return {
          title: "Graded Resumes",
          description: "Resumes that have been analyzed and scored.",
          hint: "Analyze your resumes to see their strengths and areas for improvement.",
        };
      case "general":
        return {
          title: "General Resumes",
          description: "Generic resumes not tied to specific job applications.",
          hint: "Store general-purpose resumes for quick applications.",
        };
    }
  };

  const emptyState = getEmptyStateContent();

  // Get base resumes for the create modal
  const baseResumes = resumes.filter((r) => r.type === "base");

  // Handle creating a "Rizzed" (optimized) resume
  const handleCreateRizzedResume = async (sourceResume: Resume) => {
    setIsOptimizing(true);
    setShowCreateModal(false);

    try {
      // Call the optimization API
      const response = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: sourceResume.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize resume");
      }

      const data = await response.json();

      // Create a new optimized resume
      const optimizedResume: Resume = {
        id: `resume_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        name: `${sourceResume.name} (Rizzed)`,
        type: "graded",
        content: data.optimizedText || sourceResume.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false,
        score: data.newScore || 85,
      };

      saveResumes([...resumes, optimizedResume]);

      // Switch to graded tab to show the result
      setActiveTab("graded");

      alert("Resume optimized successfully!");
    } catch (error) {
      console.error("Optimization error:", error);
      alert("Failed to optimize resume. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle clearing all resumes (settings action)
  const handleClearAllResumes = () => {
    if (confirm("Are you sure you want to delete ALL resumes? This cannot be undone.")) {
      saveResumes([]);
      setShowSettingsModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Resumes
          </h1>
          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowCreateModal(true)}
              disabled={isOptimizing}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Create Rizzed Resume"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettingsModal(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = resumes.filter((r) => r.type === tab.id).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-indigo-600"
                    : "text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {filteredResumes.length === 0 ? (
          // Empty State with Upload
          <div className="flex flex-col lg:flex-row gap-8">
            <div
              className={`flex-1 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed transition-colors p-12 flex flex-col items-center justify-center min-h-[300px] text-center ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <UploadCloud className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                {emptyState.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                {emptyState.description}
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
                <div className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isUploading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                }`}>
                  {isUploading ? "Uploading..." : "Upload Resume"}
                </div>
              </label>

              <p className="text-xs text-slate-400 mt-4">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>

            {/* Info Card */}
            <div className="lg:w-96 bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                {activeTab === "base" ? "Why a Base Resume Matters" : `About ${tabs.find(t => t.id === activeTab)?.label}`}
              </h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm">
                <p>{emptyState.hint}</p>
                {activeTab === "base" && (
                  <>
                    <p>Your Base Resume is your master document with all your experience, skills, and achievements.</p>
                    <p>With a Base Resume, you can quickly generate rizzed-up resumes for any job application.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Resume List
          <div className="space-y-6">
            {/* Upload Button */}
            <div className="flex justify-end">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Add Resume
                </div>
              </label>
            </div>

            {/* Resume Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        resume.isDefault
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        {resume.isDefault ? (
                          <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-current" />
                        ) : (
                          <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {resume.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(resume)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(resume)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSetDefault(resume.id)}>
                          {resume.isDefault ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" />
                              Remove Default
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(resume.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Score Badge (for graded resumes) */}
                  {resume.score !== undefined && (
                    <div className="mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        resume.score >= 80
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : resume.score >= 60
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        <CheckCircle2 className="h-4 w-4" />
                        Score: {resume.score}%
                      </div>
                    </div>
                  )}

                  {/* Job Info (for job-ready resumes) */}
                  {resume.jobTitle && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{resume.jobTitle}</span>
                      </div>
                      {resume.companyName && (
                        <p className="text-xs text-slate-500 mt-1">{resume.companyName}</p>
                      )}
                    </div>
                  )}

                  {/* Preview */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {resume.content.substring(0, 200)}...
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(resume)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {(activeTab === "uploaded" || activeTab === "base") && (
                      <Button
                        size="sm"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* View Resume Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              {selectedResume?.name}
              {selectedResume?.isDefault && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                  Default
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {selectedResume?.score !== undefined && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className={`h-5 w-5 ${
                    selectedResume.score >= 80
                      ? "text-green-600"
                      : selectedResume.score >= 60
                      ? "text-amber-600"
                      : "text-red-600"
                  }`} />
                  <span className="font-semibold">Resume Score: {selectedResume.score}%</span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                {selectedResume?.content}
              </pre>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => selectedResume && handleDownload(selectedResume)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedResume && handleSetDefault(selectedResume.id)}
              >
                <Star className="h-4 w-4 mr-2" />
                {selectedResume?.isDefault ? "Remove Default" : "Set as Default"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Rizzed Resume Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Create Rizzed Resume
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            <p className="text-slate-600 dark:text-slate-400">
              Transform your resume with AI optimization. Select a base resume to &quot;rizz up&quot; or upload a new one.
            </p>

            {/* Select from existing resumes */}
            {baseResumes.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                  Select a Base Resume
                </h4>
                <div className="space-y-2">
                  {baseResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group"
                      onClick={() => handleCreateRizzedResume(resume)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          resume.isDefault
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}>
                          {resume.isDefault ? (
                            <Star className="h-5 w-5 text-amber-600 dark:text-amber-400 fill-current" />
                          ) : (
                            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {resume.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(resume.createdAt).toLocaleDateString()}
                            {resume.isDefault && " • Default"}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Rizz It Up
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {baseResumes.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
                    Or upload a new resume
                  </span>
                </div>
              </div>
            )}

            {/* Upload new */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                  : "border-slate-300 dark:border-slate-700"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => {
                handleDrop(e);
                setShowCreateModal(false);
              }}
            >
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Drag and drop your resume here, or
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    handleFileInput(e);
                    setShowCreateModal(false);
                  }}
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Browse Files
                </span>
              </label>
              <p className="text-xs text-slate-400 mt-3">
                Supports PDF, DOCX, and TXT files
              </p>
            </div>

            {/* No base resumes hint */}
            {baseResumes.length === 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> Upload a base resume first to get the best results. Your base resume serves as the foundation for all optimizations.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-slate-600" />
              Resume Settings
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Resume Stats */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                Resume Statistics
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Base Resumes</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resumes.filter(r => r.type === "base").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Job-Ready</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resumes.filter(r => r.type === "job-ready").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Uploaded</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resumes.filter(r => r.type === "uploaded").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Graded</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resumes.filter(r => r.type === "graded").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">General</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {resumes.filter(r => r.type === "general").length}
                  </span>
                </div>
                <div className="flex items-center justify-between col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Total Resumes</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {resumes.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900 dark:text-slate-100">
                Actions
              </h4>

              {/* Export All */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  const dataStr = JSON.stringify(resumes, null, 2);
                  const blob = new Blob([dataStr], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "rizzume_resumes_backup.json";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                disabled={resumes.length === 0}
              >
                <Download className="h-4 w-4 mr-3" />
                Export All Resumes (JSON)
              </Button>

              {/* Import */}
              <label className="cursor-pointer w-full">
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const imported = JSON.parse(event.target?.result as string);
                          if (Array.isArray(imported)) {
                            saveResumes([...resumes, ...imported]);
                            alert(`Imported ${imported.length} resumes successfully!`);
                            setShowSettingsModal(false);
                          }
                        } catch {
                          alert("Failed to import resumes. Invalid file format.");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
                <div className="flex items-center w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <UploadCloud className="h-4 w-4 mr-3" />
                  Import Resumes (JSON)
                </div>
              </label>

              {/* Clear All - Danger Zone */}
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Danger Zone
                </p>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={handleClearAllResumes}
                  disabled={resumes.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Clear All Resumes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
