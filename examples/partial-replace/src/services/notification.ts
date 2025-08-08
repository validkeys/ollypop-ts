export class NotificationService {
  async sendEmail(to: string, subject: string, body: string) {
    console.log(`Sending email to ${to}: ${subject}`);
    return { messageId: 'msg-' + Date.now() };
  }
  
  async sendPush(userId: string, message: string) {
    console.log(`Sending push to ${userId}: ${message}`);
    return { success: true };
  }
}
