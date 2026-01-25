import { sign } from 'hono/jwt'
import { JWT_CONFIG } from '../config/jwt.config.js'

export const generateToken = async (userId: string, email: string): Promise<string> => {
    const payload = {
        sub: userId,
        email: email,
        iss: JWT_CONFIG.issuer,
        exp: Math.floor(Date.now() / 1000) + JWT_CONFIG.expiresIn,
        iat: Math.floor(Date.now() / 1000),
    }
  
    return await sign(payload, JWT_CONFIG.secret, JWT_CONFIG.algorithm)
}