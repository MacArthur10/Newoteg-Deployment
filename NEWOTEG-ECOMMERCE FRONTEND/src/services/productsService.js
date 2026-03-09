// Products Service - Fetch products and categories from API
// Handles all product-related API calls

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';
import { normalizeCategory, normalizeProduct } from '../utils/productAdapter';

export const productsService = {
  // ── Get All Products ──────────────────────────────────────────
  async getProducts(params = {}) {
    try {
      const products = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, params);
      return (products || []).map(normalizeProduct);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  // ── Get Product by ID ─────────────────────────────────────────
  async getProductById(id) {
    try {
      const product = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
      return normalizeProduct(product);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  },

  // ── Get Categories ────────────────────────────────────────────
  async getCategories() {
    try {
      const [categories, products] = await Promise.all([
        apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES),
        apiClient.get(API_ENDPOINTS.PRODUCTS.LIST),
      ]);

      return (categories || []).map((category) =>
        normalizeCategory(category, products || []),
      );
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  // ── Search Products ───────────────────────────────────────────
  async searchProducts(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      };
      return await this.getProducts(params);
    } catch (error) {
      console.error('Product search failed:', error);
      throw error;
    }
  },
};

export default productsService;
