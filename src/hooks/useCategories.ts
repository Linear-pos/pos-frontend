import { useCallback, useEffect, useState } from 'react';
import { axiosInstance as api } from '@/services/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  tenant_id: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  productCount?: number;
}

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
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
        'Failed to load categories'
      );
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
      } catch (err: any) {
        throw new Error(
          err?.response?.data?.message ??
          'Failed to create category'
        );
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
      } catch (err: any) {
        throw new Error(
          err?.response?.data?.message ??
          'Failed to update category'
        );
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
    } catch (err: any) {
      throw new Error(
        err?.response?.data?.message ??
        'Failed to delete category'
      );
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
