import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconTile, StatusPill } from '../../components/ui';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineHeart, HiOutlineVideoCamera, HiOutlineMapPin, HiOutlineSparkles, HiOutlineClipboardDocumentList, HiOutlineShoppingBag, HiOutlineDocumentArrowUp, HiOutlineTrash } from 'react-icons/hi2';
import '../Dashboard.css';
import './CustomerPages.css';

const PetHub = () => {
 const { t } = useTranslation();
 
 const savedProfile = (() => {
 try {
 const stored = localStorage.getItem('servecircle_pet_profile');
 return stored ? JSON.parse(stored) : null;
 } catch {
 return null;
 }
 })();

 const [petProfile, setPetProfile] = useState(savedProfile || {
 name: 'Max',
 type: 'Dog',
 breed: 'Golden Retriever',
 age: '2 Years',
 specialNeeds: 'Sensitve Skin'
 });
 const [showProfileForm, setShowProfileForm] = useState(false);
 const [tempProfile, setTempProfile] = useState({ ...petProfile });
 
 const [showWalkTracker, setShowWalkTracker] = useState(false);
 const [mapUrl, setMapUrl] = useState("https://maps.google.com/maps?q=12.9226343,77.6253457&t=&z=15&ie=UTF8&output=embed");

 const savedDocs = (() => {
 try {
 const stored = localStorage.getItem('servecircle_pet_health_vault');
 return stored ? JSON.parse(stored) : null;
 } catch {
 return null;
 }
 })();

 const [healthDocs, setHealthDocs] = useState(savedDocs || [
 { id: '1', title: 'Anti-Rabies Certificate', date: 'Uploaded 12 Oct 2026', status: 'Active Verified', color: 'var(--status-success-text)', bg: 'var(--status-success-tint)', border: 'var(--status-success-text)' },
 { id: '2', title: 'Annual Booster Shot', date: 'Due in 18 days', status: 'Action Required', color: 'var(--status-warning-text)', bg: 'var(--status-warning-tint)', border: 'var(--status-warning-text)' }
 ]);

 useEffect(() => {
 if (showWalkTracker && "geolocation" in navigator) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 const lat = position.coords.latitude;
 const lng = position.coords.longitude;
 setMapUrl(`https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&output=embed`);
 },
 (error) => console.warn("Geolocation denied or failed, using default map.")
 );
 }
 }, [showWalkTracker]);

 const handleSaveProfile = (e) => {
 e.preventDefault();
 setPetProfile({ ...tempProfile });
 try {
 localStorage.setItem('servecircle_pet_profile', JSON.stringify(tempProfile));
 } catch (err) {
 console.warn("Could not save to localStorage", err);
 }
 setShowProfileForm(false);
 };

 const handleDocUpload = (e) => {
 if (e.target.files && e.target.files[0]) {
 const file = e.target.files[0];
 const newDoc = {
 id: Date.now().toString(),
 title: file.name.substring(0, 28),
 date: `Uploaded ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
 status: 'Uploaded',
 color: 'var(--status-success-text)',
 bg: 'var(--status-success-tint)',
 border: 'var(--status-success-text)'
 };
 const updated = [newDoc, ...healthDocs];
 setHealthDocs(updated);
 try {
 localStorage.setItem('servecircle_pet_health_vault', JSON.stringify(updated));
 } catch (err) {
 console.warn(err);
 }
 }
 };

 const handleDeleteDoc = (id) => {
 const updated = healthDocs.filter(d => d.id !== id);
 setHealthDocs(updated);
 try {
 localStorage.setItem('servecircle_pet_health_vault', JSON.stringify(updated));
 } catch (err) {}
 };

 return (
 <div className="page-content" style={{ minHeight: '92vh', paddingBottom: '60px' }}>
 
 {/* Back Button */}
 <Link to="/customer/general-services" className="sidebar-link" style={{
 display: 'inline-flex', alignItems: 'center', gap: '8px',
 color: 'var(--navy-600)', fontWeight: 700, fontSize: '0.85rem',
 textDecoration: 'none', marginBottom: '20px', width: 'fit-content'
 }}>
 <HiOutlineArrowLeft /> Back to General Services
 </Link>



 {/* TOP SECTION: Dashboard (Profile & Health Vault) */}
 <div style={{
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
 gap: '28px',
 marginBottom: '40px'
 }}>
 
 {/* Interactive Pet Profile Card */}
 <div className="glass" style={{
 border: '1px solid var(--glass-edge)',
 borderRadius: '26px',
 padding: '28px',
 boxShadow: 'var(--sh-card)'
 }}>
 <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <HiOutlineHeart style={{ color: 'var(--accent-rose-text)' }} /> {t('petHub.customizer')}
 </h3>
 <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '20px' }}>
 {t('petHub.customizerDesc')}
 </p>

 {!showProfileForm ? (
 <div style={{
 background: 'linear-gradient(135deg, var(--accent-rose-tint) 0%, var(--accent-rose-tint) 100%)',
 border: '1px solid rgba(236,72,153,0.15)',
 borderRadius: '16px',
 padding: '20px',
 position: 'relative',
 overflow: 'hidden'
 }}>
 <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '5rem', opacity: 0.15 }}></div>
 <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-rose-text)', margin: '0 0 10px 0' }}>{petProfile.name} </h4>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--accent-rose-text)' }}>
 <span> <strong>{t('petHub.typeBreed')}:</strong> {t('petHub.' + (petProfile?.type || 'Dog').toLowerCase(), petProfile.type)} ({petProfile.breed})</span>
 <span> <strong>{t('petHub.age')}:</strong> {petProfile.age}</span>
 <span> <strong>{t('petHub.specialNeeds')}:</strong> {petProfile.specialNeeds || t('petHub.none', 'None')}</span>
 </div>
 <button onClick={() => { setTempProfile({ ...petProfile }); setShowProfileForm(true); }} style={{ marginTop: '16px', background: 'var(--accent-rose-text)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
 {t('petHub.editProfileCard')}
 </button>
 </div>
 ) : (
 <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.petName')}</label>
 <input type="text" value={tempProfile.name} onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-edge)', fontSize: '0.82rem' }} required />
 </div>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.petType')}</label>
 <select value={tempProfile.type} onChange={(e) => setTempProfile({ ...tempProfile, type: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-edge)', fontSize: '0.82rem' }}>
 <option value="Dog">{t('petHub.dog')}</option>
 <option value="Cat">{t('petHub.cat')}</option>
 <option value="Rabbit">{t('petHub.rabbit')}</option>
 <option value="Bird">{t('petHub.bird')}</option>
 </select>
 </div>
 <div>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.breed')}</label>
 <input type="text" value={tempProfile.breed} onChange={(e) => setTempProfile({ ...tempProfile, breed: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-edge)', fontSize: '0.82rem' }} />
 </div>
 <div style={{ display: 'flex', gap: '10px' }}>
 <div style={{ flex: 1 }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.age')}</label>
 <input type="text" value={tempProfile.age} onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-edge)', fontSize: '0.82rem' }} />
 </div>
 <div style={{ flex: 1 }}>
 <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-800)', display: 'block', marginBottom: '4px' }}>{t('petHub.specialNeeds')}</label>
 <input type="text" value={tempProfile.specialNeeds} onChange={(e) => setTempProfile({ ...tempProfile, specialNeeds: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--glass-edge)', fontSize: '0.82rem' }} />
 </div>
 </div>
 <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
 <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '8px' }}>{t('petHub.saveProfile')}</button>
 <button type="button" onClick={() => setShowProfileForm(false)} className="btn btn-outline-secondary btn-sm" style={{ flex: 1, padding: '8px' }}>{t('petHub.cancel')}</button>
 </div>
 </form>
 )}
 </div>

 {/* Digital Pet Health Vault */}
 <div className="glass" style={{
 border: '1px solid var(--glass-edge)',
 borderRadius: '26px',
 padding: '28px',
 boxShadow: 'var(--sh-card)'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
 <div style={{ background: 'var(--accent-violet-tint)', color: 'var(--accent-violet-text)', padding: '12px', borderRadius: '12px', fontSize: '1.5rem' }}>
 <HiOutlineClipboardDocumentList />
 </div>
 <div>
 <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-800)', fontWeight: 800, margin: '0 0 4px 0' }}>Digital Pet Health Vault </h3>
 <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>{t('petHubExt.vaultDesc')}</p>
 </div>
 </div>
 
 <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
 <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
 {healthDocs.map(doc => (
 <div key={doc.id} style={{ background: doc.bg || 'var(--bg-page)', borderLeft: `4px solid ${doc.border || 'var(--status-success-text)'}`, padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <div>
 <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>{doc.title}</div>
 <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{doc.date}</div>
 </div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontSize: '0.72rem', background: 'var(--glass)', color: doc.color || 'var(--status-success-text)', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid var(--glass-edge)' }}>
 {doc.status}
 </span>
 <button 
 type="button" 
 onClick={() => handleDeleteDoc(doc.id)} 
 title="Remove Record"
 style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: '0.85rem' }}
 >
 
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Real File Upload Input */}
 <label style={{
 background: 'var(--bg-page)',
 border: '1.5px dashed var(--glass-edge)',
 borderRadius: '12px',
 padding: '14px',
 textAlign: 'center',
 cursor: 'pointer',
 display: 'block',
 transition: 'all 0.2s'
 }}>
 <HiOutlineDocumentArrowUp size={22} style={{ color: 'var(--ink-3)', marginBottom: '4px' }} />
 <div style={{ fontSize: '0.82rem', fontWeight: 750, color: 'var(--navy-700)' }}>+ Upload Vaccination / Prescription</div>
 <span style={{ fontSize: '0.68rem', color: 'var(--gray-400)' }}>Supports PNG, JPG, or PDF records</span>
 <input 
 type="file" 
 accept="image/*,application/pdf" 
 onChange={handleDocUpload}
 style={{ display: 'none' }} 
 />
 </label>
 </div>
 </div>

 </div>

 {/* MIDDLE SECTION: Services Grid */}
	<div style={{
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
		gap: '24px',
		marginBottom: '40px'
	}}>
		{/* Grooming */}
		<div 
			className="glass is-clickable" 
			style={{ 
				borderRadius: '26px', 
				padding: '26px', 
				display: 'flex', 
				flexDirection: 'column', 
				boxShadow: 'var(--sh-card)',
				transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
				<IconTile icon={HiOutlineSparkles} tone="teal" size={44} />
				<StatusPill status="Confirmed" label="Doorstep Spa" />
			</div>
			<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Premium Grooming</h4>
			<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-teal-text)', marginBottom: '10px' }}>₹599</span>
			<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{t('petHub.groomingDesc')}</p>
			<Link 
				to={`/customer/book?service=${encodeURIComponent('Premium Pet Grooming')}&serviceId=pet-grooming&category=pet-services&price=599&petName=${encodeURIComponent(petProfile.name)}&petBreed=${encodeURIComponent(petProfile.breed)}&petType=${encodeURIComponent(petProfile.type)}&specialNeeds=${encodeURIComponent(petProfile.specialNeeds || '')}`} 
				className="btn-primary" 
				style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}
			>
				Book Grooming for {petProfile.name}
			</Link>
		</div>

		{/* Vet */}
		<div 
			className="glass is-clickable" 
			style={{ 
				borderRadius: '26px', 
				padding: '26px', 
				display: 'flex', 
				flexDirection: 'column', 
				boxShadow: 'var(--sh-card)',
				transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
				<IconTile icon={HiOutlineHeart} tone="rose" size={44} />
				<StatusPill status="Completed" label="Verified Vet" />
			</div>
			<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Vet Home Checkup</h4>
			<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '10px' }}>₹799</span>
			<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>{t('petHub.vetDesc')}</p>
			<Link 
				to={`/customer/book?service=${encodeURIComponent('Vet Checkup')}&serviceId=vet-visit&category=pet-services&price=799&petName=${encodeURIComponent(petProfile.name)}&petBreed=${encodeURIComponent(petProfile.breed)}&petType=${encodeURIComponent(petProfile.type)}&specialNeeds=${encodeURIComponent(petProfile.specialNeeds || '')}`} 
				className="btn-primary" 
				style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}
			>
				Book Vet for {petProfile.name}
			</Link>
		</div>

		{/* Dog Walking */}
		<div 
			className="glass is-clickable" 
			style={{ 
				borderRadius: '26px', 
				padding: '26px', 
				display: 'flex', 
				flexDirection: 'column', 
				boxShadow: 'var(--sh-card)',
				transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
				<IconTile icon={HiOutlineMapPin} tone="blue" size={44} />
				<StatusPill status="In progress" label="GPS Tracked" />
			</div>
			<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Daily Dog Walking</h4>
			<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '10px' }}>₹199</span>
			<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>45-min guided walk for {petProfile.name} with live GPS tracking.</p>
			<div style={{ display: 'flex', gap: '8px' }}>
				<Link 
					to={`/customer/book?service=${encodeURIComponent('Daily Dog Walking')}&serviceId=pet-walking&category=pet-services&price=199&petName=${encodeURIComponent(petProfile.name)}&petBreed=${encodeURIComponent(petProfile.breed)}&petType=${encodeURIComponent(petProfile.type)}&specialNeeds=${encodeURIComponent(petProfile.specialNeeds || '')}`} 
					className="btn-primary" 
					style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
				>
					Book Walk
				</Link>
				<button onClick={() => setShowWalkTracker(!showWalkTracker)} className="btn-secondary" style={{ flex: 1, cursor: 'pointer' }}>Demo</button>
			</div>
		</div>
	</div>

	<h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
 <HiOutlineSparkles style={{ color: 'var(--accent-violet-text)' }} /> Premium Add-ons
 </h3>

 <div style={{
 display: 'grid',
 gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
 gap: '24px',
 marginBottom: '40px'
 }}>
 {/* Boarding */}
				<div 
					className="glass is-clickable" 
					style={{ 
						borderRadius: '26px', 
						padding: '26px', 
						display: 'flex', 
						flexDirection: 'column', 
						boxShadow: 'var(--sh-card)',
						transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
						<IconTile icon={HiOutlineShieldCheck} tone="coral" size={44} />
						<StatusPill status="Cancelled" label="Cage-Free Verified" />
					</div>
					<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Pet Boarding & Sitting</h4>
					<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--status-danger-text)', marginBottom: '8px' }}>₹899<span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-3)'}}>/night</span></span>
					<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
						Verified homestays for {petProfile.name} while you travel. Includes 3x daily WhatsApp video updates, fenced lawns & 24/7 vet on call.
					</p>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>3x Daily Videos</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Police Checked</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Custom Diet</span>
					</div>
					<Link to={`/customer/pet-flow?type=boarding&petName=${encodeURIComponent(petProfile.name)}&petType=${encodeURIComponent(petProfile.type)}&petBreed=${encodeURIComponent(petProfile.breed)}`} className="btn-primary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}>Book Boarding</Link>
				</div>

				{/* Training */}
				<div 
					className="glass is-clickable" 
					style={{ 
						borderRadius: '26px', 
						padding: '26px', 
						display: 'flex', 
						flexDirection: 'column', 
						boxShadow: 'var(--sh-card)',
						transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
						<IconTile icon={HiOutlineClipboardDocumentList} tone="amber" size={44} />
						<StatusPill status="Pending" label="100% Force-Free" />
					</div>
					<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Certified Training</h4>
					<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--status-warning-text)', marginBottom: '8px' }}>₹1,299<span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-3)'}}>/session</span></span>
					<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
						In-home obedience, leash-pulling, and behavioral mastery with KCI-certified positive reinforcement trainers.
					</p>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>LIMA Certified</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Zero Shock Collars</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Trial Available</span>
					</div>
					<Link to={`/customer/pet-flow?type=training&petName=${encodeURIComponent(petProfile.name)}&petType=${encodeURIComponent(petProfile.type)}&petBreed=${encodeURIComponent(petProfile.breed)}`} className="btn-primary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}>Book Trainer</Link>
				</div>

				{/* Photography */}
				<div 
					className="glass is-clickable" 
					style={{ 
						borderRadius: '26px', 
						padding: '26px', 
						display: 'flex', 
						flexDirection: 'column', 
						boxShadow: 'var(--sh-card)',
						transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease'
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
						<IconTile icon={HiOutlineSparkles} tone="purple" size={44} />
						<StatusPill status="In progress" label="Studio & Park" />
					</div>
					<h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>Pet Photography</h4>
					<span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--purple, #7c3aed)', marginBottom: '8px' }}>₹2,499<span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-3)'}}> onwards</span></span>
					<p style={{ fontSize: '0.85rem', color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
						Professional photoshoot with patient animal handlers, squeaker toys, organic treats, and framed keepsake album.
					</p>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>15+ Retouched Photos</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Framed Print</span>
						<span style={{ fontSize: '0.72rem', background: 'var(--bg-page)', border: '1px solid var(--glass-edge)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: '6px' }}>Calming Pacing</span>
					</div>
					<Link to={`/customer/pet-flow?type=photography&petName=${encodeURIComponent(petProfile.name)}&petType=${encodeURIComponent(petProfile.type)}&petBreed=${encodeURIComponent(petProfile.breed)}`} className="btn-primary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}>Book Photoshoot</Link>
				</div>
			</div>

			{/* BOTTOM SECTION */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
				
				{/* Custom Pet Supplies Subscription */}
				<div className="glass" style={{
					background: 'linear-gradient(135deg, var(--status-success-tint) 0%, var(--status-success-tint) 100%)',
					border: '1px solid var(--status-success-ring)',
					borderRadius: '26px',
					padding: '28px',
					boxShadow: 'var(--sh-card)',
					display: 'flex',
					flexWrap: 'wrap',
					gap: '24px',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}>
					<div style={{ flex: '1 1 300px' }}>
						<div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--glass)', color: 'var(--status-success-text)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
							<HiOutlineShoppingBag size={16} /> Monthly Delivery • Zero Lock-In
						</div>
						<h3 style={{ fontSize: '1.4rem', color: 'var(--navy-900)', fontWeight: 900, margin: '0 0 8px 0' }}>Custom Box for {petProfile.name} </h3>
						<p style={{ fontSize: '0.9rem', color: 'var(--status-success-text)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
							Premium {(petProfile?.type || 'Dog').toLowerCase()} food, healthy treats, and grooming supplies delivered to your door on the 1st of every month. Tailored for {petProfile.breed}s.
						</p>
						<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
							<span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.7)', color: 'var(--status-success-text)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>• Tailored Nutrition</span>
							<span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.7)', color: 'var(--status-success-text)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>• Free Express Delivery</span>
							<span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.7)', color: 'var(--status-success-text)', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>• 1-Click Pause/Skip</span>
						</div>
					</div>
				<div>
					<Link to={`/customer/pet-flow?type=subscription&petName=${encodeURIComponent(petProfile.name)}&petType=${encodeURIComponent(petProfile.type)}&petBreed=${encodeURIComponent(petProfile.breed)}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
						Configure Subscription
					</Link>
				</div>
			</div>
			
			{/* Emergency Vet Video Consult CTA */}
			<div className="glass" style={{
				background: 'linear-gradient(135deg, var(--status-danger-text) 0%, var(--status-danger-text) 100%)',
				color: 'white',
				padding: '30px',
				borderRadius: '26px',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '16px',
				justifyContent: 'space-between',
				alignItems: 'center',
				boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
			}}>
				<div>
					<h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
						<span style={{ background: 'var(--glass)', color: 'var(--status-danger-text)', padding: '6px', borderRadius: '50%', display: 'flex' }}>
							<HiOutlineVideoCamera size={24} />
						</span>
						Emergency Vet Consult 24/7
					</h3>
					<p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--status-danger-tint)' }}>
						Connect with a certified veterinarian via video call instantly. First 5 mins are free.
					</p>
				</div>
				<Link 
					to={`/customer/video-consultation?specialty=vet&petName=${encodeURIComponent(petProfile.name)}&breed=${encodeURIComponent(petProfile.breed)}&instant=true`}
					className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}
				>
					Connect Live Now
				</Link>
			</div>

			{/* Live Dog Walk Tracker Widget */}
 {showWalkTracker && (
 <div className="card animate-fade-in-up" style={{
 background: 'var(--glass)',
 border: '1px solid var(--glass-edge)',
 borderRadius: '26px',
 padding: '24px',
 boxShadow: 'var(--sh-card)'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 <div>
 <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-800)', fontWeight: 800, margin: 0 }}>
 Live Walk Tracker: {petProfile.name} 
 </h3>
 <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
 Walker: Amit Singh • Route: Neighborhood Park
 </p>
 </div>
 <span style={{ background: 'var(--status-success-tint)', color: 'var(--status-success-text)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
 <span className="pulse-dot" style={{ width: '8px', height: '8px', background: 'var(--status-success-text)', borderRadius: '50%', display: 'inline-block' }}></span> Active
 </span>
 </div>

 <div style={{ width: '100%', height: '350px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-edge)' }}>
 <iframe
 src={mapUrl}
 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, zIndex: 1, filter: 'grayscale(0.1) contrast(1.1)' }}
 loading="lazy"
 title="Pet Walk Tracker"
 />
 <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', zIndex: 2, pointerEvents: 'none' }} />
 
 <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
 <path
 d="M 20 80 Q 50 20 80 80"
 fill="none"
 stroke="var(--blue)"
 strokeWidth="2"
 strokeDasharray="4 2"
 />
 </svg>

 <div style={{
 position: 'absolute', top: '80%', left: '20%', transform: 'translate(-50%, -50%)',
 zIndex: 10, textAlign: 'center'
 }}>
 <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
 
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default PetHub;
