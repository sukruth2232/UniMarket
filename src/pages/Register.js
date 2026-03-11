import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import s from './Auth.module.css';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ username:'', email:'', password:'', firstName:'', lastName:'', university:'' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const set = k => e => setF({...f, [k]: e.target.value});

  const onSubmit = async (e) => {
    e.preventDefault();
    if (f.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    setLoading(true);
    try {
      await register(f);
      toast.success('Welcome to UniMarket! 🎉');
      nav('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.bg}><div className={s.orb1}/><div className={s.orb2}/></div>
      <div className={`${s.card} ${s.cardWide}`}>
        <Link to="/" className={s.brand}><div className={s.brandMark}>U</div><span>UniMarket</span></Link>
        <h1 className={s.title}>Create account</h1>
        <p className={s.sub}>Join your campus marketplace</p>
        <form onSubmit={onSubmit} className={s.form}>
          <div className={s.row}>
            <div className={s.field}>
              <label className={s.label}>First Name</label>
              <div className={s.inputWrap}><FiUser className={s.ico}/><input type="text" className={`input ${s.input}`} placeholder="John" value={f.firstName} onChange={set('firstName')}/></div>
            </div>
            <div className={s.field}>
              <label className={s.label}>Last Name</label>
              <div className={s.inputWrap}><FiUser className={s.ico}/><input type="text" className={`input ${s.input}`} placeholder="Doe" value={f.lastName} onChange={set('lastName')}/></div>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Username <span className={s.req}>*</span></label>
            <div className={s.inputWrap}><FiUser className={s.ico}/><input type="text" className={`input ${s.input}`} placeholder="john_doe" value={f.username} onChange={set('username')} required/></div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Email <span className={s.req}>*</span></label>
            <div className={s.inputWrap}><FiMail className={s.ico}/><input type="email" className={`input ${s.input}`} placeholder="john@university.edu" value={f.email} onChange={set('email')} required/></div>
          </div>
          <div className={s.field}>
            <label className={s.label}>University</label>
            <div className={s.inputWrap}><FiUser className={s.ico}/><input type="text" className={`input ${s.input}`} placeholder="IIT Delhi" value={f.university} onChange={set('university')}/></div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Password <span className={s.req}>*</span></label>
            <div className={s.inputWrap}>
              <FiLock className={s.ico}/>
              <input type={show?'text':'password'} className={`input ${s.input}`} placeholder="Min. 6 characters" value={f.password} onChange={set('password')} required/>
              <button type="button" className={s.eye} onClick={()=>setShow(!show)}>{show?<FiEyeOff/>:<FiEye/>}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${s.submit}`} disabled={loading}>
            {loading ? <div className="spinner"/> : 'Create Account'}
          </button>
        </form>
        <p className={s.switch}>Already have one? <Link to="/login" className={s.switchLink}>Sign in</Link></p>
      </div>
    </div>
  );
}
