export interface UpdateProfileRequest {
  id: string;
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  id: string;
  name: string;
  email: string;
  updatedAt: string;
}

export const updateProfile = async (request: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  return {
    id: request.id,
    name: request.name || 'Default Name',
    email: request.email || 'default@example.com',
    updatedAt: new Date().toISOString()
  };
};
