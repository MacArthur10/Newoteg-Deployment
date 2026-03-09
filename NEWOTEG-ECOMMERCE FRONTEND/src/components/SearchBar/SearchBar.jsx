import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import productsService from '../../services/productsService';
import './SearchBar.scss';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        productsService
            .getProducts()
            .then((liveProducts) => {
                if (isMounted) {
                    setProducts(liveProducts);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setProducts([]);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const results = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];
        return products
            .filter((item) => item.model.toLowerCase().includes(query))
            .slice(0, 8)
            .map((item) => item.model);
    }, [products, searchQuery]);

    return (
        <div className="search-bar">
            <div className="search-bar__input-wrapper">
                <Search className="search-bar__icon" size={18} />
                <input
                    type="text"
                    className="search-bar__input"
                    placeholder="Rechercher un composant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />
            </div>

            {isOpen && results.length > 0 && (
                <ul className="search-bar__dropdown">
                    {results.map((result, index) => (
                        <li key={index} className="search-bar__item">
                            <button
                                className="search-bar__item-btn"
                                onClick={() => {
                                    setSearchQuery(result);
                                    setIsOpen(false);
                                }}
                            >
                                {result}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && searchQuery.trim() && results.length === 0 && (
                <div className="search-bar__dropdown">
                    <div className="search-bar__no-results">Aucun résultat trouvé</div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
