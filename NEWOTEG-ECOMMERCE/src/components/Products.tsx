import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Search, RefreshCw, Plus, Edit2, Trash2, X, Package, Image as ImageIcon } from 'lucide-react';
import adminService from '../services/adminService';
import { formatFcfa } from '../utils/currency';

type ProductVariant = {
  id: string;
  sku: string;
  stock: number;
  salePrice?: number;
  purchasePrice?: number;
};

type Product = {
  id: string;
  name: string;
  categoryId?: string;
  description?: string;
  brand?: string;
  imageUrl?: string;
  category?: { name?: string; id?: string };
  variants?: ProductVariant[];
};

type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    brand: '',
    categoryName: '',
  });
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand: '',
    categoryName: '',
    sku: '',
    purchasePrice: '0',
    salePrice: '0',
    stock: '0',
  });

  const loadData = async () => {
    setIsBusy(true);
    setError('');
    try {
      const data = await adminService.getDashboardData();
      setProducts(data.products);
      const cats = await adminService.getAdminCategories();
      setCategories(cats);
      
      // Initialize stock drafts
      const drafts: Record<string, string> = {};
      data.products.forEach((product: Product) => {
        (product.variants || []).forEach((variant) => {
          drafts[variant.id] = String(variant.stock ?? 0);
        });
      });
      setStockDrafts(drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les produits.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const category = (p.category?.name || '').toLowerCase();
      const sku = (p.variants || []).map(v => v.sku.toLowerCase()).join(' ');
      return name.includes(q) || brand.includes(q) || category.includes(q) || sku.includes(q);
    });
  }, [products, query]);

  const filteredCategories = useMemo(() => {
    const q = form.categoryName.trim().toLowerCase();
    if (!q) return categories.slice(0, 12);
    return categories.filter((cat) => cat.name.toLowerCase().includes(q)).slice(0, 12);
  }, [categories, form.categoryName]);

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsBusy(true);
    setError('');
    setSuccess('');

    try {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === form.categoryName.trim().toLowerCase()
      );

      if (!matchedCategory) {
        throw new Error('Sélectionnez une catégorie existante dans la liste.');
      }

      if (!productImageFile) {
        throw new Error('Veuillez sélectionner une image produit.');
      }

      const uploaded = await adminService.uploadProductImage(productImageFile);
      
      await adminService.createProduct({
        name: form.name,
        description: form.description || undefined,
        brand: form.brand || undefined,
        imageUrl: uploaded.imageUrl,
        categoryName: matchedCategory.name,
        sku: form.sku,
        purchasePrice: Number(form.purchasePrice),
        salePrice: Number(form.salePrice),
        stock: Number(form.stock),
      });

      setSuccess('Produit créé avec succès.');
      setForm({
        name: '',
        description: '',
        brand: '',
        categoryName: '',
        sku: '',
        purchasePrice: '0',
        salePrice: '0',
        stock: '0',
      });
      setProductImageFile(null);
      setShowCreateModal(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de création produit.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateStock = async (variantId: string) => {
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      await adminService.updateVariantStock(variantId, Number(stockDrafts[variantId] || 0));
      setSuccess('Stock mis à jour.');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de mise à jour du stock.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleEditProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      let imageUrl = editingProduct.imageUrl;
      if (editImageFile) {
        const uploadResult = await adminService.uploadProductImage(editImageFile);
        imageUrl = uploadResult.imageUrl;
      }

      await adminService.updateProduct(editingProduct.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        brand: editForm.brand || undefined,
        categoryName: editForm.categoryName || undefined,
        imageUrl: imageUrl || undefined,
      });

      setSuccess('Produit mis à jour avec succès.');
      setEditImageFile(null);
      setShowEditModal(false);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de mise à jour du produit.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      await adminService.deleteProduct(productId);
      setSuccess('Produit supprimé avec succès.');
      setDeleteConfirmId(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de suppression du produit.');
      setDeleteConfirmId(null);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Produits</h2>
          <p className="text-slate-500 text-sm">Gérez votre catalogue de produits et leur stock</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={isBusy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={16} />
            Rafraîchir
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-opacity-90"
          >
            <Plus size={16} />
            Nouveau Produit
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom, marque, catégorie ou SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Marque</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Prix Vente</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
                        <Package className="text-slate-400" size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-slate-600">{product.brand || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-1">
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="text-xs text-slate-500">
                            {variant.sku}
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-1">
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="text-sm font-semibold text-slate-800">
                            {formatFcfa(variant.salePrice || 0)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-2">
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center gap-2">
                            <input
                              type="number"
                              value={stockDrafts[variant.id] || '0'}
                              onChange={(e) => setStockDrafts({ ...stockDrafts, [variant.id]: e.target.value })}
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm"
                              min="0"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateStock(variant.id)}
                              disabled={isBusy}
                              className="text-xs text-primary hover:underline disabled:opacity-60"
                            >
                              Mettre à jour
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setEditForm({
                            name: product.name,
                            description: product.description || '',
                            brand: product.brand || '',
                            categoryName: product.category?.name || '',
                          });
                          setEditImageFile(null);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-slate-500" colSpan={8}>
                    Aucun produit trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreateModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Créer un nouveau produit</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Marque</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie *</label>
                  <input
                    type="text"
                    value={form.categoryName}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                    required
                    list="categories-list"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <datalist id="categories-list">
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">SKU *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prix d'achat *</label>
                  <input
                    type="number"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Prix de vente *</label>
                  <input
                    type="number"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Stock initial *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image du produit *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-60"
                >
                  {isBusy ? 'Création...' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Product Modal - Editable product information */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Modifier le produit</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="p-6 space-y-6">
              {/* Product Information */}
              <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-slate-900 mb-2">Informations produit</h4>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nom du produit *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Marque</label>
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Catégorie</label>
                    <input
                      list="edit-categories"
                      value={editForm.categoryName}
                      onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Sélectionner ou créer"
                    />
                    <datalist id="edit-categories">
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Image du produit</label>
                  <div className="flex items-center gap-4">
                    {editingProduct.imageUrl && !editImageFile && (
                      <img src={editingProduct.imageUrl} alt={editingProduct.name} className="w-20 h-20 rounded object-cover border-2 border-slate-200" />
                    )}
                    {editImageFile && (
                      <div className="text-xs text-green-600 flex items-center gap-2">
                        <ImageIcon size={16} />
                        Nouvelle image sélectionnée: {editImageFile.name}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Variants and Stock Management */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Variants - Gestion des stocks</h4>
                <p className="text-xs text-slate-500 mb-3">Pour modifier les prix ou SKU, veuillez créer un nouveau variant.</p>
                <div className="space-y-3">
                  {editingProduct.variants?.map((variant) => (
                    <div key={variant.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">SKU</p>
                          <p className="text-sm font-medium text-slate-900">{variant.sku}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Prix de vente</p>
                          <p className="text-sm font-semibold text-slate-900">{formatFcfa(variant.salePrice || 0)}</p>
                        </div>
                        {variant.purchasePrice && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Prix d'achat</p>
                            <p className="text-sm text-slate-700">{formatFcfa(variant.purchasePrice || 0)}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Stock actuel</label>
                          <input
                            type="number"
                            value={stockDrafts[variant.id] || '0'}
                            onChange={(e) => setStockDrafts({ ...stockDrafts, [variant.id]: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            min="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateStock(variant.id)}
                          disabled={isBusy}
                          className="mt-5 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                        >
                          Mettre à jour stock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-60"
                >
                  {isBusy ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirmId(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Supprimer le produit</h3>
                <p className="text-sm text-slate-600">
                  Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible et supprimera également tous les variants associés.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isBusy}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                disabled={isBusy}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {isBusy ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
