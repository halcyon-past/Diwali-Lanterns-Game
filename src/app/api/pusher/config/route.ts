import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || 'f2019c5df4e54eb98dcb';
  const cluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

  return NextResponse.json({
    key,
    cluster,
  });
}
