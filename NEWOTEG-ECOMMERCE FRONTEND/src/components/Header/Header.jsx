import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, User, Menu, Heart, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import SearchBar from '../SearchBar/SearchBar';
import './Header.scss';

const Header = () => {
    const { cartCount } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className={`header ${isScrolled ? 'header--sticky' : ''}`}>
            <div className="header__container container">
                <div className="header__logo">
                    <Link to="/" className="header__logo-link">
                        <span className="header__logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                        </span>
                        <span className="header__logo-text">NEWOTEG</span>
                    </Link>
                </div>

                <nav className="header__nav">
                    <ul className="header__nav-list">
                        <li className="header__nav-item">
                            <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>HOME</NavLink>
                        </li>
                        <li className="header__nav-item">
                            <NavLink to="/catalogue" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>CATALOGUE</NavLink>
                        </li>
                        <li className="header__nav-item">
                            <NavLink to="/about" className={({ isActive }) => `header__nav-link ${isActive ? 'header__nav-link--active' : ''}`}>A PROPOS</NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="header__actions">
                    <SearchBar />
                    <button className="header__action-btn" aria-label="Favorites">
                        <Heart size={20} />
                    </button>
                    <button className="header__action-btn" aria-label="Profile">
                        <User size={20} />
                    </button>
                    <Link to="/checkout" className="header__action-btn header__action-btn--cart" aria-label="Cart">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
                    </Link>
                    <button
                        className="header__action-btn header__menu-mobile"
                        aria-label="Menu"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {mobileMenuOpen && <button className="header__mobile-overlay" onClick={closeMobileMenu} aria-label="Close menu" />}

            <aside className={`header__mobile-drawer ${mobileMenuOpen ? 'header__mobile-drawer--open' : ''}`}>
                <div className="header__mobile-top">
                    <span className="header__mobile-title">Menu</span>
                    <button className="header__action-btn" aria-label="Close menu" onClick={closeMobileMenu}>
                        <X size={20} />
                    </button>
                </div>
                <nav className="header__mobile-nav">
                    <NavLink to="/" className="header__mobile-link" onClick={closeMobileMenu}>HOME</NavLink>
                    <NavLink to="/catalogue" className="header__mobile-link" onClick={closeMobileMenu}>CATALOGUE</NavLink>
                    <NavLink to="/about" className="header__mobile-link" onClick={closeMobileMenu}>A PROPOS</NavLink>
                    <NavLink to="/checkout" className="header__mobile-link" onClick={closeMobileMenu}>PANIER ({cartCount})</NavLink>
                </nav>
            </aside>
        </header>
    );
};

export default Header;
