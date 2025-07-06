import { NextRequest, NextResponse } from 'next/server';
import { getUserActiveChats } from '@/lib/chat-utils';
import { getSession } from '@/lib/getSession';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const chats = await getUserActiveChats(session.user.id);
  return NextResponse.json(chats);
}
