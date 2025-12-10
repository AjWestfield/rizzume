"use client";

import { useState } from "react";
import {
  FileText,
  Trash2,
  Eye,
  Download,
  Copy,
  MoreVertical,
  Plus,
  Sparkles,
  Building2,
  Briefcase,
  Calendar,
  Loader2,
  Check,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCoverLetters, type CoverLetter } from "@/hooks/useCoverLetters";
import { CoverLetterGate } from "@/components/cover-letters/CoverLetterGate";

export default function CoverLettersPage() {
  const {
    coverLetters,
    isLoading,
    userId,
    createCoverLetter,
    updateCoverLetter,
    deleteCoverLetter,
  } = useCoverLetters();

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Create form state
  const [createForm, setCreateForm] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // View/Edit a cover letter
  const handleView = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    setEditedContent(letter.content);
    setIsEditing(false);
    setShowViewModal(true);
  };

  // Copy to clipboard
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Download as text file
  const handleDownload = (letter: CoverLetter) => {
    const blob = new Blob([letter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${letter.companyName}_${letter.jobTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete a cover letter
  const handleDelete = async (letter: CoverLetter) => {
    if (confirm(`Are you sure you want to delete this cover letter for ${letter.companyName}?`)) {
      try {
        await deleteCoverLetter(letter._id);
      } catch (err) {
        console.error("Failed to delete:", err);
        alert("Failed to delete cover letter. Please try again.");
      }
    }
  };

  // Save edited content
  const handleSaveEdit = async () => {
    if (!selectedLetter) return;

    setIsSaving(true);
    try {
      await updateCoverLetter(selectedLetter._id, { content: editedContent });
      setSelectedLetter({ ...selectedLetter, content: editedContent });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate new cover letter
  const handleGenerate = async () => {
    if (!createForm.jobTitle || !createForm.companyName) {
      alert("Please enter both job title and company name.");
      return;
    }

    // Note: CoverLetterGate ensures profile and resume are complete before this is called
    setIsGenerating(true);
    try {
      // Get resume from localStorage
      const resumeText = localStorage.getItem("rizzume_resume_text") || "";

      // Call the AI endpoint
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: createForm.jobTitle,
          companyName: createForm.companyName,
          jobDescription: createForm.jobDescription,
          resume: resumeText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover letter");
      }

      const data = await response.json();

      // Save to Convex
      await createCoverLetter({
        jobTitle: createForm.jobTitle,
        companyName: createForm.companyName,
        content: data.coverLetter,
        jobDescription: createForm.jobDescription || undefined,
      });

      // Reset form and close modal
      setCreateForm({ jobTitle: "", companyName: "", jobDescription: "" });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Generation error:", err);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Cover Letters
          </h1>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Letter
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : !coverLetters || coverLetters.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
              No Cover Letters Yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
              Create your first cover letter using AI. Cover letters generated from job listings will also appear here.
            </p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowCreateModal(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Button>
          </div>
        ) : (
          // Cover Letter Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coverLetters.map((letter) => (
              <div
                key={letter._id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {letter.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {letter.jobTitle}
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
                      <DropdownMenuItem onClick={() => handleView(letter)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopy(letter.content)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(letter)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(letter)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                  <Calendar className="h-3 w-3" />
                  {formatDate(letter.createdAt)}
                </div>

                {/* Preview */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4">
                  {letter.content.substring(0, 200)}...
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(letter)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(letter.content)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* View/Edit Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              <div>
                <span>{selectedLetter?.companyName}</span>
                <span className="text-slate-400 font-normal"> - </span>
                <span className="text-slate-500 font-normal">{selectedLetter?.jobTitle}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Metadata */}
            <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {selectedLetter?.companyName}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {selectedLetter?.jobTitle}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {selectedLetter && formatDate(selectedLetter.createdAt)}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
              {isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] p-6 text-sm leading-relaxed border-0 resize-none focus:ring-0"
                  placeholder="Cover letter content..."
                />
              ) : (
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 p-6 leading-relaxed">
                  {selectedLetter?.content}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-2 mt-4">
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedContent(selectedLetter?.content || "");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => selectedLetter && handleCopy(selectedLetter.content)}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedLetter && handleDownload(selectedLetter)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Generate Cover Letter
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <CoverLetterGate onCancel={() => setShowCreateModal(false)}>
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Enter job details and our AI will generate a personalized cover letter based on your resume.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={createForm.jobTitle}
                      onChange={(e) => setCreateForm({ ...createForm, jobTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Google"
                      value={createForm.companyName}
                      onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobDescription">Job Description (optional)</Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description for a more tailored cover letter..."
                      value={createForm.jobDescription}
                      onChange={(e) => setCreateForm({ ...createForm, jobDescription: e.target.value })}
                      className="min-h-[150px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleGenerate}
                    disabled={isGenerating || !createForm.jobTitle || !createForm.companyName}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CoverLetterGate>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
