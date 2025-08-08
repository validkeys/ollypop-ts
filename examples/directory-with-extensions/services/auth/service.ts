export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
}

export class AuthService {
  async login(email: string, password: string): Promise<AuthToken> {
    // Mock authentication
    return {
      token: 'mock-jwt-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      userId: 'user-123'
    };
  }

  async logout(token: string): Promise<void> {
    // Mock logout
    console.log('User logged out');
  }

  async validateToken(token: string): Promise<boolean> {
    // Mock validation
    return token === 'mock-jwt-token';
  }
}
