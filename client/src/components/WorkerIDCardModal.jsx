import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiPrinter, HiArrowDownTray, HiOutlineShieldCheck } from 'react-icons/hi2';

const WorkerIDCardModal = ({ worker, onClose }) => {
  const printRef = useRef(null);

  if (!worker) return null;

  const workerIdCode = worker.workerIdCode || `SC-W-${(worker._id || worker.id || '').toString().slice(-4).toUpperCase() || '1001'}`;
  const name = worker.name || 'ServeCircle Worker';
  const role = worker.serviceCategory || worker.skills?.[0] || 'Certified Service Professional';
  const phone = worker.phone || 'N/A';
  const photo = worker.avatar || worker.profilePicture || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80';
  const isVerified = worker.isVerified || worker.status === 'approved' || worker.workerStatus?.includes('approved');

  const verificationUrl = `${window.location.origin}/verify-worker?code=${encodeURIComponent(workerIdCode)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print ID card.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ServeCircle Official ID Card - ${name}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #f8fafc;
              color: #0f172a;
              padding: 20px;
              margin: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .header-print {
              text-align: center;
              margin-bottom: 24px;
            }
            .header-print h2 {
              margin: 0 0 6px 0;
              color: #1e3a5f;
              font-size: 24px;
            }
            .header-print p {
              margin: 0;
              color: #64748b;
              font-size: 14px;
            }
            .cards-container {
              display: flex;
              gap: 30px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 30px;
            }
            .id-card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
              border-radius: 12px;
              padding: 16px;
              color: white;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
              position: relative;
              box-sizing: border-box;
              border: 1.5px solid #38bdf8;
              overflow: hidden;
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 6px;
              font-weight: 900;
              font-size: 16px;
            }
            .badge {
              background: #22c55e;
              color: white;
              font-size: 9px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 10px;
              text-transform: uppercase;
            }
            .card-body {
              display: flex;
              gap: 12px;
              align-items: center;
            }
            .avatar {
              width: 54px;
              height: 54px;
              border-radius: 8px;
              object-fit: cover;
              border: 2px solid #38bdf8;
            }
            .info {
              flex: 1;
              font-size: 11px;
            }
            .info .label {
              font-size: 8px;
              opacity: 0.7;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info .val-name {
              font-size: 14px;
              font-weight: 800;
              color: white;
              margin-bottom: 4px;
            }
            .info .val-id {
              font-size: 12px;
              font-weight: 800;
              color: #fef08a;
            }
            .qr-box {
              background: white;
              padding: 4px;
              border-radius: 8px;
              text-align: center;
              width: 54px;
              height: 54px;
            }
            .qr-box img {
              width: 100%;
              height: 100%;
              display: block;
            }
            .card-footer {
              margin-top: 10px;
              padding-top: 6px;
              border-top: 1px solid rgba(255,255,255,0.15);
              font-size: 8px;
              opacity: 0.8;
              text-align: center;
            }
            @media print {
              body { background: white; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-print no-print">
            <h2>ServeCircle Verified Worker ID Card</h2>
            <p>Ready to print or save as PDF (CR80 Standard Standard Badge Size)</p>
            <button onclick="window.print()" style="margin-top:12px; padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:6px; font-weight:700; cursor:pointer;">
              🖨️ Trigger Printer / Save PDF
            </button>
          </div>

          <div class="cards-container">
            <!-- FRONT OF CARD -->
            <div class="id-card">
              <div class="card-header">
                <div class="brand">
                  <span style="background:#2563eb; padding:2px 6px; border-radius:4px;">SC</span>
                  ServeCircle
                </div>
                <span class="badge">${isVerified ? 'VERIFIED PRO' : 'OFFICIAL ID'}</span>
              </div>
              <div class="card-body">
                <img class="avatar" src="${photo}" alt="" />
                <div class="info">
                  <div class="label">Worker Name</div>
                  <div class="val-name">${name}</div>
                  <div class="label">Worker ID</div>
                  <div class="val-id">${workerIdCode}</div>
                  <div class="label">Specialization</div>
                  <div style="color:#93c5fd; font-weight:700;">${role}</div>
                </div>
                <div class="qr-box">
                  <img src="${qrImageUrl}" alt="Scan QR" />
                </div>
              </div>
              <div class="card-footer">
                Official Permanent ID · Scan QR code with camera to verify background authorization
              </div>
            </div>
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 600);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: 'white', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ServeCircle Official ID Card
                <HiOutlineShieldCheck style={{ color: '#2563eb', fontSize: '1.3rem' }} />
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>Scan QR to verify live authorization</p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#64748b' }}>
              <HiXMark />
            </button>
          </div>

          {/* Visual CR80 Card Preview */}
          <div ref={printRef} style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
            borderRadius: '16px', padding: '24px', color: 'white', border: '2px solid #38bdf8',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', position: 'relative', overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#2563eb', color: 'white', width: '32px', height: '32px', borderRadius: '8px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                  SC
                </div>
                <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.03em' }}>ServeCircle</span>
              </div>
              <span style={{ fontSize: '0.65rem', background: isVerified ? '#22c55e' : '#f59e0b', color: 'white', fontWeight: 800, padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase' }}>
                {isVerified ? 'VERIFIED PRO' : 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <img src={photo} alt="" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #38bdf8', flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worker Name</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>

                <div style={{ fontSize: '0.68rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Worker ID</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fef08a' }}>{workerIdCode}</div>

                <div style={{ fontSize: '0.68rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Role</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#93c5fd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role}</div>
              </div>

              {/* REAL SCANNABLE QR CODE IMAGE */}
              <div style={{
                background: 'white', padding: '6px', borderRadius: '10px', textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexShrink: 0, width: '76px', height: '76px',
              }}>
                <img src={qrImageUrl} alt="Scan QR" style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'contain' }} />
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '0.65rem', opacity: 0.75, textAlign: 'center' }}>
              Official ServeCircle ID · Scan QR code with any phone camera to verify status
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={handlePrint}>
              <HiPrinter style={{ fontSize: '1.1rem' }} /> Print Official ID Card
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WorkerIDCardModal;
