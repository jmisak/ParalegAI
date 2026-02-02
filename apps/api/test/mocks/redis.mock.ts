/**
 * Redis Mock
 *
 * Provides in-memory mock for Redis operations during testing.
 */

export class MockRedisClient {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    this.store.set(key, value);
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<string> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.store.has(key) ? 1 : 0;
  }

  async ttl(key: string): Promise<number> {
    return this.store.has(key) ? 3600 : -2;
  }

  async flushall(): Promise<string> {
    this.store.clear();
    return 'OK';
  }

  async quit(): Promise<string> {
    return 'OK';
  }

  async disconnect(): Promise<void> {
    this.store.clear();
  }
}

export const createMockRedisClient = (): MockRedisClient => {
  return new MockRedisClient();
};
