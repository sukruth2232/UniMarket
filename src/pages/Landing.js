import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiMessageCircle, FiTrendingUp, FiUsers } from 'react-icons/fi';
import s from './Landing.module.css';

const cats = [
  ['💻','Electronics'],['📚','Textbooks'],['🛋️','Furniture'],['👕','Clothing'],
  ['🏋️','Sports'],['🎸','Music'],['✏️','Stationery'],['🍳','Kitchen'],
];

const feats = [
  { icon:<FiShield/>, t:'Verified Students', d:'Only university students can buy and sell on the platform.' },
  { icon:<FiMessageCircle/>, t:'Real-time Chat', d:'Connect instantly with buyers and sellers via live messaging.' },
  { icon:<FiTrendingUp/>, t:'Best Deals', d:'Find incredible prices on textbooks, gear, and everything in between.' },
  { icon:<FiUsers/>, t:'Campus Network', d:'Trade safely within your campus ecosystem.' },
];

export default function Landing() {
  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div className={s.heroBg}>
          <div className={s.orb1}/><div className={s.orb2}/><div className={s.grid}/>
        </div>
        <div className={s.heroInner}>
          <div className={s.pill}><span className={s.pillDot}/>Campus Marketplace · Est. 2024</div>
          <h1 className={s.h1}>Buy. Sell.<br/><span className={s.gradient}>Within Campus.</span></h1>
          <p className={s.sub}>The smartest way for university students to trade textbooks, electronics, furniture and more — safely within your campus community.</p>
          <div className={s.ctas}>
            <Link to="/register" className={s.ctaPrimary}>Start for free <FiArrowRight/></Link>
            <Link to="/login" className={s.ctaGhost}>Sign in</Link>
          </div>
          <div className={s.stats}>
            {[['10K+','Students'],['50K+','Listings'],['200+','Colleges'],['₹2Cr+','Traded']].map(([v,l]) => (
              <div key={l} className={s.stat}>
                <span className={s.statVal}>{v}</span>
                <span className={s.statLbl}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.wrap}>
          <h2 className={s.h2}>Browse by Category</h2>
          <div className={s.catGrid}>
            {cats.map(([e,n],i) => (
              <Link key={n} to={`/search?keyword=${n}`} className={s.catCard} style={{animationDelay:`${i*0.05}s`}}>
                <span className={s.catEmoji}>{e}</span>
                <span className={s.catName}>{n}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.section} ${s.featSection}`}>
        <div className={s.wrap}>
          <h2 className={s.h2}>Why UniMarket?</h2>
          <div className={s.featGrid}>
            {feats.map((f,i) => (
              <div key={i} className={s.featCard} style={{animationDelay:`${i*0.08}s`}}>
                <div className={s.featIcon}>{f.icon}</div>
                <h3 className={s.featTitle}>{f.t}</h3>
                <p className={s.featDesc}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.ctaSection}>
        <div className={s.wrap}>
          <div className={s.ctaBox}>
            <div className={s.ctaGlow}/>
            <h2 className={s.ctaH}>Ready to start trading?</h2>
            <p className={s.ctaSub}>Join thousands of students on UniMarket today</p>
            <Link to="/register" className={s.ctaBig}>Create Free Account <FiArrowRight/></Link>
          </div>
        </div>
      </section>

      <footer className={s.footer}>© 2024 UniMarket · Made for university students</footer>
    </div>
  );
}
