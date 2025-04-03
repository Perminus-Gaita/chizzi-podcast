import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserSession } from "@/services/auth/get-user-session";
import mongoose from 'mongoose';
import userModel from '@/models/user/index.model'; // Adjust this import path
export const dynamic = "force-dynamic";


export async function GET(request) {
  try {
    // Get user session
    const userSession = await getUserSession(cookies, true);

    // Get search term from query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { message: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Perform the search
    const users = await searchUsersAggregation(query, userSession._id);

    return NextResponse.json(
      { message: "Users found", data: users },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error searching for users:', error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: error.statusCode || 500 }
    );
  }
}

const searchUsersAggregation = async (searchTerm, currentUserId) => {
    try {
        const users = await userModel.aggregate([
            {$match: {
                type: 'individual',
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { username: { $regex: searchTerm, $options: 'i' } },
                    { mainEmail: searchTerm },
                    { 'google.email': searchTerm }
                ]
            }},
            {$addFields: {
                isCurrentUser: {
                    $eq: ['$_id', new mongoose.Types.ObjectId(currentUserId)]
                }
            }},
            {$project: {
                _id: 1,
                name: 1,
                username: 1,
                profilePicture: 1,
                isCurrentUser: 1
            }}
        ]);
  
        return users;
    } catch (error) {
      console.error('Error searching for users:', error);
      throw error;
    }
};



