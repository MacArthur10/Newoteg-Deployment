import { useState } from 'react';
import { Building2, Trophy, Award, Phone, MapPin } from 'lucide-react';
import Footer from '../../components/Footer/Footer';
import './About.scss';

const About = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message envoyé ! Nous reviendrons vers vous rapidement.');
        setFormData({ firstName: '', lastName: '', email: '', message: '' });
    };

    return (
        <div className="about-page">
            {/* ── Hero Section ────────────────────────────── */}
            <section className="about-hero">
                <div className="about-hero__content container">
                    <div className="about-hero__text">
                        <span className="about-hero__tag">OUR STORY</span>
                        <h1>About <strong>NEWOTEG SARL</strong></h1>
                        <p>
                            Founded with a vision for excellence, NEWOTEG SARL
                            has been at the forefront of technology distribution,
                            creating an industry for greater experience. We specialize in
                            operational excellence and value-driven partnerships.
                        </p>
                        <p>
                            Our mission is to deliver high-quality services that
                            empower our clients and partners to achieve sustained growth in
                            the industry through technology and human-centric
                            expertise.
                        </p>
                    </div>
                    <div className="about-hero__image">
                        <img src="/images/about-hero.png" alt="About NEWOTEG" />
                    </div>
                </div>
            </section>

            {/* ── Milestones ─────────────────────────────── */}
            <section className="about-milestones container">
                <div className="milestone-card">
                    <div className="milestone-card__icon">
                        <Building2 size={24} />
                    </div>
                    <h3 className="milestone-card__year">2016</h3>
                    <p className="milestone-card__desc">Founded with a small team of passionate engineers in Douala.</p>
                </div>
                <div className="milestone-card">
                    <div className="milestone-card__icon">
                        <Trophy size={24} />
                    </div>
                    <h3 className="milestone-card__year">2019</h3>
                    <p className="milestone-card__desc">Opened new offices in Yaoundé and Douala to serve the growing Cameroonian electronics market.</p>
                </div>
                <div className="milestone-card">
                    <div className="milestone-card__icon">
                        <Award size={24} />
                    </div>
                    <h3 className="milestone-card__year">2023</h3>
                    <p className="milestone-card__desc">Internationally Certified as a Top Information Service Provider.</p>
                </div>
            </section>

            {/* <section className="about-image-banner">
                <img src="/images/cameroon-cityscape.png" alt="Cameroon Cityscape" />
            </section> */}

            {/* ── Contact Section ─────────────────────────── */}
            <section className="about-contact container">
                <h2 className="about-contact__title">Get in Touch</h2>
                <p className="about-contact__subtitle">
                    Have questions about us or our product? Our team is ready to assist you. Fill the details below to
                    reach out to us.
                </p>

                <div className="about-contact__grid">
                    <form className="about-contact__form" onSubmit={handleSubmit}>
                        <div className="about-contact__row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" required />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Write your message..." required />
                        </div>
                        <button type="submit" className="about-contact__submit">Send Message</button>
                    </form>

                    <div className="about-contact__info">
                        <div className="info-card">
                            <Phone size={20} />
                            <div>
                                <h4>Phone</h4>
                                <p>+237 6 12 34 56 78</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <MapPin size={20} />
                            <div>
                                <h4>Headquarters</h4>
                                <p>Douala Deido, 211XX Akwa,<br />Cameroon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Legal Section ───────────────────────────── */}
            <section className="about-legal container">
                <h2 className="about-legal__title">Legal Information</h2>
                <div className="about-legal__tabs">
                    <span className="about-legal__tab about-legal__tab--active">Terms of Service</span>
                    <span className="about-legal__tab">Privacy Policy</span>
                </div>

                <div className="about-legal__content">
                    <h3>1. Terms and Conditions</h3>
                    <p>
                        By accessing the services provided by NEWOTEG SARL, you agree to be bound by these Terms. Our services are
                        provided based on the applicable laws and regulations. We reserve the right to modify these terms at any time.
                        Continued use of our platform(s) constitutes acceptance of any additional terms or modifications.
                    </p>

                    <h3>2. Return & Refund Policy</h3>
                    <p>
                        Device cancellations must be requested in writing at least 48 days prior to the first billing cycle. Refunds for digital
                        services are processed as credits to your account balance and are non-transferable.
                    </p>
                    <ul>
                        <li>Items must arrive within 7 days of purchase date for eligible return(s).</li>
                        <li>Refunds exclude delivery charges.</li>
                        <li>Be advised: for incomplete consulting hours or custom software deployments there are no refunds.</li>
                    </ul>

                    <h3>3. Data Privacy</h3>
                    <p>
                        As part of NEWOTEG SARL, we comply with GDPR and international data protection guidelines.
                        Rest well with your data is in safe hands.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
