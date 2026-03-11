import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';
import { FiPlus, FiGrid, FiFilter } from 'react-icons/fi';
import s from './Home.module.css';

export default function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [catId, page, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, size: 12, sortBy };
      let res;
      if (catId) {
        res = await productAPI.search({ ...params, categoryId: catId });
      } else {
        res = await productAPI.getAll(params);
      }
      setProducts(res.data.data?.content || []);
      setTotalPages(res.data.data?.totalPages || 0);
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      setLoading(false);
    }
  };

  const name = user?.firstName || user?.username;

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.header}>
          <div>
            <h1 className={s.greeting}>Hey, {name}! 👋</h1>
            <p className={s.greetSub}>Discover great deals on your campus</p>
          </div>
          <Link to="/create-listing" className={`btn btn-primary`}><FiPlus size={16}/>New Listing</Link>
        </div>

        {/* Category chips */}
        <div className={s.cats}>
          <button className={`${s.catChip} ${catId === null ? s.catActive : ''}`} onClick={() => { setCatId(null); setPage(0); }}>
            <FiGrid size={13}/> All
          </button>
          {categories.map(c => (
            <button key={c.id} className={`${s.catChip} ${catId === c.id ? s.catActive : ''}`} onClick={() => { setCatId(c.id); setPage(0); }}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className={s.bar}>
          <span className={s.barLabel}>
            {catId ? categories.find(c => c.id === catId)?.name : 'All Products'}
          </span>
          <div className={s.sortWrap}>
            <FiFilter size={14} color="var(--t3)"/>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(0); }} className={s.sort}>
              <option value="createdAt">Newest</option>
              <option value="price">Price: Low→High</option>
              <option value="viewCount">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {loading ? (
          <div className={s.grid}>
            {Array(8).fill(0).map((_,i) => (
              <div key={i} className={s.skCard}>
                <div className={`skeleton ${s.skImg}`}/>
                <div className={s.skBody}>
                  <div className="skeleton" style={{height:12,width:'50%',marginBottom:8}}/>
                  <div className="skeleton" style={{height:16,width:'80%',marginBottom:8}}/>
                  <div className="skeleton" style={{height:22,width:'40%'}}/>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIco}>📦</span>
            <h3>No products here yet</h3>
            <p>Be the first to list something!</p>
            <Link to="/create-listing" className="btn btn-primary" style={{marginTop:16}}>Create Listing</Link>
          </div>
        ) : (
          <div className={s.grid}>
            {products.map((p,i) => <ProductCard key={p.id} product={p} style={{animationDelay:`${i*0.04}s`}}/>)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={s.pages}>
            <button className="btn btn-secondary" onClick={() => setPage(p => p-1)} disabled={page === 0}>← Prev</button>
            <span className={s.pageNum}>{page+1} / {totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setPage(p => p+1)} disabled={page >= totalPages-1}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
