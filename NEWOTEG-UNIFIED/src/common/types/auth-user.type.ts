export type AuthUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'CUSTOMER';
  fullName?: string;
  isActive?: boolean;
};
