import redis from "../config/redisClient";

/**
 * Redis key helpers
 */
const refreshKey = (userId: string, tokenId: string) =>
  `refresh:${userId}:${tokenId}`;

const userSessionsKey = (userId: string) =>
  `user_sessions:${userId}`;

/**
 * Save a refresh session
 */
export const saveSession = async (
  userId: string,
  tokenId: string,
  hashedRefreshToken: string,
  ttlSeconds: number
) => {
  await redis.set(
    refreshKey(userId, tokenId),
    hashedRefreshToken,
    "EX",
    ttlSeconds
  );

  // ✅ ioredis uses lowercase
  await redis.sadd(userSessionsKey(userId), tokenId);
};

/**
 * Get stored refresh token hash
 */
export const getSession = async (
  userId: string,
  tokenId: string
): Promise<string | null> => {
  return redis.get(refreshKey(userId, tokenId));
};

/**
 * Delete ONE session
 */
export const deleteSession = async (
  userId: string,
  tokenId: string
) => {
  await redis.del(refreshKey(userId, tokenId));

  // ✅ lowercase
  await redis.srem(userSessionsKey(userId), tokenId);
};

/**
 * Delete ALL sessions of a user
 */
export const deleteAllSessions = async (userId: string) => {
    // this tokenIds is an array conatining all the tokenIds (jti) of the user whom we have to logout from all devices,like one is for he login form 
    // from his laptop another is from his mobile so both the tokenIds will be stored in the redis set user_sessions:{userId}
  const tokenIds = await redis.smembers(userSessionsKey(userId));

  for (const tokenId of tokenIds) {
    await redis.del(refreshKey(userId, tokenId));
  }

  await redis.del(userSessionsKey(userId));
};
/*
  =========================
  REDIS SESSION DESIGN
  =========================

  We store refresh-token sessions in TWO parts:

  1) refresh:{userId}:{tokenId}
     - Stores HASHED refresh token
     - Represents ONE device/session
     - Used to validate refresh token

  2) user_sessions:{userId}  (Redis SET)
     - Stores ALL tokenIds (sessions) of a user
     - Used for logout-all-devices / security
*/

/*
  Redis SET commands used here:

  SADD     -> add value to a set (no duplicates)
  SREM     -> remove value from a set
  SMEMBERS-> get all values from a set

  We use SET because:
  - One user can have multiple devices
  - Each device = one tokenId (jti)
*/

