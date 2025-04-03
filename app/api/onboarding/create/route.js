import { cookies } from "next/headers";
import { getUser } from "@/utils/auth/getUser";
import userModel from "@/models/user/index.model";
import { NextResponse } from "next/server";

import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully(onboarding - create)")
);

export async function PATCH(request) {
  try {
    const sessionUser = await getUser(cookies);

    if (!sessionUser) {
      return NextResponse.json(
        { message: "No User Session Available" },
        { status: 400 }
      );
    }

    const userId = sessionUser?._id;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          onboardingStatus: "done",
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error patching create:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
