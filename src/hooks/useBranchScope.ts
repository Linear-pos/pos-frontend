import { useAuthStore } from '@/stores/auth.store';

/**
 * Hook to determine branch scope for the current user
 * - Returns branchId for BRANCH_MANAGER (scoped to one branch)
 * - Returns null for SYSTEM_ADMIN (access to all branches)
 */
export const useBranchScope = () => {
    const user = useAuthStore((state) => state.user);

    // Get user role
    const userRole = typeof user?.role === 'string'
        ? user.role
        : user?.role?.name;

    // Branch managers are scoped to their branch
    const isBranchScoped = userRole === 'BRANCH_MANAGER';
    const branchId = isBranchScoped ? user?.branch_id : null;

    return {
        branchId,
        isBranchScoped,
        isSystemAdmin: userRole === 'SYSTEM_ADMIN',
    };
};
