import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import s from './Notifications.module.css';

const typeIcon = { MESSAGE:'💬', ORDER:'📦', GENERAL:'🔔', PRODUCT:'🏷️' };

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { fetchNotifs(); }, [page]);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const r = await notificationAPI.getAll({ page, size: 20 });
      setNotifs(r.data.data?.content || []);
      setTotalPages(r.data.data?.totalPages || 0);
    } catch {} finally { setLoading(false); }
  };

  const markRead = async id => {
    try {
      await notificationAPI.markRead(id);
      setNotifs(n => n.map(x => x.id === id ? {...x, read: true} : x));
    } catch {}
  };

  const markAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifs(n => n.map(x => ({...x, read: true})));
      toast.success('All marked as read');
    } catch {}
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.header}>
          <div>
            <h1 className={s.title}>Notifications</h1>
            {unreadCount > 0 && <p className={s.sub}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAll} style={{gap:8}}>
              <FiCheckCircle size={15}/>Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className={s.list}>
            {Array(8).fill(0).map((_,i) => (
              <div key={i} className={s.skItem}>
                <div className="skeleton" style={{width:42,height:42,borderRadius:'50%',flexShrink:0}}/>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:8}}>
                  <div className="skeleton" style={{height:14,width:'40%'}}/>
                  <div className="skeleton" style={{height:12,width:'70%'}}/>
                </div>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className={s.empty}>
            <FiBell size={48} color="var(--t4)"/>
            <h3>All caught up!</h3>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className={s.list}>
            {notifs.map(n => (
              <div key={n.id} className={`${s.item} ${!n.read ? s.unread : ''}`} onClick={() => !n.read && markRead(n.id)}>
                <div className={s.icon}>{typeIcon[n.type] || '🔔'}</div>
                <div className={s.content}>
                  <p className={s.nTitle}>{n.title}</p>
                  <p className={s.nMsg}>{n.message}</p>
                  <p className={s.nTime}>{n.createdAt ? formatDistanceToNow(new Date(n.createdAt), {addSuffix:true}) : ''}</p>
                </div>
                {!n.read && (
                  <button className={s.readBtn} onClick={e => { e.stopPropagation(); markRead(n.id); }} title="Mark as read">
                    <FiCheck size={14}/>
                  </button>
                )}
                {n.read && <div className={s.readDot}/>}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{display:'flex',gap:16,justifyContent:'center',marginTop:32}}>
            <button className="btn btn-secondary" onClick={() => setPage(p=>p-1)} disabled={page===0}>← Prev</button>
            <span style={{color:'var(--t2)',fontSize:14,alignSelf:'center'}}>{page+1}/{totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setPage(p=>p+1)} disabled={page>=totalPages-1}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
