import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HiOutlineBolt,
  HiOutlineExclamationTriangle,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowLeft,
  HiOutlineWrench,
  HiOutlineKey,
  HiOutlineFire,
  HiOutlineBuildingOffice,
  HiOutlineTruck,
  HiOutlineHeart,
  HiOutlineShieldExclamation,
} from 'react-icons/hi2';
import { GlassCard, PrimaryButton, StatusPill, IconTile } from '../../components/ui';
import '../Dashboard.css';
import './CustomerPages.css';

const emergencyPresets = [
  {
    id: 'leakage',
    name: 'Major Water Leakage / Flood',
    description: 'Burst pipelines, overflowing overhead tanks, or active bathroom floods.',
    iconComponent: HiOutlineWrench,
    service: 'Water Leakage Plumber',
    price: 699,
    actionNeeded: 'Close the main washroom control valve immediately.',
    tone: 'bad'
  },
  {
    id: 'short-circuit',
    name: 'Short Circuit / Sparking Wire',
    description: 'Electrical spark noises, burning plastic smell, or total room blackout.',
    iconComponent: HiOutlineBolt,
    service: 'Electrical Emergency Specialist',
    price: 599,
    actionNeeded: 'Flip the main circuit breaker (MCB) switch to OFF immediately.',
    tone: 'bad'
  },
  {
    id: 'locked-out',
    name: 'Home Locked Out / Key Stuck',
    description: 'Keys lost, lock barrel jammed, or children locked inside a room.',
    iconComponent: HiOutlineKey,
    service: 'Emergency Locksmith',
    price: 499,
    actionNeeded: 'Do not attempt to force the handle. Wait for locksmith tools.',
    tone: 'warn'
  },
  {
    id: 'gas-leak',
    name: 'LPG Gas Cylinder Seepage',
    description: 'Pungent sulfur gas odor detected near kitchen stove or cylinder.',
    iconComponent: HiOutlineFire,
    service: 'Gas Line Emergency Specialist',
    price: 799,
    actionNeeded: 'Open all windows immediately. Do NOT turn on any light switches.',
    tone: 'bad'
  },
  {
    id: 'roof-collapse',
    name: 'Roof Collapse & Structural Risk',
    description: 'Severe ceiling plaster cracking, concrete crumbling, or structural sagging.',
    iconComponent: HiOutlineBuildingOffice,
    service: 'Civil Structure Expert',
    price: 999,
    actionNeeded: 'Evacuate the affected room/area immediately and stay away from load-bearing beams.',
    tone: 'bad'
  },
  {
    id: 'vehicle-breakdown',
    name: 'Roadside Vehicle Breakdown',
    description: 'Car/bike engine failure, flat tyre puncture on highway, or battery dead mid-transit.',
    iconComponent: HiOutlineTruck,
    service: 'On-Demand Emergency Mechanic',
    price: 399,
    actionNeeded: 'Park the vehicle safely on the shoulder, turn on hazard lights, and wait in a safe area.',
    tone: 'warn'
  },
  {
    id: 'medical-first-aid',
    name: 'Immediate Paramedic First Aid',
    description: 'Minor household burns, sprains, high fever spikes, or emergency dressing assistance.',
    iconComponent: HiOutlineHeart,
    service: 'Home Paramedic Attendant',
    price: 499,
    actionNeeded: 'Apply basic first aid if trained, keep the patient calm, and do not self-medicate.',
    tone: 'bad'
  },
  {
    id: 'animal-removal',
    name: 'Emergency Animal/Stray Removal',
    description: 'Stray dogs, snakes, wild monkeys, or dangerous nests inside residential premises.',
    iconComponent: HiOutlineShieldExclamation,
    service: 'Verified Wildlife/Stray Expert',
    price: 599,
    actionNeeded: 'Keep a safe distance, do not lock eyes, and monitor the animal from a secure room.',
    tone: 'warn'
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
    const cat = preset.id === 'vehicle-breakdown' ? 'vehicle-services' : 'home-repairs';
    navigate(`/customer/book?service=${encodeURIComponent(getPresetService(preset))}&category=${cat}&price=${preset.price}&expressMode=true`);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = emergencyPresets.filter((p) =>
    getPresetName(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getPresetDesc(p).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content" style={{ minHeight: '92vh' }}>
      <Link to="/customer/services" className="back-btn">
        <HiOutlineArrowLeft /> Back to Directory
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <IconTile icon={HiOutlineExclamationTriangle} tone="bad" />
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>
              Emergency Services Hub
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--ink2)', margin: 0, marginTop: '2px' }}>
              Instant priority dispatch — under 15 minute guaranteed response
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="sunken" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', marginBottom: '24px' }}>
        <HiOutlineMagnifyingGlass style={{ color: 'var(--blue)', fontSize: '1.25rem', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search emergency services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 0, outline: 0, flex: 1, fontSize: '0.92rem', color: 'var(--ink)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}
          >
            <HiOutlineXMark />
          </button>
        )}
      </div>

      {/* Preset Grid Selection */}
      <GlassCard style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.18rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '20px' }}>
          {t('emergencyHub.selectScenario', 'Select Your Emergency Scenario to Book Instantly')}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredPresets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--ink3)', gridColumn: '1 / -1' }}>
              No emergency services match your search.
            </div>
          )}
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleBookEmergency(preset)}
              className="glass is-clickable"
              style={{
                padding: '22px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <IconTile icon={preset.iconComponent} tone={preset.tone} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>
                    {getPresetName(preset)}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink2)', margin: 0, lineHeight: 1.45 }}>
                    {getPresetDesc(preset)}
                  </p>
                </div>
              </div>

              <div className="sunken" style={{ padding: '12px 14px', marginTop: 'auto', borderColor: 'rgba(214, 94, 88, 0.25)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--status-danger-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  Immediate Action:
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink2)', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                  {getPresetAction(preset)}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(22, 70, 214, 0.08)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
                  ₹{preset.price}
                </div>
                <PrimaryButton
                  danger={true}
                  style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                >
                  Book Priority
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default EmergencyHub;
