export interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface ProductOptions {
  generateSku?: boolean;
  randomPrice?: boolean;
  defaultCategory?: string;
}

export class ProductFactory {
  private static idCounter = 1;

  static create(overrides: Partial<ProductData> = {}, options: ProductOptions = {}): ProductData {
    const id = `prod-${this.idCounter++}`;
    const sku = options.generateSku ? this.generateSku() : `SKU-${id}`;
    const price = options.randomPrice ? Math.floor(Math.random() * 1000) + 10 : 99.99;
    
    return {
      id,
      name: `Sample Product ${this.idCounter}`,
      sku,
      price,
      category: options.defaultCategory || 'electronics',
      inStock: true,
      ...overrides
    };
  }

  static createBatch(count: number, options: ProductOptions = {}): ProductData[] {
    return Array.from({ length: count }, () => this.create({}, options));
  }

  private static generateSku(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static reset(): void {
    this.idCounter = 1;
  }
}

export const createProduct = ProductFactory.create.bind(ProductFactory);
export const createProducts = ProductFactory.createBatch.bind(ProductFactory);
