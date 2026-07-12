import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBolt, HiOutlineShieldCheck, HiOutlineExclamationTriangle, HiOutlineMapPin
} from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const emergencyPresets = [
  {
    id: 'leakage',
    name: 'Major Water Leakage / Flood',
    description: 'Burst pipelines, overflowing overhead tanks, or active bathroom floods.',
    icon: '💧',
    service: 'Water Leakage Plumber',
    price: 699,
    actionNeeded: 'Close the main washroom control valve immediately.'
  },
  {
    id: 'short-circuit',
    name: 'Short Circuit / Sparking Wire',
    description: 'Electrical spark noises, burning plastic smell, or total room blackout.',
    icon: '⚡',
    service: 'Electrical Emergency Specialist',
    price: 599,
    actionNeeded: 'Flip the main circuit breaker (MCB) switch to OFF immediately.'
  },
  {
    id: 'locked-out',
    name: 'Home Locked Out / Key Stuck',
    description: 'Keys lost, lock barrel jammed, or children locked inside a room.',
    icon: '🔑',
    service: 'Emergency Locksmith',
    price: 499,
    actionNeeded: 'Do not attempt to force the handle. Wait for locksmith tools.'
  },
  {
    id: 'gas-leak',
    name: 'LPG Gas Cylinder Seepage',
    description: 'Pungent sulfur gas odor detected near kitchen stove or cylinder.',
    icon: '⛽',
    service: 'Gas Line Emergency Specialist',
    price: 799,
    actionNeeded: 'Open all windows immediately. Do NOT turn on any light switches.'
  },
  {
    id: 'roof-collapse',
    name: 'Roof Collapse & Structural Risk',
    description: 'Severe ceiling plaster cracking, concrete crumbling, or structural sagging.',
    icon: '🏚️',
    service: 'Civil Structure Expert',
    price: 999,
    actionNeeded: 'Evacuate the affected room/area immediately and stay away from load-bearing beams.'
  },
  {
    id: 'vehicle-breakdown',
    name: 'Roadside Vehicle Breakdown',
    description: 'Car/bike engine failure, flat tyre puncture on highway, or battery dead mid-transit.',
    icon: '🚗',
    service: 'On-Demand Emergency Mechanic',
    price: 399,
    actionNeeded: 'Park the vehicle safely on the shoulder, turn on hazard lights, and wait in a safe area.'
  },
  {
    id: 'medical-first-aid',
    name: 'Immediate Paramedic First Aid',
    description: 'Minor household burns, sprains, high fever spikes, or emergency dressing assistance.',
    icon: '🚑',
    service: 'Home Paramedic Attendant',
    price: 499,
    actionNeeded: 'Apply basic first aid if trained, keep the patient calm, and do not self-medicate.'
  },
  {
    id: 'animal-removal',
    name: 'Emergency Animal/Stray Removal',
    description: 'Stray dogs, snakes, wild monkeys, or dangerous nests inside residential premises.',
    icon: '🐍',
    service: 'Verified Wildlife/Stray Expert',
    price: 599,
    actionNeeded: 'Keep a safe distance, do not lock eyes, and monitor the animal from a secure room.'
  }
];

const presetKeyMap = {
  'leakage': 'leakage',
  'short-circuit': 'shortCircuit',
  'locked-out': 'lockedOut',
  'gas-leak': 'gasLeak',
  'roof-collapse': 'roofCollapse',
  'vehicle-breakdown': 'breakdown',
  'medical-first-aid': 'medical',
  'animal-removal': 'animal'
};

const EmergencyHub = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getPresetName = (preset) => t(`emergencyHub.presets.${presetKeyMap[preset.id]}.name`, preset.name);
  const getPresetDesc = (preset) => t(`emergencyHub.presets.${presetKeyMap[preset.id]}.desc`, preset.description);
  const getPresetAction = (preset) => t(`emergencyHub.presets.${presetKeyMap[preset.id]}.action`, preset.actionNeeded);
  const getPresetService = (preset) => t(`emergencyHub.presets.${presetKeyMap[preset.id]}.service`, preset.service);

  const handleBookEmergency = (preset) => {
    navigate(`/customer/book?service=${encodeURIComponent(getPresetService(preset))}&price=${preset.price}&expressMode=true`);
  };

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      
      {/* GLOWING CRIMSON URGENCY HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 30px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
        border: '2.5px solid #ef4444'
      }}>
        {/* Pulsing Neon Warning Ring */}
        <div style={{
          position: 'absolute', top: '12px', right: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(239, 68, 68, 0.25)',
          padding: '4px 12px', borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem', fontWeight: 800, border: '1px solid #f87171'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'block', animation: 'pulse 1s infinite' }} />
          <span>{t('emergencyHub.priorityActive')}</span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <h1 className="page-title" style={{ color: 'white', fontSize: '2.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineBolt style={{ animation: 'bounce 2s infinite', color: '#f59e0b' }} /> {t('customer.emergencyHub')} 🚨
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '0.95rem', marginTop: '8px', lineHeight: 1.5 }}>
            {t('emergencyHub.emergencySubtitle')}
          </p>
        </div>
      </div>

      {/* Preset Grid Selection */}
      <div className="card" style={{ padding: '24px', border: '1px solid var(--gray-200)', background: 'white', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '20px' }}>
          {t('emergencyHub.selectScenario', 'Select Your Emergency Scenario to Book Instantly')}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {emergencyPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleBookEmergency(preset)}
              className="hover-lift"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--gray-200)',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '2.2rem' }}>{preset.icon}</span>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--navy-800)', margin: '0 0 4px 0' }}>{getPresetName(preset)}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.4 }}>{getPresetDesc(preset)}</p>
                </div>
              </div>
              
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #fee2e2', marginTop: 'auto' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b', margin: '0 0 4px 0' }}>⚠️ Immediate Action:</h5>
                <p style={{ fontSize: '0.8rem', color: '#b91c1c', margin: 0, fontWeight: 600 }}>{getPresetAction(preset)}</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--navy-800)' }}>₹{preset.price}</div>
                <button className="btn" style={{ padding: '8px 16px', background: '#ef4444', color: 'white', fontWeight: 800, border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EmergencyHub;
