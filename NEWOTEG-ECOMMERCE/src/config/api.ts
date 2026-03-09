const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
    uploadAvatar: `${API_BASE_URL}/auth/me/avatar`,
  },
  products: {
    list: `${API_BASE_URL}/products`,
    categories: `${API_BASE_URL}/products/categories`,
    adminCreate: `${API_BASE_URL}/products/admin`,
    adminProductById: (id: string) => `${API_BASE_URL}/products/admin/${id}`,
    adminUpdateStock: (variantId: string) =>
      `${API_BASE_URL}/products/admin/variants/${variantId}/stock`,
    adminCategories: `${API_BASE_URL}/products/admin/categories`,
    adminCategoryById: (id: string) => `${API_BASE_URL}/products/admin/categories/${id}`,
    adminUploadProductImage: `${API_BASE_URL}/products/admin/upload/product-image`,
    adminUploadCategoryImage: `${API_BASE_URL}/products/admin/upload/category-image`,
  },
  reservations: {
    mine: `${API_BASE_URL}/reservations/me`,
    adminAll: `${API_BASE_URL}/reservations/admin/all`,
    adminSalesHistory: `${API_BASE_URL}/reservations/admin/sales-history`,
    adminCancel: (id: string) => `${API_BASE_URL}/reservations/admin/${id}/cancel`,
    adminConvert: (id: string) => `${API_BASE_URL}/reservations/admin/${id}/convert`,
    adminDelete: (id: string) => `${API_BASE_URL}/reservations/admin/${id}`,
  },
};

export default API_BASE_URL;
