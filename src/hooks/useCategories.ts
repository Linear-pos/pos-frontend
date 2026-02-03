import { useCallback, useEffect, useState } from 'react';
import { axiosInstance as api } from '@/services/api';
import type { Category as APICategory } from '../features/admin/api/categories.api';

// Re-export the Category type for backward compatibility
export type Category = Omit<APICategory, 'tenantId' | 'productCount' | 'createdAt' | 'updatedAt'> & {
  tenant_id: string;
  created_at: string;
  updated_at: string;
  productCount?: number;
<<<<<<< Updated upstream
}
=======
};
>>>>>>> Stashed changes

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (payload: CreateCategoryPayload) => Promise<void>;
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const useCategories = (): UseCategoriesResult => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all categories
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/categories');

      setCategories(res.data.data ?? []);
    } catch (err: unknown) {
      setError(`failed to load categories ${err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create category
   */
  const createCategory = useCallback(
    async (payload: CreateCategoryPayload) => {
      setError(null);

      try {
        const res = await api.post('/categories', payload);

        setCategories(prev => [res.data.data, ...prev]);
      } catch (err: unknown) {
        throw new Error(`failed to create category: ${err}`);
      }
    },
    []
  );

  /**
   * Update category
   */
  const updateCategory = useCallback(
    async (id: string, payload: UpdateCategoryPayload) => {
      setError(null);

      try {
        const res = await api.put(`/categories/${id}`, payload);

        setCategories(prev =>
          prev.map(cat =>
            cat.id === id ? res.data.data : cat
          )
        );
      } catch (err: unknown) {
        throw new Error(`failed to update category: ${err}`);
      }
    },
    []
  );

  /**
   * Delete (soft delete)
   */
  const deleteCategory = useCallback(async (id: string) => {
    setError(null);

    try {
      await api.delete(`/categories/${id}`);

      setCategories(prev =>
        prev.filter(cat => cat.id !== id)
      );
    } catch (err: unknown) {
      throw new Error(`failed to delete category ${err}`)
    }
  }, []);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
