import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T = any>(region: string): Promise<T | null> {
    return (await this.cache.get<T>(region)) ?? null;
  }

  async set<T = any>(
    region: string,
    data: T,
    options?: { ttl?: number },
  ): Promise<void> {
    if (options?.ttl) {
      await this.cache.set(region, data, { ttl: options?.ttl } as any); // ✅ TTL만 숫자로 전달
    } else {
      await this.cache.set(region, data);
    }
  }

  async clear(): Promise<void> {
    const cacheWithReset = this.cache as unknown as {
      reset: () => Promise<void>;
    };
    if (typeof cacheWithReset.reset === 'function') {
      await cacheWithReset.reset();
    }
  }
}
