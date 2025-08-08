export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
}

export const createUser = async (request: CreateUserRequest): Promise<CreateUserResponse> => {
  return {
    id: Math.random().toString(36),
    name: request.name,
    email: request.email
  };
};
