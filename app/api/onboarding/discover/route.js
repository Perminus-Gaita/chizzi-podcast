import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";

import userModel from "@/models/user/index.model";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";
database_connection().then(() =>
  console.log("Connected successfully(onboarding - account)")
);

export async function PATCH(request) {
  const sessionUser = await getUser(cookies);

  if (!sessionUser) {
    return NextResponse.json(
      { message: "No User Session Available" },
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const userId = sessionUser?._id;

  const data = await request.json();

  console.log("USER IF HERE ######");
  console.log(data);

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          accountType: "personal",
          discovery: data.platform,
          onboardingStatus: "connect",
        },
      },
      { new: true, overwrite: true }
    );

    if (updatedUser) {
      return NextResponse.json(updatedUser, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error patching discovery:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
