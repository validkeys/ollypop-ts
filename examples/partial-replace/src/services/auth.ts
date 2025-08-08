export class AuthService {
  async login(email: string, password: string) {
    return { token: 'mock-token', user: { email } };
  }
  
  async logout() {
    return { success: true };
  }
  
  async validateToken(token: string) {
    return token === 'mock-token';
  }
}
