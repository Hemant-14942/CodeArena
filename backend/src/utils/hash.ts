import crypto from "crypto";


 export const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const verifyHash = (data: string, hashedData: string): boolean => {
  const dataHash = hashToken(data);
  return dataHash === hashedData;
};
