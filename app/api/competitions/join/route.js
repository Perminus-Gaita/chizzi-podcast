import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import CompetitionModel from "@/models/competition.model";
import { validateRequestBody } from "@/api-lib/validation/validate-request-body";

// Connect to the database
import connectToDatabaseMongoDB from '@/lib/database';
await connectToDatabaseMongoDB("/api/competitions/join");

export async function POST(request) {
  try {
    // Get user session
    const sessionUser = await getUserSession(cookies, true);

    const requestBody = await validateRequestBody(request, {
      competitionId: true,
      submissionLink: true
    });

    const { competitionId, submissionLink } = requestBody;

    // Detect social media platform from submission link
    const socialMediaPlatform = detectSocialMediaPlatform(submissionLink);
    if (!socialMediaPlatform) {
      return NextResponse.json(
        {
          message: "Unsupported social media platform. Please use TikTok, Instagram, X, YouTube, or Facebook."
        },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create submission object with the appropriate platform
    const submission = {};
    submission[socialMediaPlatform] = submissionLink;

    // Add participant to competition
    const updatedCompetition = await CompetitionModel.findByIdAndUpdate(
      competitionId,
      {
        $push: {
          participants: {
            participantId: sessionUser._id,
            submission: submission,
            votes: [] // Initialize with empty votes array
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedCompetition) {
      return NextResponse.json(
        { message: "Competition not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json(
      { 
        message: "Successfully joined competition",
        competition: updatedCompetition
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error joining competition:", error);
    const errorMessage = error.message;
    return NextResponse.json(
      {
        message:
          errorMessage ||
          "Internal Server Error joining competition",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Detects the social media platform from a submission link
 * @param {string} link - The submission link
 * @returns {string|null} - The detected platform or null if not supported
 */
function detectSocialMediaPlatform(link) {
  const url = link.toLowerCase();
  
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  } else if (url.includes('instagram.com')) {
    return 'instagram';
  } else if (url.includes('x.com') || url.includes('twitter.com')) {
    return 'x';
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('facebook.com') || url.includes('fb.com')) {
    return 'facebook';
  }
  
  return null;
}