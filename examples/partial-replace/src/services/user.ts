export class UserService {
  async getUser(id: string) {
    return { id, name: 'User ' + id };
  }
  
  async createUser(userData: any) {
    return { id: 'new-id', ...userData };
  }
}
