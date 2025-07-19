import React, { useEffect } from 'react';
import '../pages/styles/AboutUs.css';

const AboutUs = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.about-section');
    const fadeInOnScroll = () => {
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop < window.innerHeight - 100) {
          section.classList.add('visible');
        }
      });
    };
    window.addEventListener('scroll', fadeInOnScroll);
    fadeInOnScroll(); // Initial check
    return () => window.removeEventListener('scroll', fadeInOnScroll);
  }, []);

  return (
    <div className="about-container">
      <h1>About <span>Vaidyasthana</span></h1>

      <section className="about-section">
        <h2>Who We Are</h2>
        <p>
          Vaidyasthana is a trusted online pharmacy committed to delivering high-quality healthcare products to your doorstep. With a passion for wellness and innovation, we aim to revolutionize healthcare access across the nation.
        </p>
      </section>

      <section className="about-section">
        <h2>What We Do</h2>
        <p>
          From prescription medicines to daily health essentials, we provide a seamless platform to purchase trusted pharmaceutical products. Our AI-assisted recommendations and categorized shopping simplify your healthcare journey.
        </p>
      </section>

      <section className="about-section">
        <h2>Why Choose Us?</h2>
        <ul>
          <li>✔ 100% Genuine Medicines</li>
          <li>✔ AI-powered Recommendations</li>
          <li>✔ Fast Delivery with Cold-Chain Logistics</li>
          <li>✔ Qualified Pharmacist Support</li>
          <li>✔ Encrypted and Secure Transactions</li>
        </ul>
      </section>

      <section className="about-section team">
        <h2>Our Team</h2>
        <p>
          Our dedicated team includes doctors, pharmacists, developers, and logistics professionals all aligned to one goal — building India’s most reliable digital pharmacy.
        </p>
        <img src="/images/team.png" alt="Our Team" />
      </section>
    </div>
  );
};

export default AboutUs;
