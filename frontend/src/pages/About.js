import React from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiHeart, FiGlobe, FiUsers } from 'react-icons/fi';
import SEO from '../components/SEO';
import { SEO_CONFIG } from '../utils/seoConstants';
import { getOrganizationSchema, getLocalBusinessSchema } from '../utils/schemaMarkup';
import { trackPageView } from '../utils/ga4Tracking';

function About() {
  const seoConfig = SEO_CONFIG.pages.about;

  React.useEffect(() => { trackPageView('/about', 'About RAVARI'); }, []);

  const pageSchema = {
    '@context': 'https://schema.org',
    '@graph': [getOrganizationSchema(), getLocalBusinessSchema()],
  };

  return (
    <div style={{ backgroundColor: '#fff' }}>
      <SEO
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical={`${SEO_CONFIG.site.url}${seoConfig.path}`}
        ogTitle="About RAVARI — Premium Handcrafted Leather"
        ogDescription="The story behind RAVARI — born from a devotion to artisan leather craft."
        ogImage="https://ravari.in/og-about.jpg"
        schemaMarkup={pageSchema}
      />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1A0F0A', padding: '6rem 0' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="section-eyebrow mb-5" style={{ color: '#C9A84C' }}>Our Heritage</p>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, color: '#FAF7F2', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            Crafted with Purpose.<br />
            <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#C9A84C' }}>Built to Last.</em>
          </h1>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', color: '#B8A89A', lineHeight: 1.85, maxWidth: '540px', margin: '0 auto' }}>
            Since 2023, RAVARI has been creating handcrafted leather goods that transcend trends — rooted in artisan tradition, refined for modern living.
          </p>
        </div>
      </section>

      <div className="divider-gold" />

      {/* ── Story ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '6rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2.5rem' }}>

          {/* Section heading — centered */}
          <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C' }} />
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C' }}>The Beginning</span>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C' }} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 400, color: '#1A0F0A', lineHeight: 1.15, marginBottom: '0' }}>
              Our Story
            </h2>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '4rem', alignItems: 'start' }}>

            {/* Left — story text */}
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.18rem', color: '#2A2320', lineHeight: 2, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid #C9A84C', paddingLeft: '1.25rem' }}>
                "Founded in 2023, RAVARI emerged from a singular passion — to create leather goods worthy of a lifetime."
              </p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#5A5450', lineHeight: 2, marginBottom: '1.25rem' }}>
                We began with a clear belief: that quality and craft should never be sacrificed for speed or cost. Every RAVARI piece is built with intention — designed to age beautifully, carry your stories, and outlast trends.
              </p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#5A5450', lineHeight: 2, marginBottom: '1.25rem' }}>
                Our artisans combine time-honoured techniques with modern sensibility — hand-selecting full-grain hides, reinforcing every seam, and finishing every edge by hand. No shortcuts. No compromises.
              </p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.82rem', fontWeight: 300, color: '#5A5450', lineHeight: 2 }}>
                Today, RAVARI stands as a commitment to those who value authenticity — who choose pieces that speak quietly of quality, rather than loudly of labels.
              </p>
            </div>

            {/* Vertical divider */}
            <div style={{ backgroundColor: 'rgba(201,168,76,0.2)', alignSelf: 'stretch' }} />

            {/* Right — Est. card + craft pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Est. card */}
              <div style={{ backgroundColor: '#0D0B08', padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.52rem', fontWeight: 600, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Est.</p>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '5rem', fontWeight: 600, color: '#C9A84C', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>2023</div>
                <div style={{ width: '32px', height: '1px', backgroundColor: '#C9A84C', margin: '1rem auto', opacity: 0.5 }} />
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Lucknow · India</p>
              </div>

              {/* Craft pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: 'rgba(201,168,76,0.15)' }}>
                {[
                  { label: 'Full-Grain Leather',    desc: 'Only the finest hides' },
                  { label: 'Hand-Stitched',         desc: 'Every seam, reinforced' },
                  { label: '100% Handcrafted',      desc: 'No shortcuts, ever' },
                  { label: '7-Day Returns',         desc: 'Buy with confidence' },
                ].map(({ label, desc }) => (
                  <div key={label} style={{ backgroundColor: '#FAF7F2', padding: '1.25rem', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A0F0A', marginBottom: '0.35rem' }}>{label}</p>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.6rem', color: '#8C8680', letterSpacing: '0.04em' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FAF7F2', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="section-eyebrow mb-3">What We Stand For</p>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 600, color: '#1A0F0A' }}>Our Core Values</h2>
            <div className="divider-gold w-20 mx-auto mt-5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <FiAward size={22} />,   title: 'Quality First',    body: 'We never compromise on quality, sourcing only the finest materials for our creations.' },
              { icon: <FiHeart size={22} />,   title: 'Passion Driven',   body: 'Our artisans pour heart and soul into every product, creating with unwavering dedication.' },
              { icon: <FiGlobe size={22} />,   title: 'Sustainability',   body: 'We believe in ethical sourcing and environmentally responsible manufacturing.' },
              { icon: <FiUsers size={22} />,   title: 'Customer First',   body: 'Your satisfaction is our highest priority, backed by exceptional service.' },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ borderTop: '2px solid #C9A84C', paddingTop: '1.5rem' }}>
                <span style={{ color: '#C9A84C', display: 'block', marginBottom: '1rem' }}>{icon}</span>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 600, color: '#1A0F0A', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.82rem', color: '#6B6560', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#1A0F0A', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '2023',   label: 'Year of Founding'  },
              { num: '500+',   label: 'Happy Customers'   },
              { num: '100%',   label: 'Handcrafted'       },
              { num: '20+',    label: 'Unique Designs'    },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '3rem', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>{num}</div>
                <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B8A89A', marginTop: '0.75rem' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-3">Behind Every Piece</p>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2.5rem', fontWeight: 600, color: '#1A0F0A' }}>Our Crafting Process</h2>
          <div className="divider-gold w-20 mx-auto mt-5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { step: '01', name: 'Design',    desc: 'Conceptualised & sketched by hand' },
            { step: '02', name: 'Selection', desc: 'Premium leather carefully sourced' },
            { step: '03', name: 'Cutting',   desc: 'Precision pattern cutting' },
            { step: '04', name: 'Assembly',  desc: 'Hand-stitched construction' },
            { step: '05', name: 'Finishing', desc: 'Quality check & final polish' },
          ].map(({ step, name, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ border: '1px solid #C9A84C' }}>
                <span style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#C9A84C' }}>{step}</span>
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: '#1A0F0A', marginBottom: '0.4rem' }}>{name}</h3>
              <p style={{ fontFamily: 'Raleway, sans-serif', fontSize: '0.72rem', color: '#6B6560', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#FAF7F2', padding: '5rem 0' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="section-eyebrow mb-4">Experience RAVARI</p>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '2rem', fontWeight: 600, color: '#1A0F0A', marginBottom: '1rem' }}>
            Ready to find your perfect piece?
          </h2>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', color: '#6B6560', lineHeight: 1.8, marginBottom: '2rem' }}>
            Explore our curated collection of handcrafted leather goods — each one made to last generations.
          </p>
          <Link to="/products" className="btn-primary">Shop the Collection</Link>
        </div>
      </section>
    </div>
  );
}

export default About;
