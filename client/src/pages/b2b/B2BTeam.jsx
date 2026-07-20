import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineEnvelope,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const initialMembers = [
  { id: 1, name: 'Rudra Shah', email: 'rudra@greenvalley.in', role: 'Admin', location: 'All Locations', status: 'active' },
  { id: 2, name: 'Priya Desai', email: 'priya@greenvalley.in', role: 'HR Manager', location: 'Block A, Block B', status: 'active' },
  { id: 3, name: 'Amit Patel', email: 'amit@greenvalley.in', role: 'Finance Manager', location: 'Club House', status: 'pending' },
];

const roleOptions = ['Admin', 'HR Manager', 'Finance Manager', 'Operations', 'Viewer'];

const B2BTeam = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('b2bTeamMembers');
    if (saved) return JSON.parse(saved);
    return initialMembers;
  });
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    role: roleOptions[1],
    location: '',
  });

  useEffect(() => {
    localStorage.setItem('b2bTeamMembers', JSON.stringify(members));
  }, [members]);

  const updateInvite = (key, value) => setInvite((current) => ({ ...current, [key]: value }));

  const handleInvite = () => {
    if (!invite.name || !invite.email) return;
    setMembers((current) => ([
      ...current,
      { id: Date.now(), ...invite, status: 'pending' },
    ]));
    setInvite({ name: '', email: '', role: roleOptions[1], location: '' });
    alert(`Invite sent successfully to ${invite.email}`);
  };

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active').length,
    [members]
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('b2bExtended.teamTitle', 'Team Accounts')}</h1>
          <p className="page-subtitle">{t('b2bExtended.teamSubtitle', 'Control role-based access for operations and billing teams.')}</p>
        </div>
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/team')}>
          <span className="b2b-kpi-label">{t('b2bExtended.totalTeam', 'Total Team Members')}</span>
          <span className="b2b-kpi-value">{members.length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/team')}>
          <span className="b2b-kpi-label">{t('b2bExtended.activeMembers', 'Active Members')}</span>
          <span className="b2b-kpi-value">{activeMembers}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/team')}>
          <span className="b2b-kpi-label">{t('b2bExtended.pendingInvites', 'Pending Invites')}</span>
          <span className="b2b-kpi-value">{members.filter((member) => member.status === 'pending').length}</span>
        </div>
        <div className="b2b-kpi hover-lift" style={{ cursor: 'pointer' }} onClick={() => navigate('/b2b/team')}>
          <span className="b2b-kpi-label">{t('b2bExtended.roleProfiles', 'Role Profiles')}</span>
          <span className="b2b-kpi-value">{roleOptions.length}</span>
        </div>
      </div>

      <div className="b2b-two-col">
        <section className="b2b-card">
          <h3><HiOutlineUserGroup style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.currentTeam', 'Current Team')}</h3>
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('b2bExtended.nameLabel', 'Name')}</th>
                  <th>{t('b2bExtended.roleLabel', 'Role')}</th>
                  <th>{t('b2bExtended.locScope', 'Location Scope')}</th>
                  <th>{t('b2bExtended.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.name}</strong>
                      <div className="page-subtitle">{member.email}</div>
                    </td>
                    <td>{member.role}</td>
                    <td>{member.location || t('b2bExtended.allAssigned', 'All Assigned')}</td>
                    <td>
                      <span className={`b2b-chip ${member.status === 'active' ? 'active' : 'pending'}`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="b2b-card">
          <h3><HiOutlineUserPlus style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.inviteNew', 'Invite New Member')}</h3>
          <div className="input-group">
            <label>{t('b2bExtended.fullName', 'Full Name')}</label>
            <input className="input-field" value={invite.name} onChange={(event) => updateInvite('name', event.target.value)} placeholder="Member full name" />
          </div>
          <div className="input-group">
            <label><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> {t('b2bExtended.emailLabel', 'Email')}</label>
            <input className="input-field" type="email" value={invite.email} onChange={(event) => updateInvite('email', event.target.value)} placeholder="member@company.com" />
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.roleLabel', 'Role')}</label>
            <select className="input-field" value={invite.role} onChange={(event) => updateInvite('role', event.target.value)}>
              {roleOptions.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>{t('b2bExtended.locScope', 'Location Scope')}</label>
            <input className="input-field" value={invite.location} onChange={(event) => updateInvite('location', event.target.value)} placeholder="Example: Block A + Club House" />
          </div>
          <button className="btn btn-primary" onClick={handleInvite}><HiOutlineUserPlus /> {t('b2bExtended.btnSendInvite', 'Send Invite')}</button>
        </aside>
      </div>
    </div>
  );
};

export default B2BTeam;
