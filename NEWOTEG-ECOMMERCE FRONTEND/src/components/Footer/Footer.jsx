import { Link } from 'react-router-dom';
import './Footer.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__container container">
                <div className="footer__grid">
                    {/* Brand Column */}
                    <div className="footer__col footer__brand">
                        <div className="footer__logo">
                            <span className="footer__logo-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                            </span>
                            NEWOTEG SARL
                        </div>
                        <p className="footer__description">
                            Your leading partner for premium industrial electronics and semi-conductors across North Africa.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="footer__col">
                        <h3 className="footer__title">Products</h3>
                        <ul className="footer__list">
                            <li><Link to="/catalogue?category=microcontrollers" className="footer__link">Microcontrollers</Link></li>
                            <li><Link to="/catalogue?category=transistors" className="footer__link">Transistors</Link></li>
                            <li><Link to="/catalogue?category=sensors" className="footer__link">Sensors</Link></li>
                            <li><Link to="/catalogue?category=capacitors" className="footer__link">Capacitors</Link></li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h3 className="footer__title">Company</h3>
                        <ul className="footer__list">
                            <li><Link to="/about" className="footer__link">About Us</Link></li>
                            <li><Link to="/shipping" className="footer__link">Shipping Info</Link></li>
                            <li><Link to="/terms" className="footer__link">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="footer__link">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="footer__col footer__newsletter">
                        <h3 className="footer__title">Newsletter</h3>
                        <form className="footer__form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Email address"
                                className="footer__input"
                                required
                            />
                            <button type="submit" className="footer__submit">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p className="footer__copyright">
                        &copy; {new Date().getFullYear()} NEWOTEG SARL. All rights reserved. Industrial Grade Components.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
