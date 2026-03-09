// Reservations Service - Manage customer reservations
// Handles reservation creation, retrieval, and cancellation

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const reservationsService = {
  // ── Create Reservation ────────────────────────────────────────
  async createReservation(items, customer = null) {
    try {
      // Transform cart items to reservation format
      const reservationItems = items.map(item => ({
        variantId: String(item.variantId || item.code), // Ensure variantId is a string
        quantity: item.quantity,
      }));

      const endpoint = customer
        ? API_ENDPOINTS.RESERVATIONS.CREATE_GUEST
        : API_ENDPOINTS.RESERVATIONS.CREATE;

      const payload = customer
        ? { items: reservationItems, customer }
        : { items: reservationItems };

      const response = await apiClient.post(endpoint, payload);

      return response;
    } catch (error) {
      console.error('Failed to create reservation:', error);
      throw error;
    }
  },

  // ── Get My Reservations ───────────────────────────────────────
  async getMyReservations() {
    try {
      const reservations = await apiClient.get(API_ENDPOINTS.RESERVATIONS.MY_RESERVATIONS);
      return reservations;
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      throw error;
    }
  },

  // ── Cancel Reservation ────────────────────────────────────────
  async cancelReservation(id) {
    try {
      const response = await apiClient.patch(API_ENDPOINTS.RESERVATIONS.CANCEL(id));
      return response;
    } catch (error) {
      console.error(`Failed to cancel reservation ${id}:`, error);
      throw error;
    }
  },
};

export default reservationsService;
