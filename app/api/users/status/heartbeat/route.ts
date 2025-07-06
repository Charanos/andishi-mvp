import { NextRequest, NextResponse } from 'next/server';
import { updateUserOnlineStatus } from '@/lib/chat-utils';
import { getSession } from '@/lib/getSession';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await updateUserOnlineStatus(session.user.id, true);
  return NextResponse.json({ success: true });
}
