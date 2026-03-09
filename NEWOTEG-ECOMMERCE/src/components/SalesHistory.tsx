import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Search, Eye, X } from 'lucide-react';
import adminService from '../services/adminService';
import { formatFcfa } from '../utils/currency';

type SaleItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { name?: string; imageUrl?: string } | null;
  variant?: { sku?: string } | null;
};

type Sale = {
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
};

export const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [query, setQuery] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const load = async () => {
    setIsBusy(true);
    setError('');
    try {
      const data = await adminService.getSalesHistory();
      setSales(data as Sale[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de charger l\'historique des ventes.');
    } finally {
      setIsBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;

    return sales.filter((sale) => {
      const customerName = `${sale.customer?.firstName || ''} ${sale.customer?.lastName || ''}`.trim().toLowerCase();
      const customerEmail = (sale.customer?.email || '').toLowerCase();
      return (
        sale.saleNumber.toLowerCase().includes(q) ||
        sale.id.toLowerCase().includes(q) ||
        customerName.includes(q) ||
        customerEmail.includes(q)
      );
    });
  }, [sales, query]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Historique des Ventes</h2>
          <p className="text-slate-500 text-sm">Consultez toutes les ventes validées et leurs détails.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} />
          Rafraîchir
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par numéro de vente, ID ou client..."
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
                <th className="px-6 py-4">N° Vente</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Articles</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sale) => {
                const customerName = sale.customer?.firstName && sale.customer?.lastName
                  ? `${sale.customer.firstName} ${sale.customer.lastName}`
                  : sale.customer?.email || 'Client inconnu';

                return (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-primary">{sale.saleNumber}</td>
                    <td className="px-6 py-4 text-slate-700">{customerName}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(sale.saleDate || sale.createdAt).toLocaleString('fr-FR')}</td>
                    <td className="px-6 py-4 text-slate-700">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatFcfa(sale.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        sale.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : sale.paymentStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-slate-500" colSpan={7}>
                    Aucune vente trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedSale(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Détails de la Vente</h3>
              <button type="button" onClick={() => setSelectedSale(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-lg p-4">
                <div>
                  <p className="text-slate-500 mb-1">Numéro</p>
                  <p className="font-medium text-slate-900">{selectedSale.saleNumber}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Date</p>
                  <p className="font-medium text-slate-900">{new Date(selectedSale.saleDate || selectedSale.createdAt).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Méthode de paiement</p>
                  <p className="font-medium text-slate-900">{selectedSale.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Statut</p>
                  <p className="font-medium text-slate-900">{selectedSale.paymentStatus}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Articles vendus</h4>
                <div className="space-y-3">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center rounded-lg border border-slate-200 p-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.product?.name || 'Produit supprimé'}</p>
                        <p className="text-xs text-slate-500">SKU: {item.variant?.sku || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Qté: {item.quantity}</p>
                        <p className="font-semibold text-slate-900">{formatFcfa(item.totalPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-primary">{formatFcfa(selectedSale.totalAmount)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
