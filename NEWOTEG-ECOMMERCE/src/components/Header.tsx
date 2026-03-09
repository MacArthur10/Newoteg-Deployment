import React from 'react';
import { Search, Bell, Plus, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
}

export const Header = ({ onMenuClick, onLogout }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
      {/* Mobile menu button */}
      <button 
        onClick={onMenuClick}
        className="block lg:hidden p-2 text-slate-400 hover:text-primary transition-colors mr-2"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-xs md:text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-slate-400 hover:text-primary relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-sm shadow-primary/20">
          <Plus size={18} />
          <span>Nouvelle Commande</span>
        </button>
        <button className="block sm:hidden p-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all">
          <Plus size={18} />
        </button>
        <button 
          onClick={onLogout}
          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
          title="Déconnexion"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
