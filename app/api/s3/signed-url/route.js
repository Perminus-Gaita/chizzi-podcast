import S3 from "aws-sdk/clients/s3";
import { NextResponse } from "next/server";
import { getUser } from "@/utils/auth/getUser";
import { cookies } from "next/headers";

export async function POST(request) {
  const { filename, fileType, tournamentId, assetType } = await request.json();

  try {
    const sessionUser = await getUser(cookies);
    if (!sessionUser) {
      throw "Error! Unauthorized action!";
    }

    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "ap-south-1",
      signatureVersion: "v4",
    });

    // Structure: tournaments/{tournamentId}/{assetType}/{filename}
    const Key = `tournaments/${tournamentId}/${assetType}/${filename}`;

    const metadata = {
      userId: sessionUser._id.toString(),
      tournamentId: tournamentId,
      assetType: assetType, // 'table' or 'card'
      originalFilename: filename,
    };

    console.log("Asset type:", assetType);
    console.log("Generated metadata:", metadata);

    const s3Params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      Key,
      Expires: 600,
      ContentType: fileType,
      ACL: "public-read",
      Metadata: metadata,
    };

    const uploadUrl = await s3.getSignedUrl("putObject", s3Params);

    console.log("### received ###");
    console.log(uploadUrl);

    return NextResponse.json(
      {
        uploadUrl,
        Key,
        metadata,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log({ error });
    return NextResponse.json(error, { status: 500 });
  }
}
