import { useState } from 'react';
import { Trash2, Plus, Minus, CheckCircle2, Circle, Lock, ShieldCheck, ShoppingCart } from 'lucide-react';
import { formatFCFA } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import reservationsService from '../../services/reservationsService';
import './Checkout.scss';

const Checkout = () => {
    const { cartItems: cart, updateQuantity, removeFromCart: remove, clearCart } = useCart();
    const [shipping, setShipping] = useState('standard');
    const [payment, setPayment] = useState('om');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [customerForm, setCustomerForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        paymentNumber: '',
    });

    const subtotal = cart.reduce((acc, item) => acc + item.retailPrice * item.quantity, 0);
    const shippingCost = shipping === 'standard' ? 5000 : 0;
    const total = subtotal + shippingCost;

    const handlePlaceOrder = async () => {
        if (cart.length === 0) {
            setSubmitError('Votre panier est vide.');
            return;
        }

        if (!customerForm.fullName.trim() || !customerForm.email.trim() || !customerForm.phone.trim()) {
            setSubmitError('Veuillez remplir votre nom complet, email et numero de telephone.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            await reservationsService.createReservation(cart, {
                fullName: customerForm.fullName.trim(),
                email: customerForm.email.trim(),
                phone: customerForm.phone.trim(),
                address: customerForm.address.trim() || undefined,
            });

            clearCart();
            setSubmitSuccess('Reservation envoyee avec succes. Notre equipe vous contactera tres bientot.');
        } catch (error) {
            setSubmitError(error?.message || 'Impossible de creer la reservation. Verifiez vos informations et reessayez.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-page">
            {/* Steps Header */}
            <div className="checkout__steps-container">
                <div className="container">
                    <div className="checkout__steps">
                        <div className="checkout__step checkout__step--active">
                            <span className="checkout__step-num">1</span>
                            <span className="checkout__step-text">Cart</span>
                        </div>
                        <div className="checkout__step-line checkout__step-line--active" />
                        <div className="checkout__step checkout__step--active">
                            <span className="checkout__step-num">2</span>
                            <span className="checkout__step-text">Shipping</span>
                        </div>
                        <div className="checkout__step-line" />
                        <div className="checkout__step checkout__step--pending">
                            <span className="checkout__step-num">3</span>
                            <span className="checkout__step-text">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="checkout__main">
                <div className="container">
                    <div className="checkout__layout">
                        {/* 左侧区域 : Cart & Shipping */}
                        <div className="checkout__left">

                            {/* Shopping Cart Section */}
                            <section className="checkout__section">
                                <h2 className="checkout__section-title">Your Shopping Cart</h2>
                                {cart.length === 0 ? (
                                    <div className="checkout__empty-state" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#52525B' }}>
                                        <ShoppingCart size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', color: '#A1A1AA' }} />
                                        <h3 style={{ marginBottom: '0.5rem', color: '#18181B' }}>Your cart is empty</h3>
                                        <p style={{ marginBottom: '1.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
                                        <Link to="/catalogue" className="checkout__place-order-btn" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}>
                                            Continue Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="checkout__cart-list">
                                        {cart.map(item => (
                                            <div key={item.code} className="checkout__cart-item">
                                                <div className="checkout__cart-image">
                                                    <img src={item.image} alt={item.model} />
                                                </div>
                                                <div className="checkout__cart-details">
                                                    <h3>{item.model}</h3>
                                                    <p>{item.marque || 'NEWOTEG Standard'}</p>
                                                    <div className="checkout__cart-price">{formatFCFA(item.retailPrice)}</div>
                                                </div>
                                                <div className="checkout__cart-actions">
                                                    <div className="checkout__quantity">
                                                        <button onClick={() => updateQuantity(item.code, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                                                        <input type="text" value={item.quantity} readOnly />
                                                        <button onClick={() => updateQuantity(item.code, item.quantity + 1)}><Plus size={14} /></button>
                                                    </div>
                                                    <button className="checkout__cart-remove" onClick={() => remove(item.code)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Shipping Method Section */}
                            <section className="checkout__section">
                                <h2 className="checkout__section-title">Shipping Method</h2>
                                <div className="checkout__shipping-options">
                                    <div
                                        className={`checkout__option-box ${shipping === 'standard' ? 'checkout__option-box--active' : ''}`}
                                        onClick={() => setShipping('standard')}
                                    >
                                        <div className="checkout__option-header">
                                            <div>
                                                <h4>Standard Delivery</h4>
                                                <p>2-3 Business Days</p>
                                            </div>
                                            {shipping === 'standard' ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-muted" />}
                                        </div>
                                        <div className="checkout__option-price text-primary">$5,000</div>
                                    </div>

                                    <div
                                        className={`checkout__option-box ${shipping === 'pickup' ? 'checkout__option-box--active' : ''}`}
                                        onClick={() => setShipping('pickup')}
                                    >
                                        <div className="checkout__option-header">
                                            <div>
                                                <h4>Pick up at Office</h4>
                                                <p>Yaoundé, Bastos Street</p>
                                            </div>
                                            {shipping === 'pickup' ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-muted" />}
                                        </div>
                                        <div className="checkout__option-price text-primary">Free</div>
                                    </div>
                                </div>

                                <div className="checkout__shipping-form">
                                    <div className="checkout__form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={customerForm.fullName}
                                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                        />
                                    </div>
                                    <div className="checkout__form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={customerForm.email}
                                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                    <div className="checkout__form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+237 6xx xxx xxx"
                                            value={customerForm.phone}
                                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="checkout__form-group checkout__form-group--full">
                                        <label>Delivery Address</label>
                                        <input
                                            type="text"
                                            placeholder="Street name, Neighborhood, City"
                                            value={customerForm.address}
                                            onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* 右侧区域 : Payment & Order Summary */}
                        <div className="checkout__right">

                            {/* Payment Method Section */}
                            <section className="checkout__section">
                                <h2 className="checkout__section-title">Payment Method</h2>
                                <div className="checkout__payment-options">
                                    <div
                                        className={`checkout__option-box ${payment === 'om' ? 'checkout__option-box--active' : ''}`}
                                        onClick={() => setPayment('om')}
                                    >
                                        <div className="checkout__payment-logo checkout__payment-logo--om">OM</div>
                                        <div className="checkout__payment-info">
                                            <h4>Orange Money</h4>
                                            <p>Direct mobile payment</p>
                                        </div>
                                        <div className="checkout__payment-radio">
                                            {payment === 'om' ? <span className="radio-inner" /> : null}
                                        </div>
                                    </div>

                                    <div
                                        className={`checkout__option-box ${payment === 'momo' ? 'checkout__option-box--active' : ''}`}
                                        onClick={() => setPayment('momo')}
                                    >
                                        <div className="checkout__payment-logo checkout__payment-logo--momo">MTN</div>
                                        <div className="checkout__payment-info">
                                            <h4>MTN Mobile Money</h4>
                                            <p>Direct mobile payment</p>
                                        </div>
                                        <div className="checkout__payment-radio">
                                            {payment === 'momo' ? <span className="radio-inner" /> : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="checkout__form-group" style={{ marginTop: '1.5rem' }}>
                                    <label>Payment Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+237 6xx xxx xxx"
                                        value={customerForm.paymentNumber}
                                        onChange={(e) => setCustomerForm((prev) => ({ ...prev, paymentNumber: e.target.value }))}
                                    />
                                </div>
                                <div className="checkout__secure-note">
                                    <Lock size={12} />
                                    Your transaction is secured by SSL encryption
                                </div>
                            </section>

                            {/* Order Summary Section */}
                            <section className="checkout__section checkout__summary">
                                <h2 className="checkout__section-title">Order Summary</h2>
                                <div className="checkout__summary-lines">
                                    <div className="checkout__summary-line">
                                        <span>Subtotal</span>
                                        <strong>{formatFCFA(subtotal)}</strong>
                                    </div>
                                    <div className="checkout__summary-line">
                                        <span>Shipping</span>
                                        <strong>{formatFCFA(shippingCost)}</strong>
                                    </div>
                                    <div className="checkout__summary-line">
                                        <span>Taxes</span>
                                        <strong>$0</strong>
                                    </div>
                                </div>
                                <div className="checkout__summary-total">
                                    <div className="checkout__total-label">
                                        <span className="total">Total</span>
                                    </div>
                                    <div className="checkout__total-value">
                                        <span className="amount">{formatFCFA(total)}</span>
                                        <span className="tax-incl">ALL PRICES INCLUSIVE</span>
                                    </div>
                                </div>
                                {submitError && (
                                    <p style={{ color: '#B91C1C', marginTop: '0.75rem', fontSize: '0.9rem' }}>{submitError}</p>
                                )}
                                {submitSuccess && (
                                    <p style={{ color: '#047857', marginTop: '0.75rem', fontSize: '0.9rem' }}>{submitSuccess}</p>
                                )}
                                <button
                                    className="checkout__place-order-btn"
                                    onClick={handlePlaceOrder}
                                    disabled={isSubmitting || cart.length === 0}
                                >
                                    Place Order
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </button>
                                <div className="checkout__summary-trusted">
                                    <span style={{ color: '#F97316', fontStyle: 'italic', fontWeight: 'bold' }}>Orange <span style={{ color: '#737373' }}>Money</span></span>
                                    <span style={{ color: '#D4D4D4', fontWeight: 'bold' }}>MTN <span style={{ color: '#737373' }}>MoMo</span></span>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Checkout footer from mockup */}
            <div className="checkout__footer">
                <div className="container">
                    <div className="checkout__footer-inner">
                        <div className="checkout__footer-secure">
                            <ShieldCheck size={18} fill="#2A2FCE" color="white" />
                            100% Secure Checkout
                        </div>
                        <div className="checkout__footer-copy">
                            &copy; 2024 NEWOTEG SARL. All rights reserved.
                        </div>
                        <div className="checkout__footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add ShieldCheck to lucide imports (already done above, wait I need to import ShieldCheck in the start)
export default Checkout;
