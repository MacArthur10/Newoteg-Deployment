import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, RefreshCw, Eye, Trash2, X } from 'lucide-react';
import adminService from '../services/adminService';
import { formatFcfa } from '../utils/currency';

type ReservationItem = {
  quantity: number;
  unitPrice?: number;
  product?: { name?: string; imageUrl?: string };
  variant?: { sku?: string; salePrice?: number };
};

type Reservation = {
  id: string;
  status: string;
  createdAt: string;
  user?: { email?: string; fullName?: string };
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  guestCustomerFullName?: string;
  guestCustomerEmail?: string;
  guestCustomerPhone?: string;
  items: ReservationItem[];
};

export const Orders = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

  const load = async () => {
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      const list = await adminService.getOrders();
      setReservations(list as Reservation[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger les reservations.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter((r) => {
      const customer = (
        r.customer?.firstName || r.customer?.lastName || r.customer?.email || r.customer?.phone ||
        r.guestCustomerFullName || r.guestCustomerEmail || r.guestCustomerPhone ||
        r.user?.email || r.user?.fullName || ''
      ).toLowerCase();
      return r.id.toLowerCase().includes(q) || customer.includes(q);
    });
  }, [reservations, query]);

  const onCancel = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      await adminService.cancelReservationAsAdmin(id);
      setSuccess('Réservation annulée avec succès.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec annulation reservation.');
      setIsBusy(false);
    }
  };

  const onConvert = async (id: string) => {
    if (!confirm('Convertir cette réservation en vente ?')) return;
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      await adminService.convertReservationToSale(id, 'CASH');
      setSuccess('Réservation convertie en vente avec succès.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec conversion en vente.');
      setIsBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette réservation ? Cette action est irréversible.')) return;
    setIsBusy(true);
    setError('');
    setSuccess('');
    try {
      await adminService.deleteReservation(id);
      setSuccess('Réservation supprimée avec succès.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Echec suppression reservation.');
      setIsBusy(false);
    }
  };

  const calculateTotal = (items: ReservationItem[]) => {
    return items.reduce((sum, item) => {
      const price = item.unitPrice || item.variant?.salePrice || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Reservations</h2>
          <p className="text-slate-500 text-sm">Supervision globale des reservations Ecommerce</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Rafraichir
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par ID ou client..."
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{reservation.id}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {reservation.customer?.firstName && reservation.customer?.lastName
                      ? `${reservation.customer.firstName} ${reservation.customer.lastName}`
                      : reservation.guestCustomerFullName || reservation.user?.fullName || reservation.customer?.email || reservation.user?.email || 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(reservation.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="px-6 py-4 text-slate-700">{reservation.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{formatFcfa(calculateTotal(reservation.items))}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      reservation.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingReservation(reservation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                      {reservation.status === 'ACTIVE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onConvert(reservation.id)}
                            disabled={isBusy}
                            className="rounded-md border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            Convertir
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancel(reservation.id)}
                            disabled={isBusy}
                            className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(reservation.id)}
                        disabled={isBusy}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-60"
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
                  <td className="px-6 py-4 text-slate-500" colSpan={7}>
                    Aucune reservation trouvee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {viewingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingReservation(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Détails de la Réservation</h3>
              <button
                type="button"
                onClick={() => setViewingReservation(null)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Informations Client</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Nom complet</p>
                    <p className="font-medium text-slate-900">
                      {viewingReservation.customer?.firstName && viewingReservation.customer?.lastName
                        ? `${viewingReservation.customer.firstName} ${viewingReservation.customer.lastName}`
                        : viewingReservation.guestCustomerFullName || viewingReservation.user?.fullName || 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Email</p>
                    <p className="font-medium text-slate-900">
                      {viewingReservation.customer?.email || viewingReservation.guestCustomerEmail || viewingReservation.user?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Téléphone</p>
                    <p className="font-medium text-slate-900">
                      {viewingReservation.customer?.phone || viewingReservation.guestCustomerPhone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">ID Réservation</p>
                    <p className="font-medium text-primary">{viewingReservation.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Date de création</p>
                    <p className="font-medium text-slate-900">
                      {new Date(viewingReservation.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Statut</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      viewingReservation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      viewingReservation.status === 'CANCELED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {viewingReservation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Articles Réservés</h4>
                <div className="space-y-3">
                  {viewingReservation.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                      {item.product?.imageUrl && (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.product?.name || 'Produit'}</p>
                        <p className="text-sm text-slate-500">SKU: {item.variant?.sku || 'N/A'}</p>
                        <p className="text-sm text-slate-600">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatFcfa(item.unitPrice || item.variant?.salePrice || 0)}</p>
                        <p className="text-sm text-slate-500">
                          Total: {formatFcfa((item.unitPrice || item.variant?.salePrice || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatFcfa(calculateTotal(viewingReservation.items))}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {viewingReservation.status === 'ACTIVE' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      onConvert(viewingReservation.id);
                      setViewingReservation(null);
                    }}
                    disabled={isBusy}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Convertir en vente
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onCancel(viewingReservation.id);
                      setViewingReservation(null);
                    }}
                    disabled={isBusy}
                    className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-60"
                  >
                    Annuler la réservation
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
