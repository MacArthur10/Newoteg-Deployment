const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop';

const slugify = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

export const normalizeProduct = (product) => {
  const primaryVariant = product?.variants?.[0];
  const code = primaryVariant?.sku || product?.id;

  return {
    id: product?.id,
    code,
    variantId: primaryVariant?.id,
    model: product?.name || 'Produit',
    marque: product?.brand || null,
    familleId: product?.categoryId || '',
    categoryName: product?.category?.name || 'Sans categorie',
    categorySlug: slugify(product?.category?.name || 'sans-categorie'),
    parentCategory: product?.category?.name || 'Catalogue',
    retailPrice: Number(primaryVariant?.salePrice || 0),
    wholesalePrice: Number(primaryVariant?.purchasePrice || primaryVariant?.salePrice || 0),
    image: product?.imageUrl || FALLBACK_IMAGE,
  };
};

export const normalizeCategory = (category, products = []) => {
  const categoryProducts = products.filter((p) => p.categoryId === category.id);
  const slug = slugify(category.name || 'categorie');

  return {
    name: category.name,
    slug,
    count: categoryProducts.length,
    image: category.imageUrl || FALLBACK_IMAGE,
    subcategories: [
      {
        name: category.name,
        slug,
        count: categoryProducts.length,
      },
    ],
  };
};
