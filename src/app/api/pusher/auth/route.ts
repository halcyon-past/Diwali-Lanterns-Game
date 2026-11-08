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
        { error: 'Pusher credentials not configured. Please add PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET to your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const params = new URLSearchParams(body);

    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');
    const userData = params.get('user_data');

    if (!socketId || !channelName) {
      return NextResponse.json(
        { error: 'Missing socket_id or channel_name' },
        { status: 400 }
      );
    }

    if (channelName.startsWith('presence-')) {
      const user = userData ? JSON.parse(userData) : { id: socketId };
      const authResponse = pusher.authorizeChannel(socketId, channelName, {
        user_id: user.id || socketId,
        user_info: {
          name: user.name || 'Player',
        },
      });
      return NextResponse.json(authResponse);
    }

    if (channelName.startsWith('private-')) {
      const authResponse = pusher.authorizeChannel(socketId, channelName);
      return NextResponse.json(authResponse);
    }

    return NextResponse.json({ error: 'Invalid channel' }, { status: 403 });
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
