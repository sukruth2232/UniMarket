import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiPackage, FiShoppingBag, FiTrendingUp, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import s from './Admin.module.css';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      .then(([s, u]) => { setStats(s.data.data); setUsers(u.data.data || []); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async id => {
    try {
      await adminAPI.toggleUser(id);
      setUsers(u => u.map(x => x.id === id ? {...x, active: !x.active} : x));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <h1 className={s.title}>Admin Panel</h1>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab==='stats'?s.tActive:''}`} onClick={() => setTab('stats')}>Dashboard</button>
          <button className={`${s.tab} ${tab==='users'?s.tActive:''}`} onClick={() => setTab('users')}>Users</button>
        </div>

        {tab === 'stats' && (
          <div className={s.statsGrid}>
            {stats ? [
              { icon:<FiUsers/>, label:'Total Users', value: stats.totalUsers, color:'var(--accent)' },
              { icon:<FiPackage/>, label:'Total Products', value: stats.totalProducts, color:'var(--cyan)' },
              { icon:<FiShoppingBag/>, label:'Total Orders', value: stats.totalOrders, color:'var(--yellow)' },
              { icon:<FiTrendingUp/>, label:'Completed Orders', value: stats.completedOrders, color:'var(--green)' },
              { icon:<FiPackage/>, label:'Available Products', value: stats.availableProducts, color:'var(--accent3)' },
              { icon:<FiPackage/>, label:'Sold Products', value: stats.soldProducts, color:'#f87171' },
            ].map((item,i) => (
              <div key={i} className={s.statCard} style={{borderTopColor:item.color}}>
                <div className={s.statIcon} style={{color:item.color}}>{item.icon}</div>
                <p className={s.statVal}>{item.value ?? '-'}</p>
                <p className={s.statLabel}>{item.label}</p>
              </div>
            )) : Array(6).fill(0).map((_,i) => (
              <div key={i} className="skeleton" style={{height:120,borderRadius:'var(--r-lg)'}}/>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className={s.userTable}>
            <div className={s.tableHead}>
              <span>User</span><span>Email</span><span>Role</span><span>Listings</span><span>Status</span><span>Action</span>
            </div>
            {loading ? Array(5).fill(0).map((_,i) => <div key={i} className="skeleton" style={{height:60,marginBottom:4,borderRadius:'var(--r-md)'}}/>) :
              users.map(u => (
                <div key={u.id} className={s.userRow}>
                  <div className={s.userCell}>
                    <div className={s.userAvatar}>{(u.firstName||u.username)?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className={s.uName}>{u.firstName ? `${u.firstName} ${u.lastName||''}`.trim() : u.username}</p>
                      <p className={s.uSub}>@{u.username}</p>
                    </div>
                  </div>
                  <span className={s.uEmail}>{u.email}</span>
                  <span className={`badge ${u.role==='ADMIN'?'badge-red':'badge-blue'}`}>{u.role}</span>
                  <span className={s.uListings}>{u.listingCount}</span>
                  <span className={`badge ${u.active?'badge-green':'badge-gray'}`}>{u.active?'Active':'Inactive'}</span>
                  <button className="btn btn-secondary" style={{padding:'6px 12px',fontSize:12}} onClick={() => toggle(u.id)}>
                    {u.active ? <><FiToggleRight size={14}/> Deactivate</> : <><FiToggleLeft size={14}/> Activate</>}
                  </button>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
