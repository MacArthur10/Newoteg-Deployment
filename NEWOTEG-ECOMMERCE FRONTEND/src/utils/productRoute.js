export const getProductRouteRef = (product) => {
  if (product?.id) {
    return String(product.id);
  }

  if (product?.code) {
    return encodeURIComponent(String(product.code));
  }

  return '';
};

export const getProductRoutePath = (product) => `/product/${getProductRouteRef(product)}`;
