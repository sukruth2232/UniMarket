import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import s from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(f);
      toast.success('Welcome back!');
      nav('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.bg}><div className={s.orb1}/><div className={s.orb2}/></div>
      <div className={s.card}>
        <Link to="/" className={s.brand}><div className={s.brandMark}>U</div><span>UniMarket</span></Link>
        <h1 className={s.title}>Welcome back</h1>
        <p className={s.sub}>Sign in to your account</p>
        <form onSubmit={onSubmit} className={s.form}>
          <div className={s.field}>
            <label className={s.label}>Username or Email</label>
            <div className={s.inputWrap}>
              <FiMail className={s.ico}/>
              <input type="text" className={`input ${s.input}`} placeholder="john@uni.com" value={f.usernameOrEmail} onChange={e=>setF({...f,usernameOrEmail:e.target.value})} required/>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label}>Password</label>
            <div className={s.inputWrap}>
              <FiLock className={s.ico}/>
              <input type={show?'text':'password'} className={`input ${s.input}`} placeholder="••••••••" value={f.password} onChange={e=>setF({...f,password:e.target.value})} required/>
              <button type="button" className={s.eye} onClick={()=>setShow(!show)}>{show?<FiEyeOff/>:<FiEye/>}</button>
            </div>
          </div>
          <button type="submit" className={`btn btn-primary ${s.submit}`} disabled={loading}>
            {loading ? <div className="spinner"/> : 'Sign In'}
          </button>
        </form>
        <p className={s.switch}>No account? <Link to="/register" className={s.switchLink}>Create one</Link></p>
      </div>
    </div>
  );
}
