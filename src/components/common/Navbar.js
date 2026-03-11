import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI, messageAPI } from '../../services/api';
import { FiSearch, FiBell, FiMessageSquare, FiPlus, FiUser, FiLogOut, FiPackage, FiShield, FiChevronDown } from 'react-icons/fi';
import s from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [q, setQ] = useState('');
  const [nc, setNc] = useState(0);
  const [mc, setMc] = useState(0);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const [n, m] = await Promise.all([notificationAPI.getUnreadCount(), messageAPI.getUnreadCount()]);
        setNc(n.data.data || 0); setMc(m.data.data || 0);
      } catch {}
    };
    fetch();
    const t = setInterval(fetch, 30000);
    return () => clearInterval(t);
  }, [user]);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const onSearch = e => {
    e.preventDefault();
    if (q.trim()) nav(`/search?keyword=${encodeURIComponent(q.trim())}`);
  };

  const active = p => loc.pathname === p;

  return (
    <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <Link to={user ? '/home' : '/'} className={s.logo}>
          <div className={s.logoMark}>
            <span>U</span>
          </div>
          <span className={s.logoName}>UniMarket</span>
        </Link>

        {user && (
          <form onSubmit={onSearch} className={s.search}>
            <FiSearch className={s.searchIco} />
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search products, categories..."
              className={s.searchInput}
            />
            {q && <button type="button" className={s.clearBtn} onClick={() => setQ('')}>×</button>}
          </form>
        )}

        <div className={s.right}>
          {user ? (
            <>
              <Link to="/create-listing" className={s.sellBtn}>
                <FiPlus size={15} />Sell
              </Link>

              <Link to="/messages" className={`${s.iconBtn} ${active('/messages') ? s.iActive : ''}`} title="Messages">
                <FiMessageSquare size={19} />
                {mc > 0 && <span className={s.dot}>{mc > 9 ? '9+' : mc}</span>}
              </Link>

              <Link to="/notifications" className={`${s.iconBtn} ${active('/notifications') ? s.iActive : ''}`} title="Notifications">
                <FiBell size={19} />
                {nc > 0 && <span className={s.dot}>{nc > 9 ? '9+' : nc}</span>}
              </Link>

              <div className={s.userWrap} ref={ref}>
                <button className={s.userBtn} onClick={() => setOpen(o => !o)}>
                  <div className={s.avatarCircle}>
                    {user.profileImageUrl
                      ? <img src={user.profileImageUrl} alt="" />
                      : <span>{(user.firstName || user.username)?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <FiChevronDown className={`${s.chevron} ${open ? s.chevUp : ''}`} size={14} />
                </button>

                {open && (
                  <div className={s.dropdown}>
                    <div className={s.dHead}>
                      <div className={s.dAvatar}>
                        {user.profileImageUrl
                          ? <img src={user.profileImageUrl} alt="" />
                          : <span>{(user.firstName || user.username)?.[0]?.toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <p className={s.dName}>{user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}</p>
                        <p className={s.dEmail}>{user.email}</p>
                      </div>
                    </div>
                    <div className={s.dDivider} />
                    <Link to="/profile" className={s.dItem} onClick={() => setOpen(false)}><FiUser size={15}/>My Profile</Link>
                    <Link to="/orders" className={s.dItem} onClick={() => setOpen(false)}><FiPackage size={15}/>My Orders</Link>
                    {user.role === 'ADMIN' && <Link to="/admin" className={s.dItem} onClick={() => setOpen(false)}><FiShield size={15}/>Admin Panel</Link>}
                    <div className={s.dDivider} />
                    <button className={`${s.dItem} ${s.dLogout}`} onClick={() => { logout(); setOpen(false); nav('/login'); }}>
                      <FiLogOut size={15}/>Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={s.loginBtn}>Sign In</Link>
              <Link to="/register" className={s.registerBtn}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
