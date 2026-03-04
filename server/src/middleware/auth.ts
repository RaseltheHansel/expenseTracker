import type  {Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../types';

interface JwtPayload { id: string; }

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) {
        res.status(401).json({message: 'No token. Please login first.'});
        return;
    }
    try {
        const secret = process.env.JWT_SECRET;
        if(!secret)throw new Error('JWT_SECRET not defined');
        const decoded = jwt.verify(token, secret) as JwtPayload;    
        req.userId = decoded.id;
        next();
     } catch {
        res.status(500).json({message: 'Invalid token or expired token'});
     }
};

export default verifyToken;