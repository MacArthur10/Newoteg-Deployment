import { Link } from 'react-router-dom';
import { ArrowRight, Box, Cpu, ShieldCheck } from 'lucide-react';
import './HeroBanner.scss';

const HeroBanner = () => {
    return (
        <section className="hero-banner">
            <div
                className="hero-banner__slide hero-banner__slide--active"
                style={{ backgroundImage: `url('/images/hero-tech.png')` }}
            >
                <div className="hero-banner__overlay"></div>
            </div>

            <div className="hero-banner__content container">
                <div className="hero-banner__text-block">
                    <div className="hero-banner__badge">
                        <span className="pulse-dot"></span>
                        DISTRIBUTEUR OFFICIEL B2B
                    </div>

                    <h1 className="hero-banner__title">
                        Composants Électroniques<br />
                        <strong>Industriels & Pro</strong>
                    </h1>

                    <p className="hero-banner__subtitle">
                        NEWOTEG est votre partenaire de confiance pour l'approvisionnement en circuits intégrés, microcontrôleurs et équipements de pointe. Précision, stock garanti et livraison rapide.
                    </p>

                    <div className="hero-banner__actions">
                        <Link to="/catalogue" className="hero-banner__button hero-banner__button--primary">
                            Explorer le Catalogue <ArrowRight size={18} />
                        </Link>
                        <Link to="/about" className="hero-banner__button hero-banner__button--secondary">
                            Notre Expertise
                        </Link>
                    </div>

                    <div className="hero-banner__trust">
                        <div className="trust-item">
                            <ShieldCheck size={20} />
                            <span>Qualité Certifiée</span>
                        </div>
                        <div className="trust-item">
                            <Box size={20} />
                            <span>Stock Massif</span>
                        </div>
                        <div className="trust-item">
                            <Cpu size={20} />
                            <span>Direct Fabricant</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
