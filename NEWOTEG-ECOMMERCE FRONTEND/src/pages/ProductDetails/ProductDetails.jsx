import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, CheckCircle2, Truck, FileText, Package, Plus, Minus, ShieldCheck, Box } from 'lucide-react';
import { formatFCFA } from '../../utils/currency';
import productsService from '../../services/productsService';
import { useCart } from '../../context/CartContext';
import Footer from '../../components/Footer/Footer';
import { getProductRoutePath } from '../../utils/productRoute';
import './ProductDetails.scss';

const ProductDetails = () => {
    const { productRef } = useParams();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('specs');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setLoadError('');
                const liveProducts = await productsService.getProducts();
                if (isMounted) {
                    setProducts(liveProducts);
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError(error?.message || 'Impossible de charger le produit.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const normalizedRef = useMemo(() => {
        if (!productRef) return '';
        return decodeURIComponent(productRef).trim();
    }, [productRef]);

    const product = useMemo(
        () =>
            products.find((p) => {
                const code = String(p.code ?? '').trim();
                const id = String(p.id ?? '').trim();
                return (
                    id === normalizedRef ||
                    code === normalizedRef ||
                    code.replace(/^#/, '') === normalizedRef.replace(/^#/, '')
                );
            }),
        [products, normalizedRef],
    );

    // Related products: same category, exclude current
    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter(p => p.categorySlug === product.categorySlug && p.code !== product.code)
            .slice(0, 4);
    }, [product, products]);

    if (isLoading) {
        return (
            <div className="product-details-page">
                <div className="product-details__not-found">
                    <h2>Chargement du produit...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details-page">
                <div className="product-details__not-found">
                    <Package size={64} strokeWidth={1} />
                    <h2>Produit introuvable</h2>
                    <p>{loadError || `Le produit avec la reference « ${normalizedRef || 'inconnue'} » n'existe pas dans notre catalogue.`}</p>
                    <Link to="/catalogue" className="product-details__back-btn">
                        Retour au catalogue
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const increaseQuantity = () => setQuantity(q => q + 1);
    const decreaseQuantity = () => setQuantity(q => q > 1 ? q - 1 : 1);

    return (
        <div className="product-details-page">
            {/* ── Breadcrumb ──────────────────────────────── */}
            <div className="product-details__breadcrumb-bar">
                <div className="container">
                    <nav className="product-details__breadcrumb">
                        <Link to="/">Home</Link>
                        <ChevronRight size={14} />
                        <Link to="/catalogue">Catalogue</Link>
                        <ChevronRight size={14} />
                        <Link to={`/catalogue?category=${product.categorySlug}`}>{product.categoryName}</Link>
                        <ChevronRight size={14} />
                        <span>{product.model}</span>
                    </nav>
                </div>
            </div>

            {/* ── Main Content ────────────────────────────── */}
            <section className="product-details__main">
                <div className="container">
                    <div className="product-details__layout">
                        {/* ── Left: Image Gallery ────────────────── */}
                        <div className="product-details__image-col">
                            <div className="product-details__image-main">
                                <img src={product.image} alt={product.model} />
                            </div>
                            {/* Mock thumbnails based on Oraimo design */}
                            <div className="product-details__thumbnails">
                                <div className="product-details__thumb product-details__thumb--active">
                                    <img src={product.image} alt="Thumbnail 1" />
                                </div>
                                <div className="product-details__thumb">
                                    <div className="product-details__thumb-placeholder" />
                                </div>
                                <div className="product-details__thumb">
                                    <div className="product-details__thumb-placeholder" />
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Product Info ────────────────── */}
                        <div className="product-details__info-col">
                            <div className="product-details__badge-stock">
                                IN STOCK
                            </div>

                            <h1 className="product-details__name">{product.model}</h1>

                            <div className="product-details__reference">
                                Reference ID : <strong>NTG-{product.code}-TR</strong>
                            </div>

                            <div className="product-details__logistics">
                                <div className="product-details__logistics-item product-details__logistics-item--success">
                                    <CheckCircle2 size={16} />
                                    <span>5,420 units available for immediate dispatch</span>
                                </div>
                                <div className="product-details__logistics-item">
                                    <Truck size={16} />
                                    <span>Warehouse: Douala Logistics Center</span>
                                </div>
                            </div>

                            {/* ── Pricing Block (Oraimo Style) ──────── */}
                            <div className="product-details__pricing-box">
                                <div className="product-details__price-retail">
                                    <span className="product-details__price-label">RETAIL PRICE</span>
                                    <div className="product-details__price-value">
                                        <span className="amount">{formatFCFA(product.retailPrice)}</span>
                                        <span className="unit">/ unit</span>
                                    </div>
                                </div>
                                <div className="product-details__price-divider" />
                                <div className="product-details__price-wholesale">
                                    <span className="product-details__price-label">WHOLESALE PRICE</span>
                                    <div className="product-details__price-value product-details__price-value--primary">
                                        <span className="amount">{formatFCFA(product.wholesalePrice)}</span>
                                        <span className="unit">/ unit</span>
                                    </div>
                                    <span className="product-details__price-min">Minimum order: 100 units</span>
                                </div>
                            </div>

                            {/* ── Actions Add to Cart ───────────────── */}
                            <div className="product-details__actions">
                                <div className="product-details__quantity">
                                    <button onClick={decreaseQuantity} aria-label="Decrease quantity"><Minus size={16} /></button>
                                    <input type="number" value={quantity} readOnly />
                                    <button onClick={increaseQuantity} aria-label="Increase quantity"><Plus size={16} /></button>
                                </div>
                                <button className="product-details__add-btn" onClick={() => addToCart(product, quantity)}>
                                    <ShoppingCart size={18} fill="currentColor" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Tabs & Details Section ────────────────────── */}
            <section className="product-details__tabs-section">
                <div className="container">
                    <div className="product-details__tabs-header">
                        <button
                            className={`product-details__tab ${activeTab === 'specs' ? 'product-details__tab--active' : ''}`}
                            onClick={() => setActiveTab('specs')}
                        >
                            <FileText size={16} />
                            Technical Specs
                        </button>
                        <button
                            className={`product-details__tab ${activeTab === 'sales' ? 'product-details__tab--active' : ''}`}
                            onClick={() => setActiveTab('sales')}
                        >
                            <Box size={16} />
                            Sales Unit
                        </button>
                        <button
                            className={`product-details__tab ${activeTab === 'return' ? 'product-details__tab--active' : ''}`}
                            onClick={() => setActiveTab('return')}
                        >
                            <ShieldCheck size={16} />
                            Return Policy
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="product-details__tab-content">
                        {activeTab === 'specs' && (
                            <div className="product-details__specs-grid">
                                <div className="product-details__specs-group">
                                    <h4>General Parameters</h4>
                                    <div className="product-details__spec-row">
                                        <span>Category</span>
                                        <strong>{product.categoryName}</strong>
                                    </div>
                                    <div className="product-details__spec-row">
                                        <span>Family Code</span>
                                        <strong>{product.familleId}</strong>
                                    </div>
                                    <div className="product-details__spec-row">
                                        <span>Reference</span>
                                        <strong>{product.code}</strong>
                                    </div>
                                </div>
                                <div className="product-details__specs-group">
                                    <h4>Properties</h4>
                                    <div className="product-details__spec-row">
                                        <span>Brand</span>
                                        <strong>{product.marque || 'NEWOTEG Standard'}</strong>
                                    </div>
                                    <div className="product-details__spec-row">
                                        <span>Quality Grade</span>
                                        <strong>Industrial</strong>
                                    </div>
                                </div>
                                <div className="product-details__specs-group">
                                    <h4>Package & Form</h4>
                                    <div className="product-details__spec-row">
                                        <span>Package Type</span>
                                        <strong>Standard Box</strong>
                                    </div>
                                    <div className="product-details__spec-row">
                                        <span>Mounting Type</span>
                                        <strong>N/A</strong>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'sales' && (
                            <div className="product-details__tab-pane">
                                <p>This item is currently sold in individual units and bulk cartons. Wholesale pricing begins at 100+ units. Please contact sales for pallet configurations.</p>
                            </div>
                        )}
                        {activeTab === 'return' && (
                            <div className="product-details__tab-pane">
                                <p>We offer a 1-year warranty on industrial grade components. Replacement only, no repair. Read our full return policy for eligibility conditions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Related Products (Frequently Bought) ──────── */}
            {relatedProducts.length > 0 && (
                <section className="product-details__related">
                    <div className="container">
                        <h2 className="product-details__related-title">Frequently bought together</h2>
                        <div className="product-details__related-grid">
                            {relatedProducts.map(p => (
                                <Link to={getProductRoutePath(p)} key={p.id || p.code} className="product-card-light">
                                    <div className="product-card-light__image">
                                        <img src={p.image} alt={p.model} loading="lazy" />
                                    </div>
                                    <div className="product-card-light__body">
                                        <h3 className="product-card-light__name">{p.model}</h3>
                                        <p className="product-card-light__desc">{p.categoryName}</p>
                                        <div className="product-card-light__bottom">
                                            <span className="product-card-light__price">{formatFCFA(p.retailPrice)}</span>
                                            <button className="product-card-light__add" onClick={(e) => { e.preventDefault(); addToCart(p, 1); }}>+</button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default ProductDetails;
