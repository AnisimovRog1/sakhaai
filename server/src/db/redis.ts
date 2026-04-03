const cache = new Map<string, { value: string; expires: number }>();
export const memCache = {
  async get(key: string): Promise<string | null> {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) { cache.delete(key); return null; }
    return item.value;
  },
  async setex(key: string, ttl: number, value: string | number): Promise<void> {
    cache.set(key, { value: String(value), expires: Date.now() + ttl * 1000 });
  },
  async del(key: string): Promise<void> {
    cache.delete(key);
  },
  async incr(key: string, ttl: number): Promise<number> {
    const item = cache.get(key);
    if (item && Date.now() <= item.expires) {
      const newVal = parseInt(item.value, 10) + 1;
      item.value = String(newVal);
      return newVal;
    }
    cache.set(key, { value: '1', expires: Date.now() + ttl * 1000 });
    return 1;
  },
};
