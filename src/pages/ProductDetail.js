import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI, orderAPI, messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMapPin, FiEye, FiClock, FiMessageCircle, FiShoppingBag, FiEdit2, FiTrash2, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import s from './ProductDetail.module.css';

const cond = { NEW:'badge-green', LIKE_NEW:'badge-blue', GOOD:'badge-yellow', FAIR:'badge-yellow', POOR:'badge-gray' };
const condLabel = { NEW:'New', LIKE_NEW:'Like New', GOOD:'Good', FAIR:'Fair', POOR:'Poor' };

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [ordering, setOrdering] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    productAPI.getById(id)
      .then(r => setProduct(r.data.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOrder = async () => {
    if (!user) { nav('/login'); return; }
    setOrdering(true);
    try {
      await orderAPI.create({ productId: product.id });
      toast.success('Order placed! Seller will contact you.');
      setProduct({ ...product, status: 'RESERVED' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally { setOrdering(false); }
  };

  const handleMessage = async () => {
    if (!user) { nav('/login'); return; }
    setMessaging(true);
    try {
      await messageAPI.send({ receiverId: product.seller.id, productId: product.id, content: `Hi! I'm interested in "${product.title}". Is it still available?` });
      toast.success('Message sent!');
      nav('/messages');
    } catch (err) {
      toast.error('Failed to send message');
    } finally { setMessaging(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await productAPI.delete(product.id);
      toast.success('Listing deleted');
      nav('/home');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.skeleton}>
          <div className="skeleton" style={{height:460,borderRadius:'var(--r-lg)'}}/>
          <div style={{display:'flex',flexDirection:'column',gap:16,paddingTop:8}}>
            {[40,20,30,60,80].map((w,i) => <div key={i} className="skeleton" style={{height:i===0?32:16,width:`${w}%`}}/>)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return <div className={s.page}><div className={s.container}><p style={{color:'var(--t2)',padding:'80px 0',textAlign:'center'}}>Product not found</p></div></div>;

  const imgs = product.imageUrls || [];
  const isSeller = user?.id === product.seller?.id || user?.role === 'ADMIN';
  const canBuy = user && !isSeller && product.status === 'AVAILABLE';

  return (
    <div className={s.page}>
      <div className={s.container}>
        <Link to="/home" className={s.back}><FiArrowLeft size={16}/>Back to listings</Link>
        <div className={s.layout}>
          {/* Images */}
          <div className={s.imgSection}>
            <div className={s.mainImg}>
              {imgs.length > 0
                ? <img src={imgs[imgIdx]} alt={product.title} className={s.img}/>
                : <div className={s.noImg}>{product.category?.icon || '📦'}</div>
              }
              {imgs.length > 1 && (
                <>
                  <button className={`${s.imgNav} ${s.imgPrev}`} onClick={() => setImgIdx(i => Math.max(0,i-1))}><FiChevronLeft/></button>
                  <button className={`${s.imgNav} ${s.imgNext}`} onClick={() => setImgIdx(i => Math.min(imgs.length-1,i+1))}><FiChevronRight/></button>
                </>
              )}
              {product.status !== 'AVAILABLE' && (
                <div className={`${s.statusOverlay} ${product.status === 'SOLD' ? s.sold : s.reserved}`}>
                  <span>{product.status}</span>
                </div>
              )}
            </div>
            {imgs.length > 1 && (
              <div className={s.thumbs}>
                {imgs.map((img, i) => (
                  <button key={i} className={`${s.thumb} ${i===imgIdx?s.thumbActive:''}`} onClick={() => setImgIdx(i)}>
                    <img src={img} alt={`${i+1}`}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className={s.info}>
            <div className={s.badges}>
              <span className={`badge ${cond[product.condition]}`}>{condLabel[product.condition]}</span>
              <span className={`badge ${product.status==='AVAILABLE'?'badge-green':product.status==='SOLD'?'badge-red':'badge-yellow'}`}>
                {product.status}
              </span>
            </div>

            <p className={s.catTag}>{product.category?.icon} {product.category?.name}</p>
            <h1 className={s.title}>{product.title}</h1>
            <p className={s.price}>₹{Number(product.price).toLocaleString('en-IN')}</p>

            <div className={s.meta}>
              {product.location && <span className={s.metaItem}><FiMapPin size={13}/>{product.location}</span>}
              <span className={s.metaItem}><FiEye size={13}/>{product.viewCount} views</span>
              {product.createdAt && <span className={s.metaItem}><FiClock size={13}/>{formatDistanceToNow(new Date(product.createdAt), {addSuffix:true})}</span>}
            </div>

            {product.description && (
              <div className={s.descSection}>
                <h3 className={s.descTitle}>Description</h3>
                <p className={s.desc}>{product.description}</p>
              </div>
            )}

            {/* Seller card */}
            <div className={s.sellerCard}>
              <div className={s.sellerAvatar}>{product.seller?.username?.[0]?.toUpperCase()}</div>
              <div className={s.sellerInfo}>
                <p className={s.sellerName}>{product.seller?.firstName ? `${product.seller.firstName} ${product.seller.lastName||''}`.trim() : product.seller?.username}</p>
                <p className={s.sellerSub}>{product.seller?.university || 'University student'} · {product.seller?.listingCount} listings</p>
              </div>
              {user && !isSeller && (
                <Link to={`/profile/${product.seller?.id}`} className="btn btn-secondary" style={{marginLeft:'auto',fontSize:13}}>View Profile</Link>
              )}
            </div>

            {/* Actions */}
            {isSeller ? (
              <div className={s.actions}>
                <Link to={`/edit-product/${product.id}`} className="btn btn-secondary" style={{flex:1}}>
                  <FiEdit2 size={15}/> Edit
                </Link>
                <button className="btn btn-danger" style={{flex:1}} onClick={handleDelete}>
                  <FiTrash2 size={15}/> Delete
                </button>
              </div>
            ) : (
              <div className={s.actions}>
                <button className="btn btn-secondary" style={{flex:1}} onClick={handleMessage} disabled={messaging}>
                  <FiMessageCircle size={15}/>{messaging ? 'Sending...' : 'Message Seller'}
                </button>
                {canBuy && (
                  <button className="btn btn-primary" style={{flex:1}} onClick={handleOrder} disabled={ordering}>
                    <FiShoppingBag size={15}/>{ordering ? 'Ordering...' : 'Buy Now'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
