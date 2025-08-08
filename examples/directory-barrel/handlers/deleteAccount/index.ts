export interface DeleteAccountRequest {
  id: string;
  confirmationCode: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  deletedAt: string;
}

export const deleteAccount = async (request: DeleteAccountRequest): Promise<DeleteAccountResponse> => {
  return {
    success: true,
    deletedAt: new Date().toISOString()
  };
};
