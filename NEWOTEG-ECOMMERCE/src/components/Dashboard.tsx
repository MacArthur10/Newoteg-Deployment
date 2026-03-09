import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Save, ShieldAlert, ShoppingBag, X } from 'lucide-react';
import adminService from '../services/adminService';
import { formatFcfa } from '../utils/currency';

type ProductVariant = {
  id: string;
  sku: string;
  stock: number;
  salePrice?: number;
};

type Product = {
  id: string;
  name: string;
  categoryId?: string;
  description?: string;
  brand?: string;
  imageUrl?: string;
  category?: { name?: string };
  variants?: ProductVariant[];
};

type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

type Reservation = {
  id: string;
  status: string;
  createdAt: string;
  user?: { email?: string; fullName?: string };
  customer?: { email?: string; firstName?: string; lastName?: string; phone?: string };
  items: Array<{ quantity: number; product?: { name?: string }; variant?: { sku?: string } }>;
};

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminService.getDashboardData();
      setProducts(data.products);
      setReservations(data.reservations as Reservation[]);
      const liveCategories = await adminService.getAdminCategories();
      setCategories(liveCategories);
      const drafts: Record<string, string> = {};
      data.products.forEach((product: Product) => {
        (product.variants || []).forEach((variant) => {
          drafts[variant.id] = String(variant.stock ?? 0);
        });
      });
      setStockDrafts(drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les donnees admin.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeReservations = useMemo(
    () => reservations.filter((reservation) => reservation.status === 'ACTIVE'),
    [reservations],
  );

  const totalStock = useMemo(
    () =>
      products.reduce(
        (sum, product) =>
          sum + (product.variants || []).reduce((vsum, variant) => vsum + (variant.stock || 0), 0),
        0,
      ),
    [products],
  );



  const onUpdateStock = async (variantId: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await adminService.updateVariantStock(variantId, Number(stockDrafts[variantId] || 0));
      setSuccess('Stock mis a jour.');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec de mise a jour du stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancelReservation = async (reservationId: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await adminService.cancelReservationAsAdmin(reservationId);
      setSuccess('Reservation annulee.');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec annulation reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreateCategory = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (!categoryImageFile) {
        throw new Error('Veuillez selectionner une image categorie a envoyer sur Cloudinary.');
      }

      const uploaded = await adminService.uploadCategoryImage(categoryImageFile);
      const categoryImageUrl = uploaded.imageUrl;

      await adminService.createCategory({
        name: categoryForm.name,
        description: categoryForm.description || undefined,
        imageUrl: categoryImageUrl,
      });
      setSuccess('Categorie creee avec succes.');
      setCategoryForm({ name: '', description: '' });
      setCategoryImageFile(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec creation categorie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteCategory = async (categoryId: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await adminService.deleteCategory(categoryId);
      setSuccess('Categorie supprimee.');
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec suppression categorie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Produits</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{products.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Stock Total</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{totalStock}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Reservations Actives</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{activeReservations.length}</p>
        </div>
      </section>

      <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-xs sm:text-sm text-slate-600">Vue admin operationnelle: gestion categories, gestion stock, gestion reservations.</div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading || isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap"
        >
          <RefreshCw size={16} />
          Rafraichir
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 inline-flex items-center gap-2">
          <ShieldAlert size={16} />
          {error}
        </div>
      )}

      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3">Stock des variantes</h3>
        <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[420px] overflow-auto pr-1">
          {products.map((product) =>
            (product.variants || []).map((variant) => (
              <div key={variant.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover border border-slate-200" />
                  ) : (
                    <div className="h-10 w-10 rounded border border-dashed border-slate-300" />
                  )}
                  <div className="text-sm font-semibold text-slate-900">{product.name}</div>
                </div>
                <div className="text-xs text-slate-500">SKU: {variant.sku} · Categorie: {product.category?.name || 'N/A'}</div>
                <div className="mt-1 text-xs font-medium text-slate-700">
                  Prix vente: {formatFcfa(variant.salePrice ?? 0)} · Stock actuel: {variant.stock ?? 0}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    className="flex-1 sm:flex-none sm:w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={stockDrafts[variant.id] ?? '0'}
                    onChange={(e) => setStockDrafts((prev) => ({ ...prev, [variant.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateStock(variant.id)}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none rounded-lg border border-slate-300 px-3 py-2 text-xs sm:text-sm font-semibold hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap"
                  >
                    Mettre a jour
                  </button>
                </div>
              </div>
            )),
          )}
          {products.length === 0 && <p className="text-sm text-slate-500">Aucun produit disponible.</p>}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <form onSubmit={onCreateCategory} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 space-y-3">
          <h3 className="text-base md:text-lg font-bold text-slate-900">Gestion des categories</h3>
          <label className="block text-sm font-semibold text-slate-700">
            Nom categorie
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Nom categorie"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Description
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Description"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </label>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Image categorie (Cloudinary)</label>
            <input
              ref={categoryImageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => categoryImageInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Choisir une image categorie
            </button>
            {categoryImageFile && <p className="mt-1 text-xs text-slate-500">Fichier: {categoryImageFile.name}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Save size={16} />
            Ajouter categorie
          </button>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3">Liste categories</h3>
          <div className="space-y-2 max-h-[300px] md:max-h-[260px] overflow-auto">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} className="h-8 w-8 rounded object-cover border border-slate-200" />
                    ) : (
                      <div className="h-8 w-8 rounded border border-dashed border-slate-300" />
                    )}
                    <p className="text-sm font-semibold text-slate-900">{category.name}</p>
                  </div>
                  <p className="text-xs text-slate-500">{category.description || 'Sans description'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(category.id)}
                  disabled={isSubmitting}
                  className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  Supprimer
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-slate-500">Aucune categorie.</p>}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 overflow-hidden">
        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 inline-flex items-center gap-2">
          <ShoppingBag size={18} />
          Reservations (global)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-2 sm:pr-4">ID</th>
                <th className="py-2 pr-2 sm:pr-4">Client</th>
                <th className="py-2 pr-2 sm:pr-4">Articles</th>
                <th className="py-2 pr-2 sm:pr-4">Statut</th>
                <th className="py-2 pr-2 sm:pr-4 hidden sm:table-cell">Date</th>
                <th className="py-2 pr-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => {
                const clientName = reservation.customer?.firstName && reservation.customer?.lastName
                  ? `${reservation.customer.firstName} ${reservation.customer.lastName}`
                  : reservation.user?.fullName || reservation.customer?.email || reservation.user?.email || 'Client inconnu';
                
                return (
                  <tr key={reservation.id} className="border-b border-slate-100">
                    <td className="py-2 pr-2 sm:pr-4 font-medium text-slate-900 truncate">{reservation.id.slice(0, 6)}...</td>
                    <td className="py-2 pr-2 sm:pr-4 truncate text-xs">{clientName}</td>
                    <td className="py-2 pr-2 sm:pr-4">{reservation.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="py-2 pr-2 sm:pr-4">{reservation.status}</td>
                    <td className="py-2 pr-2 sm:pr-4 hidden sm:table-cell">{new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedReservation(reservation)}
                        className="rounded-md border border-blue-300 px-1 sm:px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Voir
                      </button>
                      {reservation.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => onCancelReservation(reservation.id)}
                          disabled={isSubmitting}
                          className="rounded-md border border-red-300 px-1 sm:px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-slate-500">
                    Aucune reservation disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isLoading && <p className="text-sm text-slate-500">Chargement en cours...</p>}

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedReservation(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Détails de la réservation</h3>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Reservation Info */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1">ID Réservation</p>
                  <p className="text-sm font-medium text-slate-900">{selectedReservation.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Statut</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    selectedReservation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedReservation.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date de création</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(selectedReservation.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Informations client</h4>
                <div className="space-y-2">
                  {selectedReservation.customer && (
                    <>
                      {(selectedReservation.customer.firstName || selectedReservation.customer.lastName) && (
                        <div>
                          <p className="text-xs text-slate-500">Nom complet</p>
                          <p className="text-sm font-medium text-slate-900">
                            {[selectedReservation.customer.firstName, selectedReservation.customer.lastName].filter(Boolean).join(' ')}
                          </p>
                        </div>
                      )}
                      {selectedReservation.customer.email && (
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-sm font-medium text-slate-900">{selectedReservation.customer.email}</p>
                        </div>
                      )}
                      {selectedReservation.customer.phone && (
                        <div>
                          <p className="text-xs text-slate-500">Téléphone</p>
                          <p className="text-sm font-medium text-slate-900">{selectedReservation.customer.phone}</p>
                        </div>
                      )}
                    </>
                  )}
                  {selectedReservation.user && !selectedReservation.customer && (
                    <>
                      {selectedReservation.user.fullName && (
                        <div>
                          <p className="text-xs text-slate-500">Nom</p>
                          <p className="text-sm font-medium text-slate-900">{selectedReservation.user.fullName}</p>
                        </div>
                      )}
                      {selectedReservation.user.email && (
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-sm font-medium text-slate-900">{selectedReservation.user.email}</p>
                        </div>
                      )}
                    </>
                  )}
                  {!selectedReservation.customer && !selectedReservation.user && (
                    <p className="text-sm text-slate-500">Aucune information client disponible</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Articles réservés</h4>
                <div className="space-y-2">
                  {selectedReservation.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.product?.name || 'Produit inconnu'}</p>
                        {item.variant?.sku && (
                          <p className="text-xs text-slate-500">SKU: {item.variant.sku}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">Qté: {item.quantity}</p>
                    </div>
                  ))}
                  {selectedReservation.items.length === 0 && (
                    <p className="text-sm text-slate-500">Aucun article</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedReservation.status === 'ACTIVE' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onCancelReservation(selectedReservation.id);
                      setSelectedReservation(null);
                    }}
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    Annuler cette réservation
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
