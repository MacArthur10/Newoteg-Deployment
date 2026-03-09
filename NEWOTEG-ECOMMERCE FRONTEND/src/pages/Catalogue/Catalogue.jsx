import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import { formatFCFA } from '../../utils/currency';
import productsService from '../../services/productsService';
import { useCart } from '../../context/CartContext';
import Footer from '../../components/Footer/Footer';
import { getProductRoutePath } from '../../utils/productRoute';
import './Catalogue.scss';

const ITEMS_PER_PAGE = 24;

const Catalogue = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    // ── State ──────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('sub') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name-asc');
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 500000]);

    const categoriesWithProducts = useMemo(() => {
        return categories.filter((cat) => {
            if ((cat.count || 0) > 0) return true;
            return products.some((p) => p.categorySlug === cat.slug);
        });
    }, [categories, products]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setLoadError('');
                const [liveProducts, liveCategories] = await Promise.all([
                    productsService.getProducts(),
                    productsService.getCategories(),
                ]);
                if (!isMounted) return;
                setProducts(liveProducts);
                setCategories(liveCategories);
            } catch (error) {
                if (!isMounted) return;
                setLoadError(error?.message || 'Impossible de charger le catalogue.');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Sync URL params
    useEffect(() => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubCategory) params.sub = selectedSubCategory;
        if (sortBy !== 'name-asc') params.sort = sortBy;
        if (currentPage > 1) params.page = currentPage;
        setSearchParams(params, { replace: true });
    }, [searchQuery, selectedCategory, selectedSubCategory, sortBy, currentPage, setSearchParams]);

    // ── Filtering & Sorting ────────────────────────────────
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.model.toLowerCase().includes(q) ||
                p.code.includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            );
        }

        // Category filter
        if (selectedSubCategory) {
            result = result.filter(p => p.categorySlug === selectedSubCategory);
        } else if (selectedCategory) {
            const cat = categoriesWithProducts.find(c => c.slug === selectedCategory);
            if (cat) {
                const subSlugs = cat.subcategories.map(s => s.slug);
                result = result.filter(p => p.categorySlug === cat.slug || subSlugs.includes(p.categorySlug));
            } else {
                result = result.filter(p => p.categorySlug === selectedCategory);
            }
        }

        // Price filter
        result = result.filter(p =>
            p.retailPrice >= priceRange[0] && p.retailPrice <= priceRange[1]
        );

        // Sorting
        switch (sortBy) {
            case 'name-asc':
                result.sort((a, b) => a.model.localeCompare(b.model));
                break;
            case 'name-desc':
                result.sort((a, b) => b.model.localeCompare(a.model));
                break;
            case 'price-asc':
                result.sort((a, b) => a.retailPrice - b.retailPrice);
                break;
            case 'price-desc':
                result.sort((a, b) => b.retailPrice - a.retailPrice);
                break;
            default:
                break;
        }

        return result;
    }, [products, categoriesWithProducts, searchQuery, selectedCategory, selectedSubCategory, sortBy, priceRange]);

    // ── Pagination ─────────────────────────────────────────
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedSubCategory, sortBy, priceRange]);

    // ── Handlers ───────────────────────────────────────────
    const toggleCategory = (slug) => {
        setExpandedCategories(prev => ({ ...prev, [slug]: !prev[slug] }));
    };

    const handleCategorySelect = (catSlug) => {
        if (selectedCategory === catSlug) {
            setSelectedCategory('');
            setSelectedSubCategory('');
        } else {
            setSelectedCategory(catSlug);
            setSelectedSubCategory('');
            setExpandedCategories(prev => ({ ...prev, [catSlug]: true }));
        }
        setSidebarOpen(false);
    };

    const handleSubCategorySelect = (subSlug, parentSlug) => {
        if (selectedSubCategory === subSlug) {
            setSelectedSubCategory('');
        } else {
            setSelectedCategory(parentSlug);
            setSelectedSubCategory(subSlug);
        }
        setSidebarOpen(false);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSortBy('name-asc');
        setPriceRange([0, 500000]);
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedSubCategory || sortBy !== 'name-asc';

    // ── Pagination Controls ────────────────────────────────
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // ── Active Category Name ───────────────────────────────
    const activeCategoryName = useMemo(() => {
        if (selectedSubCategory) {
            for (const cat of categoriesWithProducts) {
                const sub = cat.subcategories.find(s => s.slug === selectedSubCategory);
                if (sub) return sub.name;
            }
        }
        if (selectedCategory) {
            const cat = categoriesWithProducts.find(c => c.slug === selectedCategory);
            if (cat) return cat.name;
        }
        return null;
    }, [categoriesWithProducts, selectedCategory, selectedSubCategory]);

    return (
        <div className="catalogue-page">
            {/* ── Page Header ───────────────────────────────── */}
            <div className="catalogue-page__header">
                <div className="container">
                    <div className="catalogue-page__breadcrumb">
                        <Link to="/">Accueil</Link>
                        <span>/</span>
                        <span className="catalogue-page__breadcrumb-active">Catalogue</span>
                        {activeCategoryName && (
                            <>
                                <span>/</span>
                                <span className="catalogue-page__breadcrumb-active">{activeCategoryName}</span>
                            </>
                        )}
                    </div>
                    <div className="catalogue-page__title-row">
                        <div>
                            <h1 className="catalogue-page__title">
                                {activeCategoryName || 'Catalogue'}
                            </h1>
                            <p className="catalogue-page__count">
                                {filteredProducts.length.toLocaleString('fr-FR')} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            className="catalogue-page__filter-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <SlidersHorizontal size={18} />
                            Filtres
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {sidebarOpen && <button className="catalogue-page__overlay" onClick={() => setSidebarOpen(false)} aria-label="Close filters" />}
                <div className="catalogue-page__layout">
                    {/* ── Sidebar ───────────────────────────────── */}
                    <aside className={`catalogue-sidebar ${sidebarOpen ? 'catalogue-sidebar--open' : ''}`}>
                        <div className="catalogue-sidebar__header">
                            <h3 className="catalogue-sidebar__title">
                                <SlidersHorizontal size={16} />
                                Filtres
                            </h3>
                            <button
                                className="catalogue-sidebar__close"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="catalogue-sidebar__section">
                            <div className="catalogue-sidebar__search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="catalogue-sidebar__search-clear">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Famille (Categories) */}
                        <div className="catalogue-sidebar__section">
                            <h4 className="catalogue-sidebar__section-title">FAMILLE</h4>
                            <ul className="catalogue-sidebar__categories">
                                <li className="catalogue-sidebar__cat-item catalogue-sidebar__cat-item--all">
                                    <button
                                        className={`catalogue-sidebar__cat-name ${!selectedCategory ? 'catalogue-sidebar__cat-name--active' : ''}`}
                                        onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); }}
                                    >
                                        All Categories
                                        {!selectedCategory && <ChevronRight size={14} />}
                                    </button>
                                </li>
                                {categoriesWithProducts.map(cat => (
                                    <li key={cat.slug} className="catalogue-sidebar__cat-item">
                                        <div
                                            className={`catalogue-sidebar__cat-header ${selectedCategory === cat.slug ? 'catalogue-sidebar__cat-header--active' : ''}`}
                                        >
                                            <button
                                                className="catalogue-sidebar__cat-name"
                                                onClick={() => handleCategorySelect(cat.slug)}
                                            >
                                                {cat.name}
                                                <span className="catalogue-sidebar__cat-count">{cat.count}</span>
                                            </button>
                                            {cat.subcategories.length > 1 && (
                                                <button
                                                    className={`catalogue-sidebar__cat-toggle ${expandedCategories[cat.slug] ? 'catalogue-sidebar__cat-toggle--open' : ''}`}
                                                    onClick={() => toggleCategory(cat.slug)}
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {expandedCategories[cat.slug] && cat.subcategories.length > 1 && (
                                            <ul className="catalogue-sidebar__subcats">
                                                {cat.subcategories.map(sub => (
                                                    <li key={sub.slug}>
                                                        <button
                                                            className={`catalogue-sidebar__subcat-btn ${selectedSubCategory === sub.slug ? 'catalogue-sidebar__subcat-btn--active' : ''}`}
                                                            onClick={() => handleSubCategorySelect(sub.slug, cat.slug)}
                                                        >
                                                            {sub.name}
                                                            <span className="catalogue-sidebar__cat-count">{sub.count}</span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Price Range */}
                        <div className="catalogue-sidebar__section">
                            <h4 className="catalogue-sidebar__section-title">PRICE RANGE (FCFA)</h4>
                            <div className="catalogue-sidebar__price-range">
                                <div className="slider-track">
                                    <div className="slider-progress"></div>
                                    <div className="slider-thumb slider-thumb-left"></div>
                                    <div className="slider-thumb slider-thumb-right"></div>
                                </div>
                                <div className="price-labels">
                                    <span>0 FCFA</span>
                                    <span>500,000 FCFA</span>
                                </div>
                            </div>
                        </div>

                        {/* Stock Availability */}
                        <div className="catalogue-sidebar__section">
                            <h4 className="catalogue-sidebar__section-title">STOCK AVAILABILITY</h4>
                            <div className="catalogue-sidebar__stock">
                                <label className="stock-radio">
                                    <input type="radio" name="stock" defaultChecked />
                                    <span className="radio-custom"></span>
                                    In Stock Only
                                </label>
                                <label className="stock-radio">
                                    <input type="radio" name="stock" />
                                    <span className="radio-custom"></span>
                                    Show All Items
                                </label>
                            </div>
                        </div>

                        {/* Bulk Orders */}
                        <div className="catalogue-sidebar__bulk">
                            <h5>Need bulk orders?</h5>
                            <p>Contact our sales team for personalized wholesale quotes.</p>
                            <button className="bulk-btn">Contact Support</button>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button className="catalogue-sidebar__clear" onClick={clearFilters}>
                                <X size={14} />
                                Effacer les filtres
                            </button>
                        )}
                    </aside>

                    {/* ── Main Content ──────────────────────────── */}
                    <main className="catalogue-main">
                        {/* Sort Bar */}
                        <div className="catalogue-main__toolbar">
                            {/* Active Filter Chips */}
                            <div className="catalogue-main__chips">
                                {searchQuery && (
                                    <span className="catalogue-chip">
                                        Recherche: « {searchQuery} »
                                        <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                                    </span>
                                )}
                                {activeCategoryName && (
                                    <span className="catalogue-chip">
                                        {activeCategoryName}
                                        <button onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); }}><X size={12} /></button>
                                    </span>
                                )}
                            </div>
                            <div className="catalogue-main__sort">
                                <label>Trier par:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="name-asc">Nom A → Z</option>
                                    <option value="name-desc">Nom Z → A</option>
                                    <option value="price-asc">Prix ↑ croissant</option>
                                    <option value="price-desc">Prix ↓ décroissant</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {paginatedProducts.length > 0 ? (
                            <div className="catalogue-grid">
                                {paginatedProducts.map((product) => (
                                    <div key={product.code} className="product-card">
                                        <div className="product-card__image-wrapper">
                                            <span className="product-card__stock-badge">STOCK</span>
                                            <Link to={getProductRoutePath(product)} className="product-card__image">
                                                <img src={product.image} alt={product.model} loading="lazy" />
                                            </Link>
                                        </div>
                                        <div className="product-card__body">
                                            <p className="product-card__ref">REF: {product.code}</p>
                                            <Link to={getProductRoutePath(product)} className="product-card__title-link">
                                                <h3 className="product-card__name">{product.model}</h3>
                                            </Link>

                                            <div className="product-card__pricing">
                                                <div className="product-card__retail">
                                                    <span className="product-card__retail-label">Retail<br />(prix_vente_d)</span>
                                                    <span className="product-card__retail-price">{formatFCFA(product.retailPrice)}</span>
                                                </div>
                                                <div className="product-card__wholesale">
                                                    <span className="product-card__wholesale-label">Wholesale<br />(prix_vente_g)</span>
                                                    <span className="product-card__wholesale-price">{formatFCFA(product.wholesalePrice)}</span>
                                                </div>
                                            </div>

                                            <button className="product-card__add-btn" onClick={() => addToCart(product, 1)}>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="catalogue-empty">
                                <Search size={48} strokeWidth={1} />
                                <h3>{isLoading ? 'Chargement des produits...' : 'Aucun produit trouve'}</h3>
                                <p>{loadError || 'Essayez de modifier vos filtres ou votre recherche'}</p>
                                <button onClick={clearFilters} className="catalogue-empty__btn">
                                    Effacer les filtres
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="catalogue-pagination">
                                <button
                                    className="catalogue-pagination__btn"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                    Précédent
                                </button>

                                <div className="catalogue-pagination__pages">
                                    {getPageNumbers()[0] > 1 && (
                                        <>
                                            <button
                                                className="catalogue-pagination__page"
                                                onClick={() => setCurrentPage(1)}
                                            >1</button>
                                            {getPageNumbers()[0] > 2 && <span className="catalogue-pagination__ellipsis">...</span>}
                                        </>
                                    )}
                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            className={`catalogue-pagination__page ${currentPage === page ? 'catalogue-pagination__page--active' : ''}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    {getPageNumbers().at(-1) < totalPages && (
                                        <>
                                            {getPageNumbers().at(-1) < totalPages - 1 && <span className="catalogue-pagination__ellipsis">...</span>}
                                            <button
                                                className="catalogue-pagination__page"
                                                onClick={() => setCurrentPage(totalPages)}
                                            >{totalPages}</button>
                                        </>
                                    )}
                                </div>

                                <button
                                    className="catalogue-pagination__btn"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Catalogue;
