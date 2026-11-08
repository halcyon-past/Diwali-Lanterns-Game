'use client';

import PusherClient, { Options } from 'pusher-js';

let pusherInstance: PusherClient | null = null;

export function getPusherClient(authParams?: Record<string, string>): PusherClient {
  if (pusherInstance && authParams) {
    // If instance exists but new auth params provided, update or disconnect
    pusherInstance.disconnect();
    pusherInstance = null;
  }

  if (!pusherInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'dummy_key';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1';

    const options: Options = {
      cluster,
      authEndpoint: '/api/pusher/auth',
      authTransport: 'ajax',
      auth: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: authParams || {},
      },
    };

    pusherInstance = new PusherClient(key, options);
  }

  return pusherInstance;
}

/**
 * Trigger an event via our Next.js API route
 */
export async function triggerEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    await fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, event, data }),
    });
  } catch (err) {
    console.error('Trigger event fetch error:', err);
  }
}

/**
 * Clean up Pusher connection
 */
export function disconnectPusher(): void {
  if (pusherInstance) {
    try {
      pusherInstance.disconnect();
    } catch (err) {
      console.warn('Disconnect error:', err);
    }
    pusherInstance = null;
  }
}
