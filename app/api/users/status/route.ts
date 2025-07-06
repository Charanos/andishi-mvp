import { NextRequest, NextResponse } from 'next/server';
import { updateUserOnlineStatus, getUserUnreadMessageCount } from '@/lib/chat-utils';
import { getSession } from '@/lib/getSession';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const unread = await getUserUnreadMessageCount(session.user.id);
    // You may want to add active projects count here as well
    return NextResponse.json({ status: session.user.status, unreadMessageCount: unread });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { isOnline, status } = await req.json();
    await updateUserOnlineStatus(session.user.id, isOnline);
    // Optionally update custom status
    // ...
    return NextResponse.json({ success: true });
}
