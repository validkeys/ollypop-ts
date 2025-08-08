export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
}

export const httpClient = {
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    return {
      data: {} as T,
      status: 200,
      message: 'Success'
    };
  },
  
  post: async <T>(url: string, data: any): Promise<ApiResponse<T>> => {
    return {
      data: {} as T,
      status: 201,
      message: 'Created'
    };
  }
};
