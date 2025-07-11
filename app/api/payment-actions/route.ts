import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/getSession';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const allowedOrigins = [
  'https://andishi-mvp.vercel.app',
  'https://andishi.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.join(','),
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}

// POST /api/payment-actions - Handle payment approval/rejection
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    console.log('[PAYMENT-ACTIONS] Session:', session?.user?.id ? 'Valid' : 'Invalid');

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Only admins can approve/reject payments
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403, headers: corsHeaders }
      );
    }

    const { action, projectId, paymentId, rejectionReason } = await req.json();

    if (!action || !projectId || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = await clientPromise;
    const db = client.db('test');

    // Find the project
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Find the payment
    const payment = project.payments?.find((p: any) => 
      p.id === paymentId || p._id?.toString() === paymentId
    );

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Update payment status
    const updateFields: any = {};
    const currentTime = new Date();

    if (action === 'approve') {
      updateFields['payments.$.status'] = 'approved';
      updateFields['payments.$.approvedBy'] = session.user.id;
      updateFields['payments.$.approvedAt'] = currentTime;
      updateFields['payments.$.updatedAt'] = currentTime;
    } else {
      updateFields['payments.$.status'] = 'rejected';
      updateFields['payments.$.rejectedBy'] = session.user.id;
      updateFields['payments.$.rejectedAt'] = currentTime;
      updateFields['payments.$.rejectionReason'] = rejectionReason;
      updateFields['payments.$.updatedAt'] = currentTime;
    }

    // Update the payment in the database
    const query = payment._id 
      ? { _id: new ObjectId(projectId), 'payments._id': new ObjectId(payment._id) }
      : { _id: new ObjectId(projectId), 'payments.id': paymentId };

    const result = await db.collection('projects').updateOne(
      query,
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update payment' },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`[PAYMENT-ACTIONS] Payment ${paymentId} ${action}d successfully`);

    return NextResponse.json({
      success: true,
      message: `Payment ${action}d successfully`,
      data: {
        paymentId,
        action,
        updatedAt: currentTime
      }
    }, { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('[PAYMENT-ACTIONS] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
