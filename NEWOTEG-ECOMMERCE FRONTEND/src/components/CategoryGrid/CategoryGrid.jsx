import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productsService from '../../services/productsService';
import './CategoryGrid.scss';

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const loadCategories = async () => {
            try {
                const liveCategories = await productsService.getCategories();
                if (isMounted) {
                    setCategories(liveCategories.slice(0, 6));
                }
            } catch {
                if (isMounted) {
                    setCategories([]);
                }
            }
        };

        loadCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section className="category-section">
            <div className="container">
                <div className="category-section__header">
                    <h2 className="category-section__title">Composants par Catégorie</h2>
                    <Link to="/catalogue" className="category-section__view-all">Explorer le Catalogue &rarr;</Link>
                </div>

                <div className="category-grid">
                    {categories.map((category) => (
                        <Link to={`/catalogue?category=${category.slug}`} key={category.slug} className="category-card-premium">
                            <div className="category-card-premium__image-container">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="category-card-premium__image"
                                />
                                <div className="category-card-premium__overlay"></div>
                            </div>
                            <div className="category-card-premium__content">
                                <h3 className="category-card-premium__title">{category.name}</h3>
                                <p className="category-card-premium__subtitle">{category.count}+ Articles</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
