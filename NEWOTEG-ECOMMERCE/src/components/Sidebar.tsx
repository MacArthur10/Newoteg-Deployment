import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  History,
  ReceiptText, 
  MapPin, 
  Settings, 
  LifeBuoy, 
  LogOut,
  Package2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSessionUser } from '../utils/authSession';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const navItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
  { label: 'Produits', icon: Package2, path: '/products' },
  { label: 'Commandes', icon: Package, path: '/orders' },
  { label: 'Historique Ventes', icon: History, path: '/sales-history' },
  { label: 'Factures', icon: ReceiptText, path: '/invoices' },
  { label: 'Adresses', icon: MapPin, path: '/addresses' },
];

const secondaryItems = [
  { label: 'Paramètres', icon: Settings, path: '/settings' },
  { label: 'Support', icon: LifeBuoy, path: '/support' },
];

export const Sidebar = ({ isOpen, onClose, onLogout }: SidebarProps) => {
  const [user, setUser] = React.useState(getSessionUser());

  React.useEffect(() => {
    const onUserUpdate = () => setUser(getSessionUser());
    window.addEventListener('newoteg-admin-user-updated', onUserUpdate);
    return () => window.removeEventListener('newoteg-admin-user-updated', onUserUpdate);
  }, []);

  const initials = (user?.fullName || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const userBlock = (
    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {initials || 'AD'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{user?.fullName || 'Administrateur'}</p>
        <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@newoteg.com'}</p>
      </div>
      <button onClick={onLogout} className="text-slate-400 hover:text-primary transition-colors" title="Déconnexion">
        <LogOut size={16} />
      </button>
    </div>
  );

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <Package2 size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-primary">NEWOTEG</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
          {secondaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        {userBlock}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 w-64 h-screen z-40 bg-white border-r border-slate-200 flex flex-col lg:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Package2 size={20} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-primary">NEWOTEG</h1>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
                {secondaryItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            <div className="p-4 border-t border-slate-100">
              {userBlock}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-shrink-0 border-r border-slate-200 bg-white flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
};
