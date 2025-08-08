export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

export interface UserOptions {
  role?: UserData['role'];
  isActive?: boolean;
  withRecentLogin?: boolean;
  customPreferences?: Partial<UserData['preferences']>;
}

export class UserFactory {
  private static idCounter = 1;
  private static readonly firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank'];
  private static readonly lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];

  static create(overrides: Partial<UserData> = {}, options: UserOptions = {}): UserData {
    const id = `user-${this.idCounter++}`;
    const firstName = this.getRandomItem(this.firstNames);
    const lastName = this.getRandomItem(this.lastNames);
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${this.idCounter}`;
    const email = `${username}@example.com`;

    const lastLoginAt = options.withRecentLogin 
      ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Within last 24 hours
      : undefined;

    return {
      id,
      username,
      email,
      firstName,
      lastName,
      role: options.role || 'user',
      isActive: options.isActive !== undefined ? options.isActive : true,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000), // Within last year
      lastLoginAt,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
        ...options.customPreferences
      },
      ...overrides
    };
  }

  static createAdmin(overrides: Partial<UserData> = {}): UserData {
    return this.create(overrides, { role: 'admin', withRecentLogin: true });
  }

  static createInactive(overrides: Partial<UserData> = {}): UserData {
    return this.create(overrides, { isActive: false });
  }

  static createBatch(count: number, options: UserOptions = {}): UserData[] {
    return Array.from({ length: count }, () => this.create({}, options));
  }

  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  static reset(): void {
    this.idCounter = 1;
  }
}

export const createUser = UserFactory.create.bind(UserFactory);
export const createAdminUser = UserFactory.createAdmin.bind(UserFactory);
export const createInactiveUser = UserFactory.createInactive.bind(UserFactory);
