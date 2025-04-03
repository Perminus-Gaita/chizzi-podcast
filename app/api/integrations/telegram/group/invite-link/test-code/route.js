import { NextResponse } from 'next/server';
import getOrGenerateGroupInviteLink from '@/services/integrations/telegram/group/get-or-generate-group-invite-link'; // Adjust the import path accordingly

export async function GET(request) {
  const groupId = -1002173462672;

  if (!groupId) {
    return NextResponse.json(
      { error: 'Group ID is required' },
      { status: 400 }
    );
  }

  try {
    // Call the service to get or generate the invite link
    const result = await getOrGenerateGroupInviteLink(groupId);

    // Return the group data and invite link
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error.message);

    // Handle specific errors
    if (error.message === 'No group found with the provided ID') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Failed to generate invite link') {
      return NextResponse.json(
        { error: 'Failed to generate invite link' },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}