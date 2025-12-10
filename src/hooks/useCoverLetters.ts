"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface CoverLetter {
  _id: Id<"coverLetters">;
  userId: Id<"users">;
  jobTitle: string;
  companyName: string;
  content: string;
  jobDescription?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface UseCoverLettersResult {
  coverLetters: CoverLetter[] | undefined;
  isLoading: boolean;
  userId: Id<"users"> | null;
  createCoverLetter: (data: {
    jobTitle: string;
    companyName: string;
    content: string;
    jobDescription?: string;
  }) => Promise<Id<"coverLetters">>;
  updateCoverLetter: (
    letterId: Id<"coverLetters">,
    updates: {
      jobTitle?: string;
      companyName?: string;
      content?: string;
      jobDescription?: string;
    }
  ) => Promise<Id<"coverLetters">>;
  deleteCoverLetter: (letterId: Id<"coverLetters">) => Promise<Id<"coverLetters">>;
}

const USER_EMAIL_KEY = "rizzume_user_email";

export function useCoverLetters(): UseCoverLettersResult {
  const [userEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_EMAIL_KEY);
    }
    return null;
  });

  // Get user from Convex by email
  const user = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  const userId = user?._id ?? null;

  // Query all cover letters for the user
  const coverLetters = useQuery(
    api.coverLetters.getByUserId,
    userId ? { userId } : "skip"
  );

  // Mutations
  const createMutation = useMutation(api.coverLetters.create);
  const updateMutation = useMutation(api.coverLetters.update);
  const deleteMutation = useMutation(api.coverLetters.softDelete);

  // Create a new cover letter
  const createCoverLetter = useCallback(
    async (data: {
      jobTitle: string;
      companyName: string;
      content: string;
      jobDescription?: string;
    }) => {
      if (!userId) {
        throw new Error("User not initialized. Please set up your profile first.");
      }

      const letterId = await createMutation({
        userId,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
        content: data.content,
        jobDescription: data.jobDescription,
      });

      return letterId;
    },
    [userId, createMutation]
  );

  // Update an existing cover letter
  const updateCoverLetter = useCallback(
    async (
      letterId: Id<"coverLetters">,
      updates: {
        jobTitle?: string;
        companyName?: string;
        content?: string;
        jobDescription?: string;
      }
    ) => {
      const result = await updateMutation({
        letterId,
        ...updates,
      });
      return result;
    },
    [updateMutation]
  );

  // Delete a cover letter (soft delete)
  const deleteCoverLetter = useCallback(
    async (letterId: Id<"coverLetters">) => {
      const result = await deleteMutation({ letterId });
      return result;
    },
    [deleteMutation]
  );

  // isLoading is true if:
  // 1. We have an email but user is still loading
  // 2. We have a userId but cover letters are still loading
  const isLoading = (userEmail !== null && user === undefined) ||
    (userId !== null && coverLetters === undefined);

  return {
    coverLetters: coverLetters as CoverLetter[] | undefined,
    isLoading,
    userId,
    createCoverLetter,
    updateCoverLetter,
    deleteCoverLetter,
  };
}
