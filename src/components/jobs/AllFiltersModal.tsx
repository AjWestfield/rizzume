"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "./SearchableSelect";
import {
  type JobFilters,
  DEFAULT_JOB_FILTERS,
  DATE_POSTED_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  OFFICE_REQUIREMENTS_OPTIONS,
  JOB_FUNCTION_OPTIONS,
  INDUSTRY_OPTIONS,
  LOCATION_DISTANCE_OPTIONS,
} from "@/types/job";

interface AllFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApplyFilters: (filters: JobFilters) => void;
}

export function AllFiltersModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: AllFiltersModalProps) {
  // Local state for filter changes
  const [localFilters, setLocalFilters] = useState<JobFilters>(filters);

  // Sync local filters when modal opens or external filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleReset = () => {
    setLocalFilters({
      ...DEFAULT_JOB_FILTERS,
      query: localFilters.query, // Preserve search query
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const updateFilter = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Filter Jobs</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Job title, keywords..."
              value={localFilters.query}
              onChange={(e) => updateFilter("query", e.target.value)}
            />
          </div>

          {/* Location Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="City, State, or Remote"
                  value={localFilters.location}
                  onChange={(e) => updateFilter("location", e.target.value)}
                  className="flex-1"
                />
                {localFilters.location && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => updateFilter("location", "")}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location Distance</Label>
              <Select
                value={localFilters.locationDistance}
                onValueChange={(value) => updateFilter("locationDistance", value as JobFilters["locationDistance"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_DISTANCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Posted & Office Requirements Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Posted</Label>
              <Select
                value={localFilters.datePosted}
                onValueChange={(value) => updateFilter("datePosted", value as JobFilters["datePosted"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {DATE_POSTED_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Office Requirements</Label>
              <Select
                value={localFilters.officeRequirements}
                onValueChange={(value) => updateFilter("officeRequirements", value as JobFilters["officeRequirements"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {OFFICE_REQUIREMENTS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Section */}
          <div className="space-y-3">
            <Label>Minimum Salary (USD)</Label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={localFilters.minSalary ?? ""}
              onChange={(e) => updateFilter("minSalary", e.target.value ? Number(e.target.value) : null)}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hideSalaryless"
                checked={localFilters.hideSalaryless}
                onCheckedChange={(checked) => updateFilter("hideSalaryless", checked === true)}
              />
              <label
                htmlFor="hideSalaryless"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Hide jobs with no salary information
              </label>
            </div>
          </div>

          {/* Rizzume Apply Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Rizzume Apply</Label>
              <p className="text-sm text-muted-foreground">
                Show only jobs with easy apply option
              </p>
            </div>
            <Switch
              checked={localFilters.rizzumeApply}
              onCheckedChange={(checked) => updateFilter("rizzumeApply", checked)}
            />
          </div>

          {/* Experience Level & Job Function Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select
                value={localFilters.experienceLevel}
                onValueChange={(value) => updateFilter("experienceLevel", value as JobFilters["experienceLevel"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Job Function</Label>
              <SearchableSelect
                options={JOB_FUNCTION_OPTIONS}
                value={localFilters.jobFunction}
                onChange={(value) => updateFilter("jobFunction", value as JobFilters["jobFunction"])}
                placeholder="Filter by job function"
                searchPlaceholder="Search functions..."
              />
            </div>
          </div>

          {/* Industry & Employment Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Industry</Label>
              <SearchableSelect
                options={INDUSTRY_OPTIONS}
                value={localFilters.industry}
                onChange={(value) => updateFilter("industry", value as JobFilters["industry"])}
                placeholder="Filter by company industry"
                searchPlaceholder="Search industries..."
              />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={localFilters.employmentType}
                onValueChange={(value) => updateFilter("employmentType", value as JobFilters["employmentType"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
            Filter Jobs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
