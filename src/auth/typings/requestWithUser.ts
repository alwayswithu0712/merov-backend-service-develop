import { Request } from 'express';
import { Permission } from '../../shared/typings';

export interface TokenPayload {
    id: string;
    accountId: string;
    'https://merov.io/username': string;
    'https://merov.io/roles': string[];
    sessionId: string;
    iss: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
    azp: string;
    scope: string;
    permissions: string[];
}

export interface User {
    id: string;
    accountId: string;
    email: string;
    isAdmin: boolean;
    auth0Id: string;
    sessionId: string;
    roles: string[];
    permissions: Permission[];
    username: string;
}

export interface RequestWithUser extends Request {
    user: User;
}
