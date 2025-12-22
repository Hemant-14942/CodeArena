// src/config/redisClient.ts
import Redis, { RedisOptions } from "ioredis";

const { REDIS_URL } = process.env;

if (!REDIS_URL) {
  throw new Error("❌ REDIS_URL missing");
}

const opts: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
};

if (REDIS_URL.startsWith("rediss://")) {
  opts.tls = {};
}

const redis = new Redis(REDIS_URL, opts);

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.ping(); // 🔥 FORCE CONNECTION
    console.log("✅ Redis connected & ready");

    redis.on("error", (err) =>
      console.error("❌ Redis error", err)
    );

    redis.on("close", () =>
      console.warn("⚠️ Redis connection closed")
    );
  } catch (err) {
    console.error("❌ Redis connection failed", err);
    process.exit(1);
  }
};

export default redis;
