import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCheckCircle, HiOutlineSparkles, HiOutlineShieldCheck,
  HiOutlineBell, HiOutlinePhone, HiOutlineUserGroup, HiOutlineCurrencyRupee,
  HiOutlineClock, HiOutlineDocumentText, HiOutlineArrowRight,
  HiOutlineArrowLeft, HiOutlineBuildingOffice2, HiOutlineWrenchScrewdriver,
  HiOutlineTruck, HiOutlineClipboardDocumentCheck, HiOutlineArrowPath,
} from 'react-icons/hi2';
import '../Dashboard.css';

const ProjectSummary = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [copiedKey, setCopiedKey] = useState('');

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const MILESTONES = [
    {
      id: 'credentials',
      category: 'Auth & Panels',
      title: '4 Panels Unified Fixed Credentials & Dynamic Selectors',
      status: 'Completed & Verified',
      date: 'Latest',
      icon: <HiOutlineShieldCheck style={{ color: '#2563eb' }} />,
      description:
        'Replaced legacy login credentials across all 4 panels with exact production demo accounts. Built 1-click panel buttons, dynamic dropdowns, and quick pills.',
      highlights: [
        '5 Customer Accounts (rahul.shah@gmail.com, etc. with password "customer123")',
        '1 Admin Master Account (admin2@gmail.com with password "Admin@123")',
        '1 B2B Society Partner Account (b2b@gmail.com with password "B2B@123")',
        '19 Dedicated Worker Accounts for all 19 services (password "worker123")',
        'Fixed refresh instability — valid JWT tokens never expire or kick user to /login on reload',
      ],
    },
    {
      id: 'worker-roles',
      category: 'Registration & Roles',
      title: '19 Main Service Roles in Worker Registration',
      status: 'Completed & Verified',
      date: 'Latest',
      icon: <HiOutlineWrenchScrewdriver style={{ color: '#059669' }} />,
      description:
        'Expanded worker account creation to support all 19 canonical service domains with interactive skill tags, service city, and experience levels.',
      highlights: [
        'Updated RegisterPage.jsx to show full 19-service dropdown and skill badges when role="worker"',
        'Updated WorkerRegister.jsx with searchable registry, skill pill selectors, and documents',
        'Built central canonical registry in serviceCategories.js and workerCategoryHelper.js',
      ],
    },
    {
      id: 'dynamic-pricing',
      category: 'Dynamic Pricing',
      title: 'Dynamic Content Pricing Engine (Static Prices Eliminated)',
      status: 'Completed & Verified',
      date: 'Latest',
      icon: <HiOutlineCurrencyRupee style={{ color: '#d97706' }} />,
      description:
        'Eliminated static prices (like ₹2000 fixed for 200 km vs 300 km luxury car) across customer hubs and the AI chatbot.',
      highlights: [
        'Travel & Commute: Distance slider (20–1000 km), Car tiers (Sedan x1.0, SUV x1.45, Luxury x2.4), and travel days',
        'Packers & Movers: Transit distance slider (5–500 km), ₹16/km transit fee, and BHK room inventory calculator',
        'Food & Kitchen: Home Chef party guest counter (2–50 guests) and Custom Cake weight selector (0.5–5 kg)',
        'Pet Care Hub: Grooming scaled by pet size (Small/Med/Large), Boarding night counter, and Dog walk packages',
        'AI Chatbot (Groq): Deterministic fare engine parsing km, car model, BHK, and guests directly from chat prompts',
      ],
    },
    {
      id: 'notifications',
      category: 'Real-time & Dispatch',
      title: 'Smart Role-Isolated Notifications & Call Request Routing',
      status: 'Completed & Verified',
      date: 'Latest',
      icon: <HiOutlineBell style={{ color: '#7c3aed' }} />,
      description:
        'Engineered an enterprise-grade notification and call request system that routes bookings and calls directly to matching domain workers and admin.',
      highlights: [
        'Call Me Back Widget with all 19 services — selecting "Vehicle Services" targets vehicle workers only',
        'Admin always receives notifications with full details (customer phone, service, worker name, and time)',
        'Working "Accept Job" button transmits worker details immediately to Admin panel',
        'Working "Mark all read" and individual dismiss cross (×) buttons with persistent storage',
      ],
    },
    {
      id: 'worker-call',
      category: 'Worker Experience',
      title: 'Worker Call Hotline & Live Consultation Console',
      status: 'Completed & Verified',
      date: 'Latest',
      icon: <HiOutlinePhone style={{ color: '#0d9488' }} />,
      description:
        'Relocated call interface to a sleek, non-intrusive bottom-right location and made both consultation options fully functional.',
      highlights: [
        'Non-intrusive placement: alerts pop up cleanly in bottom-right without blocking navbar',
        'Option 1 Working: Live Voice Consultation console with call duration timer, mute/speaker toggles, and notes',
        'Option 2 Working: Dedicated 24x7 Partner Support Hotline (1800-889-SERVE) and Priority WhatsApp connect',
      ],
    },
  ];

  const WORKERS_LIST = [
    { num: 1, service: 'Home Repairs', email: 'homerepairs.worker@gmail.com' },
    { num: 2, service: 'Vehicle Services', email: 'vehicleservices.worker@gmail.com' },
    { num: 3, service: 'Cleaning & Hygiene', email: 'cleaninghygiene.worker@gmail.com' },
    { num: 4, service: 'Home IT & Smart Devices', email: 'homeit.worker@gmail.com' },
    { num: 5, service: 'Care & Family', email: 'carefamily.worker@gmail.com' },
    { num: 6, service: 'Utility & Daily Help', email: 'dailyhelp.worker@gmail.com' },
    { num: 7, service: 'Learning & Support', email: 'learningsupport.worker@gmail.com' },
    { num: 8, service: 'Property & Society', email: 'propertysociety.worker@gmail.com' },
    { num: 9, service: 'Seasonal & Festive', email: 'seasonalworker@gmail.com' },
    { num: 10, service: 'Furniture & Decor', email: 'furnituredecor.worker@gmail.com' },
    { num: 11, service: 'Garden & Outdoor', email: 'gardenoutdoor.worker@gmail.com' },
    { num: 12, service: 'Packers & Movers', email: 'packersmovers.worker@gmail.com' },
    { num: 13, service: 'Health & Wellness', email: 'healthwellness.worker@gmail.com' },
    { num: 14, service: 'Kids & Elderly Care', email: 'familycare.worker@gmail.com' },
    { num: 15, service: 'Pet Services', email: 'petservices.worker@gmail.com' },
    { num: 16, service: 'Food Kitchen', email: 'foodkitchen.worker@gmail.com' },
    { num: 17, service: 'Travel & Commute', email: 'travelcommute.worker@gmail.com' },
    { num: 18, service: 'Society Management', email: 'societymanagement.worker@gmail.com' },
    { num: 19, service: 'Events Hub', email: 'eventshub.worker@gmail.com' },
  ];

  return (
    <div className="page-content" style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px', minHeight: '92vh' }}>
      
      {/* Top Navigation Back */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
          }}
        >
          <HiOutlineArrowLeft /> Back to Home
        </Link>
        <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontWeight: 800 }}>
          🚀 Project Changelog &amp; Verification Deck
        </span>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0284c7 100%)',
          borderRadius: '24px',
          padding: '40px 32px',
          color: 'white',
          boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.35)',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '14px' }}>
          <HiOutlineSparkles /> ServeCircle Enterprise Milestone Report
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.02em', color: 'white' }}>
          Recent System Implementations &amp; Technical Changelog
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.95, maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
          A consolidated overview of all features engineered across authentication, dynamic pricing, real-time role-targeted dispatch, and multi-panel socket communications for reviewer demonstration.
        </p>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginTop: '28px' }}>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Unified Panels</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: 900 }}>4 Panels</strong>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Customer, Worker, Admin, B2B</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Dedicated Services</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: 900 }}>19 Services</strong>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Specific worker IDs for each</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Pricing Engine</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: 900 }}>100% Dynamic</strong>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Distance, Tiers, Guests, BHK</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block' }}>Dispatch &amp; Hotline</span>
            <strong style={{ fontSize: '1.6rem', fontWeight: 900 }}>Live Sockets</strong>
            <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>Cross-Tab &amp; Room Isolated</span>
          </div>
        </div>
      </div>

      {/* Main Milestones List */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--navy-900)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HiOutlineDocumentText style={{ color: '#2563eb' }} /> Feature Implementations Breakdown
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {MILESTONES.map((m) => (
            <div
              key={m.id}
              className="card"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px 28px',
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {m.icon}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {m.category}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                      {m.title}
                    </h3>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>
                  {m.status}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                {m.description}
              </p>

              <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <strong style={{ fontSize: '0.78rem', color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                  Key Engineering Deliverables:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155' }}>
                  {m.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Configured Credentials Showcase (Judges Deck) */}
      <div
        className="card"
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '28px',
          border: '1.5px solid #bfdbfe',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '36px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1e3a8a', margin: '0 0 4px' }}>
              🎯 Judges &amp; Reviewers Ready-To-Use Demo Credentials
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              All accounts are hardcoded and synchronized into MongoDB &amp; in-memory offline fallback store.
            </p>
          </div>
          <Link
            to="/login"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '10px 18px' }}
          >
            Go to Login Page <HiOutlineArrowRight />
          </Link>
        </div>

        {/* 3 Main Role Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Admin */}
          <div style={{ background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', display: 'block', marginBottom: '6px' }}>
              ADMIN PANEL
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
              Email: <code>admin2@gmail.com</code>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              Password: <code>Admin@123</code>
            </div>
            <button
              onClick={() => copyText('admin2@gmail.com', 'admin')}
              style={{ marginTop: '10px', fontSize: '0.72rem', background: '#7c3aed', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              {copiedKey === 'admin' ? 'Copied!' : 'Copy Email'}
            </button>
          </div>

          {/* Customer */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1d4ed8', display: 'block', marginBottom: '6px' }}>
              CUSTOMER PANEL (5 Options)
            </span>
            <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
              <code>rahul.shah@gmail.com</code>, <code>priya.patel@gmail.com</code>...
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              Password: <code>customer123</code>
            </div>
            <button
              onClick={() => copyText('rahul.shah@gmail.com', 'customer')}
              style={{ marginTop: '10px', fontSize: '0.72rem', background: '#2563eb', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              {copiedKey === 'customer' ? 'Copied!' : 'Copy Rahul Shah'}
            </button>
          </div>

          {/* B2B Partner */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', display: 'block', marginBottom: '6px' }}>
              B2B SOCIETY PANEL
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
              Email: <code>b2b@gmail.com</code>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              Password: <code>B2B@123</code>
            </div>
            <button
              onClick={() => copyText('b2b@gmail.com', 'b2b')}
              style={{ marginTop: '10px', fontSize: '0.72rem', background: '#d97706', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              {copiedKey === 'b2b' ? 'Copied!' : 'Copy Email'}
            </button>
          </div>
        </div>

        {/* 19 Workers Table */}
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          All 19 Worker Service Accounts (Password: <code>worker123</code>)
        </h4>
        <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '8px 12px' }}>No.</th>
                <th style={{ padding: '8px 12px' }}>Service Category</th>
                <th style={{ padding: '8px 12px' }}>Worker Email ID</th>
                <th style={{ padding: '8px 12px' }}>Password</th>
                <th style={{ padding: '8px 12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {WORKERS_LIST.map((w) => (
                <tr key={w.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{w.num}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{w.service}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#2563eb' }}>{w.email}</td>
                  <td style={{ padding: '8px 12px' }}><code>worker123</code></td>
                  <td style={{ padding: '8px 12px' }}>
                    <button
                      onClick={() => copyText(w.email, w.email)}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                    >
                      {copiedKey === w.email ? 'Copied!' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ProjectSummary;

