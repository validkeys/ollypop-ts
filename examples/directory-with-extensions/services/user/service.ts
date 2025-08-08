export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserService {
  async getUser(id: string): Promise<User> {
    return {
      id,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    return {
      id: Math.random().toString(36),
      ...userData
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    return { ...user, ...updates };
  }
}
