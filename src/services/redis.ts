const UPSTASH_REDIS_REST_URL = "https://lasting-wombat-111412.upstash.io";
const UPSTASH_REDIS_REST_TOKEN = "gQAAAAAAAbM0AAIgcDE2Y2M3MzJlMDM2YzQ0Yjg0YjNjZTg4MmQxNWMxNWNkOA";

class RedisClient {
  async get<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${UPSTASH_REDIS_REST_URL}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        },
      });
      const data = await response.json();
      if (data.result) {
        return JSON.parse(data.result) as T;
      }
      return null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await fetch(`${UPSTASH_REDIS_REST_URL}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        },
        body: JSON.stringify(value),
      });
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }
}

const redis = new RedisClient();
export default redis;
