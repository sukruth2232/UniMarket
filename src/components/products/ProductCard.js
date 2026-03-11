import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import s from './ProductCard.module.css';

const cond = { NEW:'badge-green', LIKE_NEW:'badge-blue', GOOD:'badge-yellow', FAIR:'badge-yellow', POOR:'badge-gray' };
const condLabel = { NEW:'New', LIKE_NEW:'Like New', GOOD:'Good', FAIR:'Fair', POOR:'Poor' };

export default function ProductCard({ product: p, style }) {
  return (
    <Link to={`/products/${p.id}`} className={s.card} style={style}>
      <div className={s.imgWrap}>
        {p.imageUrls?.length > 0
          ? <img src={p.imageUrls[0]} alt={p.title} className={s.img} loading="lazy" />
          : <div className={s.noImg}>{p.category?.icon || '📦'}</div>
        }
        {p.status !== 'AVAILABLE' && (
          <div className={`${s.overlay} ${p.status === 'SOLD' ? s.sold : s.reserved}`}>
            <span>{p.status}</span>
          </div>
        )}
        <span className={`badge ${cond[p.condition]} ${s.condBadge}`}>{condLabel[p.condition]}</span>
      </div>

      <div className={s.body}>
        <p className={s.cat}>{p.category?.icon} {p.category?.name}</p>
        <h3 className={s.title}>{p.title}</h3>
        <p className={s.price}>₹{Number(p.price).toLocaleString('en-IN')}</p>
        <div className={s.meta}>
          {p.location && <span className={s.metaItem}><FiMapPin size={11}/>{p.location}</span>}
          <span className={s.metaItem}><FiEye size={11}/>{p.viewCount}</span>
          {p.createdAt && <span className={s.metaItem}><FiClock size={11}/>{formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</span>}
        </div>
        <div className={s.footer}>
          <div className={s.seller}>
            <div className={s.sAvatar}>{p.seller?.username?.[0]?.toUpperCase()}</div>
            <span className={s.sName}>{p.seller?.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
