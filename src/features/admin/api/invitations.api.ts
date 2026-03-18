import { axiosInstance } from '@/services/api';

export interface InviteUserPayload {
    email: string;
    name: string;
    role?: string;
    branchId?: string;
}

export interface InviteUserResponse {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const invitationsAPI = {
    inviteUser: async (payload: InviteUserPayload): Promise<InviteUserResponse> => {
        const response = await axiosInstance.post<InviteUserResponse>('/invitations', payload);
        return response.data;
    },
};
