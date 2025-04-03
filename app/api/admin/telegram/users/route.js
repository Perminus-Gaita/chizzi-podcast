export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import User from "@/models/user/index.model"; // Import the User model
import connectToDatabaseMongoDB from '@/lib/database';

// GET handler for fetching all users with a Telegram userId
export async function GET(request) {
  await connectToDatabaseMongoDB("telegramAPI");
  try {
    // Default values if URL is undefined or null
    let page = 1;
    let limit = 10;
    let search = '';

    // Only try to get query parameters if we have a URL
    if (request?.url) {
      try {
        const url = new URL(request.url);
        // Parse query parameters with fallbacks
        page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10')));
        search = url.searchParams.get('search') || '';
      } catch (urlError) {
        console.warn("Error parsing URL parameters, using defaults:", urlError);
      }
    }

    // Build search query safely
    let searchQuery = { 'telegram.userId': { $exists: true } }; // Only fetch users with telegram.userId
    if (search.trim()) {
      searchQuery.$or = [
        { 'telegram.username': { $regex: search, $options: 'i' } },
        { 'telegram.firstName': { $regex: search, $options: 'i' } },
        { 'telegram.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    try {
      // Get total count for pagination
      const total = await User.countDocuments(searchQuery);

      // If no users exist yet, return empty result with proper structure
      if (total === 0) {
        return NextResponse.json({
          success: true,
          data: {
            users: [],
            pagination: {
              total: 0,
              page: 1,
              limit,
              totalPages: 0
            },
            filters: {
              search: search || null
            }
          }
        });
      }

      // Calculate proper pagination values
      const totalPages = Math.ceil(total / limit);
      const validPage = page > totalPages ? 1 : page;
      
      // Fetch users with pagination
      const users = await User.find(searchQuery)
        .select('name username profilePicture bannerImage socialLinks telegram') // Select relevant fields
        .sort({ createdAt: -1 })
        .skip((validPage - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: validPage,
            limit,
            totalPages
          },
          filters: {
            search: search || null
          }
        }
      });

    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          details: 'Failed to fetch users from database'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { 
        error: 'Server error',
        details: 'An unexpected error occurred while processing the request'
      },
      { status: 500 }
    );
  }
}