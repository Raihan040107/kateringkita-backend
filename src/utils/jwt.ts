import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";

export const generateToken = (userId: number, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
