import { createClient } from "redis";

class RedisService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
    this.client.on("ready", () => console.log("Redis Client Connected"));
    this.client.on("end", () => console.log("Redis Client Disconnected"));
    this.client.on("error", (err) => console.log("Redis Client Error", err));
    this.expiryTime = 5 * 60; // 5 minute in seconds
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.quit();
  }

  async set(key, value) {
    const stringValue = JSON.stringify(value);
    await this.client.setEx(key, this.expiryTime, stringValue);
  }

  async get(key) {
    const data = await this.client.get(key);
    if (!data) return null;
    return await JSON.parse(data);
  }
  async invalidate(key) {
    await this.client.del(key);
  }
}

const redisService = new RedisService();
redisService.connect();

export default redisService;
