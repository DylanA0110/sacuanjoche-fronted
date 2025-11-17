export interface AuthResponse {
    id:            string;
    email:         string;
    loginAttempts: number;
    blockedUntil:  null;
    estado:        string;
    roles:         string[];
    token:         string;
}
