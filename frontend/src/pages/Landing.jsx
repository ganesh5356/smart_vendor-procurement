import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8082/swagger-ui.html`

  return (
    <div className="landing-wrapper">
      <nav className="landing-navbar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">SVPMS</span>
        </div>

        <div className="landing-nav-group">
          <div className="landing-nav-links">
            <a href="#home" className="landing-nav-link">Home</a>
            <a href="#about" className="landing-nav-link">About</a>
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#workflow" className="landing-nav-link">Workflow</a>
            <a href={swaggerUrl} className="landing-nav-link" target="_blank" rel="noreferrer">API Docs</a>
          </div>

          <div className="landing-nav-auth">
            <Link to="/login" className="btn btn-outline" style={{ border: '1px solid #4b5563', color: 'white' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>

        <button className="landing-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`landing-mobile-backdrop ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Drawer Menu */}
      <div className={`landing-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button
          className="landing-menu-close"
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}
          onClick={() => setMobileMenuOpen(false)}
        >
          ✕
        </button>
        <a href="#home" className="landing-nav-link" style={{ marginTop: '40px' }} onClick={() => setMobileMenuOpen(false)}>Home</a>
        <a href="#about" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>About</a>
        <a href="#features" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
        <a href="#workflow" className="landing-nav-link" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
        <a href={swaggerUrl} className="landing-nav-link" target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)}>API Docs</a>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', marginTop: '16px', width: '100%' }}>
          <Link to="/login" className="btn btn-outline" style={{ color: 'white', width: 'fit-content', padding: '10px 24px' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ width: 'fit-content', padding: '10px 24px' }} onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
        </div>
      </div>

      <section className="landing" id="home">
        <div className="landing-hero">
          <div className="hero-glow"></div>
          <div className="landing-hero-text">
            <span className="section-tag">Next-Gen Procurement</span>
            <h1>SVPMS — Master Your Supply Chain</h1>
            <p>
              A professional-grade procurement platform built for speed and transparency.
              Manage vendors, automate requisitions, and track every purchase order in real-time.
            </p>
            <div className="landing-hero-cta">
              <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px' }}>Start Managing Now</Link>
              <Link to="/register" className="btn btn-outline" style={{ padding: '16px 32px' }}>View Demo Access</Link>
            </div>
          </div>
          <div className="landing-hero-media">
            <div className="hero-ui-mockup">
              <div className="mockup-header">
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
                <div className="mockup-dot"></div>
              </div>
              <div className="mockup-body">
                <div className="mockup-rect"></div>
                <div className="mockup-line"></div>
                <div className="mockup-line" style={{ width: '70%' }}></div>
                <div className="mockup-line" style={{ width: '40%' }}></div>
                <div className="mockup-rect" style={{ height: '40px', background: '#d1fae5', marginTop: '20px' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-stats" id="about">
          <div className="stat-card">
            <div className="stat-number">360°</div>
            <div className="stat-label">System Visibility</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Secure</div>
            <div className="stat-label">JWT Authentication</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">Real-time</div>
            <div className="stat-label">Global Tracking</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Workflow Uptime</div>
          </div>
        </div>

        <div className="landing-section" id="features">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span className="section-tag">Powerful Features</span>
            <h2>Complete Control Over Every Step</h2>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Intelligent Onboarding</h3>
              <p>Verify vendors with standardized GST compliance and real-time rating systems.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Smart Requisitions</h3>
              <p>Create detailed PRs with multi-level approval history for full accountability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Inventory Tracking</h3>
              <p>Track delivery quantities against POs and manage order closures automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-Role Access</h3>
              <p>Dedicated dashboards for Admins, Procurement, Finance, and Vendors.</p>
            </div>
          </div>
        </div>

        <div className="landing-section split" id="workflow" style={{ background: '#f8fafc', borderRadius: '40px' }}>
          <div>
            <span className="section-tag">Audit-Ready</span>
            <h2>Seamless Procurement Lifecycle</h2>
            <p>
              Experience the clarity of a streamlined workflow from vendor deactivation safety to automated PO generation.
            </p>
            <div className="steps">
              <div className="step"><span className="step-num">1</span><span>Identity Verification via JWT</span></div>
              <div className="step"><span className="step-num">2</span><span>Automated PR Approval Queue</span></div>
              <div className="step"><span className="step-num">3</span><span>PO Fulfillment & GST Calculations</span></div>
              <div className="step"><span className="step-num">4</span><span>Live Status & History Logging</span></div>
            </div>
          </div>
          <div className="landing-hero-media">
            <div className="hero-placeholder-icon" style={{ fontSize: '150px' }}>🤝</div>
          </div>
        </div>

        <footer className="landing-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="sidebar-brand" style={{ marginBottom: '20px' }}>
                <span className="sidebar-logo">SVPMS</span>
              </div>
              <p>The enterprise standard for supplier management and procurement transparency. Built for high-performance teams globally.</p>
              <div className="footer-socials" style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                <span className="social-icon" title="X (formerly Twitter)">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </span>
                <span className="social-icon" title="LinkedIn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </span>
                <span className="social-icon" title="GitHub">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                  </svg>
                </span>
              </div>
            </div>

            <div className="footer-section">
              <h4>Capabilities</h4>
              <ul className="footer-info-list">
                <li>Cloud Architecture</li>
                <li>JWT Role-based Security</li>
                <li>Audit-Ready Logging</li>
                <li>Vendor Performance Search</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Resources</h4>
              <ul className="footer-info-list">
                <li>Platform Documentation</li>
                <li>API Reference</li>
                <li>Security Protocols</li>
                <li>Compliance Standards</li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Connect</h4>
              <ul className="footer-info-list">
                <li className="footer-info-item"><span>📞</span> +91 98765 43210</li>
                <li className="footer-info-item"><span>📧</span> support@svpms.com</li>
                <li className="footer-info-item"><span>📍</span> Tech Hub, India</li>
              </ul>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <div className="footer-copy">
              © 2026 SVPMS Enterprise Solution. <span className="hide-mobile">All rights reserved.</span>
            </div>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Cookie Settings</a>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}
