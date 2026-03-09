import { API_ENDPOINTS } from '../config/api';
import apiClient from './apiClient';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: string;
  };
}

interface AdminUserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
}

interface ReservationItem {
  id: string;
  quantity: number;
  product?: { name?: string };
  variant?: { sku?: string };
}

interface Reservation {
  id: string;
  user?: { email?: string; fullName?: string };
  customer?: { email?: string; firstName?: string; lastName?: string; phone?: string };
  createdAt: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | string;
  items: ReservationItem[];
}

interface SaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { name?: string; imageUrl?: string } | null;
  variant?: { sku?: string } | null;
}

interface SaleHistory {
  id: string;
  saleNumber: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  saleDate: string;
  createdAt: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
  items: SaleItem[];
}

interface ProductVariant {
  id: string;
  sku: string;
  salePrice?: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  category?: { name?: string };
  categoryId?: string;
  description?: string;
  brand?: string;
  variants?: ProductVariant[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface AdminCreateProductInput {
  name: string;
  description?: string;
  brand?: string;
  imageUrl?: string;
  categoryName?: string;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
}

interface AdminCreateCategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

const AUTH_STORAGE_KEY = 'newoteg_admin_auth';

function ensureSession() {
  const existing = localStorage.getItem(AUTH_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as { token?: string; user?: { role?: string } };
      if (parsed.token && parsed.user?.role === 'ADMIN') {
        apiClient.setToken(parsed.token);
        return;
      }
    } catch {
      // Invalid token, will be handled by login page
    }
  }
  throw new Error('Session non authentifiée. Veuillez vous reconnecter.');
}

export const adminService = {
  async getDashboardData() {
    await ensureSession();

    const [products, reservations] = await Promise.all([
      apiClient.get<Product[]>(API_ENDPOINTS.products.list),
      apiClient.get<Reservation[]>(API_ENDPOINTS.reservations.adminAll),
    ]);

    const productsCount = products.length;
    const stockByProduct = products.map((product) => ({
      name: product.name,
      count: (product.variants || []).reduce((s, variant) => s + (variant.stock || 0), 0),
    }));

    const totalStock = stockByProduct.reduce((sum, product) => {
      return sum + product.count;
    }, 0);

    const activeReservations = reservations.filter((r) => r.status === 'ACTIVE');

    return {
      productsCount,
      totalStock,
      reservations,
      activeReservationsCount: activeReservations.length,
      stockByProduct: stockByProduct.sort((a, b) => b.count - a.count).slice(0, 4),
      products,
    };
  },

  async getOrders() {
    await ensureSession();
    return apiClient.get<Reservation[]>(API_ENDPOINTS.reservations.adminAll);
  },

  async getSalesHistory() {
    await ensureSession();
    return apiClient.get<SaleHistory[]>(API_ENDPOINTS.reservations.adminSalesHistory);
  },

  async getProfile() {
    await ensureSession();
    return apiClient.get<AdminUserProfile>(API_ENDPOINTS.auth.me);
  },

  async updateProfile(input: { fullName?: string; phone?: string }) {
    await ensureSession();
    return apiClient.patch<AdminUserProfile>(API_ENDPOINTS.auth.me, input);
  },

  async uploadProfileImage(file: File) {
    await ensureSession();
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postForm<AdminUserProfile>(API_ENDPOINTS.auth.uploadAvatar, formData);
  },

  async createProduct(input: AdminCreateProductInput) {
    await ensureSession();
    return apiClient.post<Product>(API_ENDPOINTS.products.adminCreate, input);
  },

  async updateProduct(productId: string, input: Partial<AdminCreateProductInput>) {
    await ensureSession();
    return apiClient.patch<Product>(API_ENDPOINTS.products.adminProductById(productId), input);
  },

  async deleteProduct(productId: string) {
    await ensureSession();
    return apiClient.delete<Product>(API_ENDPOINTS.products.adminProductById(productId));
  },

  async updateVariantStock(variantId: string, stock: number) {
    await ensureSession();
    return apiClient.patch<Product>(API_ENDPOINTS.products.adminUpdateStock(variantId), {
      stock,
    });
  },

  async cancelReservationAsAdmin(id: string) {
    await ensureSession();
    return apiClient.patch<Reservation>(API_ENDPOINTS.reservations.adminCancel(id), {});
  },

  async deleteReservation(id: string) {
    await ensureSession();
    return apiClient.delete<Reservation>(API_ENDPOINTS.reservations.adminDelete(id));
  },

  async convertReservationToSale(id: string, paymentMethod = 'CASH') {
    await ensureSession();
    return apiClient.patch(API_ENDPOINTS.reservations.adminConvert(id), {
      paymentMethod,
    });
  },

  async getAdminCategories() {
    await ensureSession();
    return apiClient.get<Category[]>(API_ENDPOINTS.products.adminCategories);
  },

  async createCategory(input: AdminCreateCategoryInput) {
    await ensureSession();
    return apiClient.post<Category>(API_ENDPOINTS.products.adminCategories, input);
  },

  async updateCategory(id: string, input: Partial<AdminCreateCategoryInput>) {
    await ensureSession();
    return apiClient.patch<Category>(API_ENDPOINTS.products.adminCategoryById(id), input);
  },

  async deleteCategory(id: string) {
    await ensureSession();
    return apiClient.delete<Category>(API_ENDPOINTS.products.adminCategoryById(id));
  },

  async uploadProductImage(file: File) {
    await ensureSession();
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postForm<{ imageUrl: string }>(
      API_ENDPOINTS.products.adminUploadProductImage,
      formData,
    );
  },

  async uploadCategoryImage(file: File) {
    await ensureSession();
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postForm<{ imageUrl: string }>(
      API_ENDPOINTS.products.adminUploadCategoryImage,
      formData,
    );
  },
};

export default adminService;
