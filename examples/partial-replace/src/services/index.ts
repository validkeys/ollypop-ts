// Custom imports and utilities
import { config } from '../config';
import type { ServiceOptions } from '../types';

// Custom helper functions
export function createServiceConfig(options: ServiceOptions) {
  return {
    ...config.defaults,
    ...options,
  };
}

export const SERVICE_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;
// AUTO-GENERATED EXPORTS - START

export * from './Auth'
export * from './Notification'
export * from './User'

// AUTO-GENERATED EXPORTS - END
// More custom code after the auto-generated section
export class ServiceManager {
  constructor(private options: ServiceOptions) {}
  
  async initialize() {
    console.log('Initializing services...');
  }
}

// Default export
export default ServiceManager;
