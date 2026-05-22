import { useMemo, useState } from 'react';
import {
  HiOutlineEnvelope,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
} from 'react-icons/hi2';
import '../Dashboard.css';
import './B2BPages.css';

const initialMembers = [
  { id: 1, name: 'Rudra Shah', email: 'rudra@greenvalley.in', role: 'Owner', location: 'All Locations', status: 'active' },
  { id: 2, name: 'Priya Desai', email: 'priya@greenvalley.in', role: 'Operations Manager', location: 'Block A, Block B', status: 'active' },
  { id: 3, name: 'Amit Patel', email: 'amit@greenvalley.in', role: 'Accounting', location: 'Club House', status: 'pending' },
];

const roleOptions = ['Owner', 'Operations Manager', 'Accounting', 'Facility Supervisor', 'Viewer'];

const B2BTeam = () => {
  const [members, setMembers] = useState(initialMembers);
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    role: roleOptions[1],
    location: '',
  });

  const updateInvite = (key, value) => setInvite((current) => ({ ...current, [key]: value }));

  const handleInvite = () => {
    if (!invite.name || !invite.email) return;
    setMembers((current) => ([
      ...current,
      { id: Date.now(), ...invite, status: 'pending' },
    ]));
    setInvite({ name: '', email: '', role: roleOptions[1], location: '' });
  };

  const activeMembers = useMemo(
    () => members.filter((member) => member.status === 'active').length,
    [members]
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Accounts</h1>
          <p className="page-subtitle">Control role-based access for operations and billing teams.</p>
        </div>
      </div>

      <div className="b2b-kpi-strip">
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Total Team Members</span>
          <span className="b2b-kpi-value">{members.length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Active Members</span>
          <span className="b2b-kpi-value">{activeMembers}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Pending Invites</span>
          <span className="b2b-kpi-value">{members.filter((member) => member.status === 'pending').length}</span>
        </div>
        <div className="b2b-kpi">
          <span className="b2b-kpi-label">Role Profiles</span>
          <span className="b2b-kpi-value">{roleOptions.length}</span>
        </div>
      </div>

      <div className="b2b-two-col">
        <section className="b2b-card">
          <h3><HiOutlineUserGroup style={{ verticalAlign: 'middle' }} /> Current Team</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Location Scope</th>
                <th>Status</th>
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
                  <td>{member.location || 'All Assigned'}</td>
                  <td>
                    <span className={`b2b-chip ${member.status === 'active' ? 'active' : 'pending'}`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="b2b-card">
          <h3><HiOutlineUserPlus style={{ verticalAlign: 'middle' }} /> Invite New Member</h3>
          <div className="input-group">
            <label>Full Name</label>
            <input className="input-field" value={invite.name} onChange={(event) => updateInvite('name', event.target.value)} placeholder="Member full name" />
          </div>
          <div className="input-group">
            <label><HiOutlineEnvelope style={{ verticalAlign: 'middle' }} /> Email</label>
            <input className="input-field" type="email" value={invite.email} onChange={(event) => updateInvite('email', event.target.value)} placeholder="member@company.com" />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select className="input-field" value={invite.role} onChange={(event) => updateInvite('role', event.target.value)}>
              {roleOptions.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>Location Scope</label>
            <input className="input-field" value={invite.location} onChange={(event) => updateInvite('location', event.target.value)} placeholder="Example: Block A + Club House" />
          </div>
          <button className="btn btn-primary" onClick={handleInvite}><HiOutlineUserPlus /> Send Invite</button>
        </aside>
      </div>
    </div>
  );
};

export default B2BTeam;
