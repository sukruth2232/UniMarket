import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';
import toast from 'react-hot-toast';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import s from './Profile.module.css';

export default function Profile() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const isMe = !id || id === String(me?.id);
  const uid = isMe ? me?.id : id;

  useEffect(() => {
    if (!uid) return;
    Promise.all([userAPI.getById(uid), userAPI.getListings(uid, { page: 0, size: 20 })])
      .then(([u, l]) => {
        setProfile(u.data.data);
        setListings(l.data.data?.content || []);
        setForm({ firstName: u.data.data.firstName || '', lastName: u.data.data.lastName || '', university: u.data.data.university || '', phone: u.data.data.phone || '', bio: u.data.data.bio || '' });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [uid]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await userAPI.update(form);
      setProfile(r.data.data);
      updateUser(r.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className={s.page}><div className={s.container}>
      <div className={s.skProfile}>
        <div className="skeleton" style={{width:96,height:96,borderRadius:'50%'}}/>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:10}}>
          <div className="skeleton" style={{height:24,width:'30%'}}/>
          <div className="skeleton" style={{height:14,width:'50%'}}/>
        </div>
      </div>
    </div></div>
  );
  if (!profile) return null;

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.card}>
          <div className={s.coverGrad}/>
          <div className={s.profileRow}>
            <div className={s.avatarWrap}>
              {profile.profileImageUrl
                ? <img src={profile.profileImageUrl} alt="" className={s.avatar}/>
                : <div className={s.avatarFallback}>{(profile.firstName || profile.username)?.[0]?.toUpperCase()}</div>
              }
            </div>
            <div className={s.profileInfo}>
              {editing ? (
                <div className={s.editRow}>
                  <input className="input" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} placeholder="First name" style={{maxWidth:160}}/>
                  <input className="input" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} placeholder="Last name" style={{maxWidth:160}}/>
                </div>
              ) : (
                <h1 className={s.name}>{profile.firstName ? `${profile.firstName} ${profile.lastName||''}`.trim() : profile.username}</h1>
              )}
              <p className={s.username}>@{profile.username}</p>
              {editing ? (
                <input className="input" value={form.university} onChange={e=>setForm({...form,university:e.target.value})} placeholder="University" style={{maxWidth:300,marginTop:8}}/>
              ) : (
                profile.university && <p className={s.uni}>🎓 {profile.university}</p>
              )}
              <div className={s.stats}>
                <div className={s.stat}><span className={s.statN}>{profile.listingCount}</span><span className={s.statL}>Listings</span></div>
              </div>
            </div>
            {isMe && (
              <div className={s.editBtns}>
                {editing ? (
                  <>
                    <button className="btn btn-primary" onClick={save} disabled={saving}><FiSave size={15}/>{saving?'Saving...':'Save'}</button>
                    <button className="btn btn-secondary" onClick={() => setEditing(false)}><FiX size={15}/></button>
                  </>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setEditing(true)}><FiEdit2 size={15}/>Edit Profile</button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className={s.editFields}>
              <div>
                <label className={s.editLabel}>Phone</label>
                <input className="input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 ..."/>
              </div>
              <div>
                <label className={s.editLabel}>Bio</label>
                <textarea className="input" value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={3} placeholder="Tell others about yourself..."/>
              </div>
            </div>
          ) : (
            profile.bio && <p className={s.bio}>{profile.bio}</p>
          )}
        </div>

        <div className={s.listingsSection}>
          <h2 className={s.listingsTitle}>{isMe ? 'My Listings' : `${profile.firstName||profile.username}'s Listings`}</h2>
          {listings.length === 0 ? (
            <div className={s.noListings}><span>📦</span><p>No listings yet</p></div>
          ) : (
            <div className={s.grid}>
              {listings.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
