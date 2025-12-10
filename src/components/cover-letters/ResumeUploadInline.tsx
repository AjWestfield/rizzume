"use client";

import { useState, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploadInlineProps {
  onComplete: (resumeText: string) => void;
  onCancel?: () => void;
}

export function ResumeUploadInline({ onComplete, onCancel }: ResumeUploadInlineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".pdf") &&
      !selectedFile.name.endsWith(".docx")
    ) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    setFileName(selectedFile.name);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      if (data.resumeText) {
        // Save to localStorage
        localStorage.setItem("rizzume_resume_text", data.resumeText);
        onComplete(data.resumeText);
      } else {
        throw new Error("No resume text returned from analysis");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during upload");
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-amber-900 dark:text-amber-100">
            Upload Your Resume
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            We need your resume to generate personalized cover letters.
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("inline-resume-upload")?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50",
          isUploading && "pointer-events-none opacity-70"
        )}
      >
        <input
          type="file"
          id="inline-resume-upload"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInput}
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Analyzing {fileName}...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              This may take a few seconds
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center mb-3 transition-colors",
                isDragging
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
              )}
            >
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {isDragging ? "Drop your resume here" : "Drop your resume here or click to browse"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports PDF and DOCX files
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
