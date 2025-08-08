export interface NotificationData {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook';
  recipient: string;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
}

export interface NotificationOptions {
  autoSend?: boolean;
  delayMinutes?: number;
  retryOnFailure?: boolean;
}

export class NotificationFactory {
  private static idCounter = 1;

  static create(
    overrides: Partial<NotificationData> = {},
    options: NotificationOptions = {}
  ): NotificationData {
    const id = `notif-${this.idCounter++}`;
    const scheduledAt = options.delayMinutes 
      ? new Date(Date.now() + options.delayMinutes * 60000)
      : undefined;

    const notification: NotificationData = {
      id,
      type: 'email',
      recipient: `user${this.idCounter}@example.com`,
      subject: `Test Notification ${this.idCounter}`,
      message: 'This is a test notification message.',
      priority: 'normal',
      status: 'pending',
      scheduledAt,
      ...overrides
    };

    if (options.autoSend) {
      notification.status = 'sent';
      notification.sentAt = new Date();
    }

    return notification;
  }

  static createEmail(recipient: string, subject: string, message: string): NotificationData {
    return this.create({
      type: 'email',
      recipient,
      subject,
      message
    });
  }

  static createUrgent(overrides: Partial<NotificationData> = {}): NotificationData {
    return this.create({
      priority: 'urgent',
      type: 'push',
      ...overrides
    });
  }

  static createBatch(count: number, options: NotificationOptions = {}): NotificationData[] {
    return Array.from({ length: count }, () => this.create({}, options));
  }

  static reset(): void {
    this.idCounter = 1;
  }
}

export const createNotification = NotificationFactory.create.bind(NotificationFactory);
export const createEmailNotification = NotificationFactory.createEmail.bind(NotificationFactory);
export const createUrgentNotification = NotificationFactory.createUrgent.bind(NotificationFactory);
