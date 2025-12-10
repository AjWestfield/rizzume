"use client";

import { useUser } from "@clerk/nextjs";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Mail, Bell, Shield, Loader2 } from "lucide-react";
import Image from "next/image";
import { GradientBackground } from "@/components/ui/GradientBackground";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-screen font-sans flex flex-col relative">
        <GradientBackground />
        <DashboardNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen font-sans flex flex-col overflow-hidden relative">
      <GradientBackground />
      <DashboardNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-500" />
            Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-indigo-600" />
              Profile
            </h2>

            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <User className="h-8 w-8 text-slate-500" />
                  </div>
                )}
                <Button variant="outline" size="sm" className="text-xs" onClick={() => user?.update({})}>
                  Change Photo
                </Button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-slate-600 dark:text-slate-400">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    defaultValue={user?.firstName || ""}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-slate-600 dark:text-slate-400">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    defaultValue={user?.lastName || ""}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email" className="text-slate-600 dark:text-slate-400">
                    Email
                  </Label>
                  <Input
                    id="email"
                    defaultValue={user?.primaryEmailAddress?.emailAddress || ""}
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email is managed through your sign-in provider
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => window.open(user?.publicMetadata?.profileUrl as string || "https://accounts.clerk.com/user", "_blank")}
              >
                Manage Account in Clerk
              </Button>
            </div>
          </Card>

          {/* Email Preferences */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-indigo-600" />
              Email Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Job Alerts</p>
                  <p className="text-sm text-slate-500">Get notified about new job matches</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Application Updates</p>
                  <p className="text-sm text-slate-500">Updates on your job applications</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Tips & Resources</p>
                  <p className="text-sm text-slate-500">Career tips and resume advice</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive browser notifications</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Daily Digest</p>
                  <p className="text-sm text-slate-500">Summary of your daily job matches</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-indigo-600" />
              Security
            </h2>

            <div className="space-y-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Connected Accounts</p>
                <p className="text-sm text-slate-500 mb-3">Accounts linked to your Rizzume profile</p>

                {user?.externalAccounts?.map((account) => (
                  <div key={account.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {account.provider === "google" && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                      {account.provider} ({account.emailAddress})
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-slate-100">Account Created</p>
                <p className="text-sm text-slate-500">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Delete Account</p>
                  <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
