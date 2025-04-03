import { NextResponse } from 'next/server';
import { checkGroupMembership } from '@/services/integrations/telegram/group/check-group-membership';

export async function GET(request) {
  // Get userId and groupId from URL parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const groupId = searchParams.get('groupId');

  if (!userId || !groupId) {
    return NextResponse.json(
      { error: 'User ID and Group ID are required' },
      { status: 400 }
    );
  }

  try {
    // checkGroupMembership * params order is groupId then userId
    const isMember = await checkGroupMembership(groupId, userId);

    return NextResponse.json({ isMember }, { status: 200 });
  } catch (error) {
    console.error('Error in API route:', error.message);

    // Handle specific errors
    if (error.message === 'Group not found') {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    if (error.message === 'Invalid user ID') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}