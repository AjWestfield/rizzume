import { NextRequest, NextResponse } from "next/server";
import { searchAllJobs } from "@/lib/jobs/combined-job-search";
import { JobSearchParams } from "@/types/job";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const params: JobSearchParams = {
      query,
      location: searchParams.get("location") || undefined,
      locationDistance: searchParams.get("radius") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      datePosted: (searchParams.get("date") as JobSearchParams["datePosted"]) || "all",
      remoteOnly: searchParams.get("remote") === "true",
      officeType: searchParams.get("office") || undefined,
      employmentType: searchParams.get("type") || undefined,
      experienceLevel: searchParams.get("experience") || undefined,
      minSalary: searchParams.get("minSalary") ? parseInt(searchParams.get("minSalary")!, 10) : undefined,
      requireSalary: searchParams.get("requireSalary") === "true",
      jobFunction: searchParams.get("jobFunction") || undefined,
      industry: searchParams.get("industry") || undefined,
    };

    const jobs = await searchAllJobs(params);

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("[API] Job search error:", error);

    const message = error instanceof Error ? error.message : "An error occurred";

    if (message.includes("Rate limit")) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    if (message.includes("RAPIDAPI_KEY")) {
      return NextResponse.json(
        { error: "API configuration error. Please check server settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
