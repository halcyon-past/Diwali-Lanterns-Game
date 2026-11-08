'use client';

import PusherClient, { Options } from 'pusher-js';

let pusherInstance: PusherClient | null = null;
let cachedConfig: { key: string; cluster: string } | null = null;

export async function fetchPusherConfig(): Promise<{ key: string; cluster: string }> {
  if (cachedConfig) return cachedConfig;

  try {
    const res = await fetch('/api/pusher/config');
    if (res.ok) {
      cachedConfig = await res.json();
      return cachedConfig!;
    }
  } catch (err) {
    console.warn('Failed to fetch pusher config from API:', err);
  }

  // Fallback default
  cachedConfig = {
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'f2019c5df4e54eb98dcb',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  };
  return cachedConfig;
}

export function getPusherClient(authParams?: Record<string, string>): PusherClient {
  if (pusherInstance && authParams) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }

  if (!pusherInstance) {
    const key = cachedConfig?.key || process.env.NEXT_PUBLIC_PUSHER_KEY || 'f2019c5df4e54eb98dcb';
    const cluster = cachedConfig?.cluster || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

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
