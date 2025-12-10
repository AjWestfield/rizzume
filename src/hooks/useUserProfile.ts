"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type {
  UserProfile,
  ProfileCompleteness,
  PersonalInfoInput,
  ProfessionalLinksInput,
  WorkAuthorization,
  Availability,
} from "@/types/user-profile";

// Storage key for profile data
const PROFILE_STORAGE_KEY = "rizzume_profile";
const USER_EMAIL_KEY = "rizzume_user_email";

interface UseUserProfileResult {
  // User ID (simulated for localStorage)
  userId: string | null;
  isLoading: boolean;

  // True only after profile has been fully checked (localStorage + Convex if needed)
  profileChecked: boolean;

  // Profile data
  profile: UserProfile | null;
  completeness: ProfileCompleteness | null;

  // Computed
  isComplete: boolean;
  // Only reliable when profileChecked is true
  isReadyForAutoApply: boolean;
  missingFields: string[];

  // Actions
  initializeUser: (email: string, name?: string) => Promise<string | null>;
  updatePersonalInfo: (data: PersonalInfoInput) => Promise<void>;
  updateProfessionalLinks: (data: ProfessionalLinksInput) => Promise<void>;
  updateWorkAuthorization: (data: WorkAuthorization) => Promise<void>;
  updateAvailability: (data: Availability) => Promise<void>;
  refreshProfile: () => void;
  resetProfile: () => void;
}

// Calculate profile completeness
function calculateCompleteness(profile: Partial<UserProfile> | null): ProfileCompleteness {
  if (!profile) {
    return {
      percentage: 0,
      completedFields: [],
      missingFields: ["firstName", "lastName", "email", "phone"],
      isReadyForAutoApply: false,
    };
  }

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  // Check REQUIRED fields for auto-apply (firstName, lastName, email)
  // Phone is optional but recommended
  const hasRequiredFields = !!(profile.firstName && profile.lastName && profile.email);

  // Check personal info (40% weight) - includes phone for completeness calculation
  const hasPersonalInfo = !!(profile.firstName && profile.lastName && profile.email && profile.phone);
  if (hasPersonalInfo) {
    completedFields.push("personalInfo");
  } else {
    if (!profile.firstName) missingFields.push("firstName");
    if (!profile.lastName) missingFields.push("lastName");
    if (!profile.email) missingFields.push("email");
    if (!profile.phone) missingFields.push("phone");
  }

  // Check professional links (20% weight) - can be skipped
  const hasProfessionalLinks = !!(profile.linkedinUrl || profile.portfolioUrl || profile.githubUrl || profile.professionalLinksSkipped);
  if (hasProfessionalLinks) {
    completedFields.push("professionalLinks");
  }

  // Check work authorization (20% weight)
  const hasWorkAuth = profile.workAuthorization?.authorizedToWork !== undefined;
  if (hasWorkAuth) {
    completedFields.push("workAuthorization");
  } else {
    missingFields.push("workAuthorization");
  }

  // Check availability (20% weight)
  const hasAvailability = !!profile.availability?.startDateType;
  if (hasAvailability) {
    completedFields.push("availability");
  } else {
    missingFields.push("availability");
  }

  // Calculate percentage
  let percentage = 0;
  if (hasPersonalInfo) percentage += 40;
  if (hasProfessionalLinks) percentage += 20;
  if (hasWorkAuth) percentage += 20;
  if (hasAvailability) percentage += 20;

  // Ready for auto-apply if we have REQUIRED fields (firstName, lastName, email)
  // Phone is optional - auto-apply can still work without it
  const isReadyForAutoApply = hasRequiredFields;

  return {
    percentage,
    completedFields,
    missingFields,
    isReadyForAutoApply,
  };
}

