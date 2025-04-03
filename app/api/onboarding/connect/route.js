import { cookies } from "next/headers";
import userModel from "@/models/user/index.model";
import database_connection from "@/services/database";
import { NextResponse } from "next/server";

import { getUser } from "@/utils/auth/getUser";
database_connection().then(() =>
  console.log("Connected successfully(onboarding - connect)")
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

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: { onboardingStatus: "create" } },
      { new: true }
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
    console.error("Error patching connect:", error);

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
