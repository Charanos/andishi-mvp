import { NextRequest, NextResponse } from 'next/server';
import { assignDeveloperToProject, getAvailableDevelopers, removeDeveloperFromProject } from '@/lib/chat-utils';
import { getSession } from '@/lib/getSession';

interface Params {
    projectId: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    const session = await getSession(req);
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const devs = await getAvailableDevelopers();
    return NextResponse.json(devs);
}

export async function POST(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    const session = await getSession(req);
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { developerId } = await req.json();
    if (!developerId) return NextResponse.json({ error: 'Missing developerId' }, { status: 400 });
    try {
        const result = await assignDeveloperToProject(params.projectId, developerId, session.user.id);
        return NextResponse.json(result);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
    const session = await getSession(req);
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { developerId, reason } = await req.json();
    if (!developerId) return NextResponse.json({ error: 'Missing developerId' }, { status: 400 });
    try {
        await removeDeveloperFromProject(params.projectId, developerId, session.user.id, reason);
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Internal error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
