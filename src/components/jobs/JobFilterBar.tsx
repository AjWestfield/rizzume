"use client";

import { useState } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "./SearchableSelect";
import { AllFiltersModal } from "./AllFiltersModal";
import {
  type JobFilters,
  DEFAULT_JOB_FILTERS,
  DATE_POSTED_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  OFFICE_REQUIREMENTS_OPTIONS,
  JOB_FUNCTION_OPTIONS,
} from "@/types/job";

interface JobFilterBarProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  jobCount: number;
}

export function JobFilterBar({
  filters,
  onFiltersChange,
  jobCount,
}: JobFilterBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      ...DEFAULT_JOB_FILTERS,
      query: filters.query, // Preserve search query
    });
  };

  // Count active filters (excluding defaults and query)
  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === "query" || key === "location") return count;
    const defaultValue = DEFAULT_JOB_FILTERS[key as keyof JobFilters];
    if (value !== defaultValue) return count + 1;
    return count;
  }, 0);

  return (
    <>
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 p-3 overflow-x-auto">
          {/* Location Input with Clear */}
          <div className="relative min-w-[180px]">
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              className="h-9 pr-8 text-sm"
            />
            {filters.location && (
              <button
                type="button"
                onClick={() => updateFilter("location", "")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {filters.location && (
              <Button
                variant="link"
                size="sm"
                onClick={() => updateFilter("location", "")}
                className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-primary p-0 h-auto"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Date Posted */}
          <Select
            value={filters.datePosted}
            onValueChange={(value) => updateFilter("datePosted", value as JobFilters["datePosted"])}
          >
            <SelectTrigger className="h-9 text-sm min-w-[120px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Date Posted" />
            </SelectTrigger>
            <SelectContent>
              {DATE_POSTED_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Office Requirements */}
          <Select
            value={filters.officeRequirements}
            onValueChange={(value) => updateFilter("officeRequirements", value as JobFilters["officeRequirements"])}
          >
            <SelectTrigger className="h-9 text-sm min-w-[140px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Office Requirements" />
            </SelectTrigger>
            <SelectContent>
              {OFFICE_REQUIREMENTS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Minimum Salary */}
          <div className="relative min-w-[150px]">
            <Input
              type="number"
              placeholder="Minimum Salary (USD)"
              value={filters.minSalary ?? ""}
              onChange={(e) => updateFilter("minSalary", e.target.value ? Number(e.target.value) : null)}
              className="h-9 text-sm"
            />
          </div>

          {/* Experience Level */}
          <Select
            value={filters.experienceLevel}
            onValueChange={(value) => updateFilter("experienceLevel", value as JobFilters["experienceLevel"])}
          >
            <SelectTrigger className="h-9 text-sm min-w-[140px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Job Function (Searchable) */}
          <SearchableSelect
            options={JOB_FUNCTION_OPTIONS}
            value={filters.jobFunction}
            onChange={(value) => updateFilter("jobFunction", value as JobFilters["jobFunction"])}
            placeholder="Filter by job function"
            searchPlaceholder="Search job functions..."
            className="min-w-[180px]"
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* All Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-9 gap-2 whitespace-nowrap"
          >
            <SlidersHorizontal className="h-4 w-4" />
            All Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Job Count */}
        <div className="px-3 pb-2 text-sm text-muted-foreground">
          {jobCount.toLocaleString()} job{jobCount !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* All Filters Modal */}
      <AllFiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        onApplyFilters={onFiltersChange}
      />
    </>
  );
}
