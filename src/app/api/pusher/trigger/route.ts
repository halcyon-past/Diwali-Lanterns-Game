import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';

function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID || '2210438';
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || 'f2019c5df4e54eb98dcb';
  const secret = process.env.PUSHER_SECRET || '159098389c82d5747a0e';
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

  if (!appId || !key || !secret) {
    return null;
  }

  return new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json(
        { error: 'Pusher credentials not configured on server.' },
        { status: 500 }
      );
    }

    const { channel, event, data } = await request.json();

    if (!channel || !event) {
      return NextResponse.json(
        { error: 'Missing channel or event' },
        { status: 400 }
      );
    }

    await pusher.trigger(channel, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}
