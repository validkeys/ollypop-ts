export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
}

export class PaymentService {
  async processPayment(amount: number, currency = 'USD'): Promise<Payment> {
    return {
      id: `pay_${Math.random().toString(36)}`,
      amount,
      currency,
      status: 'completed'
    };
  }

  async getPayment(id: string): Promise<Payment> {
    return {
      id,
      amount: 100,
      currency: 'USD',
      status: 'completed'
    };
  }

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.getPayment(id);
    return { ...payment, status: 'failed' };
  }
}