export function useUserProfile(): UseUserProfileResult {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);
  const hasLoadedFromConvex = useRef(false);

  // Convex hooks
  const syncProfileMutation = useMutation(api.users.syncProfile);

  // Get email for Convex query (try localStorage first)
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(USER_EMAIL_KEY);
    }
    return null;
  });

  // Query Convex for profile by email (only if we have an email and haven't loaded from localStorage)
  const convexProfile = useQuery(
    api.users.getUserByEmail,
    userEmail ? { email: userEmail } : "skip"
  );

  // Load profile: try localStorage first, then fall back to Convex
  useEffect(() => {
    const loadProfile = () => {
      try {
        // 1. Try localStorage first (fast)
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setUserId(parsed.email || "local-user");
          setIsLoading(false);
          setProfileChecked(true);
          return;
        }

        // 2. If no localStorage and we have email, wait for Convex
        const email = localStorage.getItem(USER_EMAIL_KEY);
        if (!email) {
          // No email stored, user hasn't initialized
          setIsLoading(false);
          setProfileChecked(true);
        }
        // If we have email, isLoading will be set to false when convexProfile loads
      } catch (error) {
        console.error("Error loading profile:", error);
        setIsLoading(false);
        setProfileChecked(true);
      }
    };

    loadProfile();
  }, []);

  // Handle Convex profile data (fallback when localStorage is empty)
  useEffect(() => {
    // Skip if we already have a profile from localStorage
    if (profile) return;

    // Skip if already loaded from Convex
    if (hasLoadedFromConvex.current) return;

    // Skip if convexProfile is still loading (undefined) or we skipped the query
    if (convexProfile === undefined) return;

    hasLoadedFromConvex.current = true;

    if (convexProfile) {
      // Convert Convex profile to UserProfile format
      const loadedProfile: UserProfile = {
        email: convexProfile.email,
        firstName: convexProfile.firstName || "",
        lastName: convexProfile.lastName || "",
        phone: convexProfile.phone || "",
        city: convexProfile.city || "",
        state: convexProfile.state || "",
        country: convexProfile.country || "",
        zipCode: convexProfile.zipCode || "",
        linkedinUrl: convexProfile.linkedinUrl || "",
        portfolioUrl: convexProfile.portfolioUrl || "",
        githubUrl: convexProfile.githubUrl || "",
        professionalLinksSkipped: convexProfile.professionalLinksSkipped || false,
        workAuthorization: convexProfile.workAuthorization as WorkAuthorization | undefined,
        availability: convexProfile.availability as Availability | undefined,
        resumeText: convexProfile.resumeText || "",
        parsedSkills: convexProfile.parsedSkills || [],
        createdAt: convexProfile.createdAt || Date.now(),
        updatedAt: convexProfile.updatedAt || Date.now(),
      };

      // Cache to localStorage for faster future loads
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(loadedProfile));
      setProfile(loadedProfile);
      setUserId(loadedProfile.email);
      console.log("Profile loaded from Convex and cached to localStorage");
    }

    setIsLoading(false);
    setProfileChecked(true);
  }, [convexProfile, profile]);

  // Save profile to localStorage AND sync to Convex
  const saveProfile = useCallback(async (updatedProfile: UserProfile) => {
    try {
      // 1. Save to localStorage immediately (fast)
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // 2. Sync to Convex (durable storage)
      if (updatedProfile.email) {
        localStorage.setItem(USER_EMAIL_KEY, updatedProfile.email);
        setUserEmail(updatedProfile.email);

        await syncProfileMutation({
          email: updatedProfile.email,
          firstName: updatedProfile.firstName || undefined,
          lastName: updatedProfile.lastName || undefined,
          phone: updatedProfile.phone || undefined,
          city: updatedProfile.city || undefined,
          state: updatedProfile.state || undefined,
          country: updatedProfile.country || undefined,
          zipCode: updatedProfile.zipCode || undefined,
          linkedinUrl: updatedProfile.linkedinUrl || undefined,
          portfolioUrl: updatedProfile.portfolioUrl || undefined,
          githubUrl: updatedProfile.githubUrl || undefined,
          professionalLinksSkipped: updatedProfile.professionalLinksSkipped || undefined,
          workAuthorization: updatedProfile.workAuthorization || undefined,
          availability: updatedProfile.availability || undefined,
          resumeText: updatedProfile.resumeText || undefined,
          parsedSkills: updatedProfile.parsedSkills || undefined,
        });
        console.log("Profile synced to Convex");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }, [syncProfileMutation]);

  const initializeUser = useCallback(
    async (email: string, name?: string): Promise<string | null> => {
      try {
        const existingProfile = profile || ({} as Partial<UserProfile>);
        const now = Date.now();
        const updatedProfile: UserProfile = {
          ...existingProfile,
          email,
          firstName: existingProfile.firstName || name?.split(" ")[0] || "",
          lastName: existingProfile.lastName || name?.split(" ").slice(1).join(" ") || "",
          createdAt: existingProfile.createdAt || now,
          updatedAt: now,
        } as UserProfile;

        await saveProfile(updatedProfile);
        setUserId(email);
        if (name) localStorage.setItem("rizzume_user_name", name);
        return email;
      } catch (error) {
        console.error("Error initializing user:", error);
        return null;
      }
    },
    [profile, saveProfile]
  );

  const updatePersonalInfo = useCallback(
    async (data: PersonalInfoInput) => {
      const now = Date.now();
      const updatedProfile: UserProfile = {
        ...profile,
        ...data,
        updatedAt: now,
        createdAt: profile?.createdAt || now,
        // Use email from data first, then fallback to existing profile email
        email: data.email || profile?.email || "",
      } as UserProfile;
      await saveProfile(updatedProfile);
    },
    [profile, saveProfile]
  );

  const updateProfessionalLinks = useCallback(
    async (data: ProfessionalLinksInput) => {
      const now = Date.now();
      // Ensure email is preserved from existing profile
      if (!profile?.email) {
        console.warn("[updateProfessionalLinks] No email in profile - updates may not sync to Convex");
      }
      const updatedProfile: UserProfile = {
        ...profile,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        githubUrl: data.githubUrl,
        professionalLinksSkipped: data.professionalLinksSkipped,
        updatedAt: now,
        createdAt: profile?.createdAt || now,
        email: profile?.email || "",
      } as UserProfile;
      await saveProfile(updatedProfile);
    },
    [profile, saveProfile]
  );

  const updateWorkAuthorization = useCallback(
    async (data: WorkAuthorization) => {
      const now = Date.now();
      // Ensure email is preserved from existing profile
      if (!profile?.email) {
        console.warn("[updateWorkAuthorization] No email in profile - updates may not sync to Convex");
      }
      const updatedProfile: UserProfile = {
        ...profile,
        workAuthorization: data,
        updatedAt: now,
        createdAt: profile?.createdAt || now,
        email: profile?.email || "",
      } as UserProfile;
      await saveProfile(updatedProfile);
    },
    [profile, saveProfile]
  );

  const updateAvailability = useCallback(
    async (data: Availability) => {
      const now = Date.now();
      // Ensure email is preserved from existing profile
      if (!profile?.email) {
        console.warn("[updateAvailability] No email in profile - updates may not sync to Convex");
      }
      const updatedProfile: UserProfile = {
        ...profile,
        availability: data,
        updatedAt: now,
        createdAt: profile?.createdAt || now,
        email: profile?.email || "",
      } as UserProfile;
      await saveProfile(updatedProfile);
    },
    [profile, saveProfile]
  );

  const refreshProfile = useCallback(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  }, []);

  const resetProfile = useCallback(() => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(USER_EMAIL_KEY);
      setProfile(null);
      setUserId(null);
      setUserEmail(null);
      hasLoadedFromConvex.current = false;
      console.log("[resetProfile] Profile cleared from localStorage");
    } catch (error) {
      console.error("Error resetting profile:", error);
    }
  }, []);

  const completeness = calculateCompleteness(profile);

  return {
    userId,
    isLoading,
    profileChecked,
    profile,
    completeness,
    isComplete: completeness.percentage >= 100,
    isReadyForAutoApply: completeness.isReadyForAutoApply,
    missingFields: completeness.missingFields,
    initializeUser,
    updatePersonalInfo,
    updateProfessionalLinks,
    updateWorkAuthorization,
    updateAvailability,
    refreshProfile,
    resetProfile,
  };
}
