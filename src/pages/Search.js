import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { FiSearch, FiFilter } from 'react-icons/fi';
import s from './Search.module.css';

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState(sp.get('keyword') || '');
  const [catId, setCatId] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [inputVal, setInputVal] = useState(sp.get('keyword') || '');

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const kw = sp.get('keyword') || '';
    setKeyword(kw); setInputVal(kw); setPage(0);
  }, [sp]);

  useEffect(() => { doSearch(); }, [keyword, catId, page, sortBy]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const r = await productAPI.search({ keyword: keyword || undefined, categoryId: catId || undefined, page, size: 12, sortBy });
      setProducts(r.data.data?.content || []);
      setTotalPages(r.data.data?.totalPages || 0);
    } catch {} finally { setLoading(false); }
  };

  const onSearch = e => {
    e.preventDefault();
    setSp(inputVal ? { keyword: inputVal } : {});
    setKeyword(inputVal);
    setPage(0);
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.searchBar}>
          <form onSubmit={onSearch} className={s.searchForm}>
            <FiSearch className={s.sIco}/>
            <input className={s.sInput} type="text" placeholder="Search products..." value={inputVal} onChange={e => setInputVal(e.target.value)}/>
            <button type="submit" className="btn btn-primary" style={{borderRadius:'0 12px 12px 0',height:'100%'}}>Search</button>
          </form>
        </div>

        <div className={s.layout}>
          {/* Sidebar */}
          <aside className={s.sidebar}>
            <div className={s.filterSection}>
              <h3 className={s.filterTitle}><FiFilter size={15}/>Filters</h3>
              <div className={s.filterGroup}>
                <p className={s.filterLabel}>Category</p>
                <button className={`${s.filterChip} ${!catId ? s.fActive : ''}`} onClick={() => { setCatId(null); setPage(0); }}>All</button>
                {categories.map(c => (
                  <button key={c.id} className={`${s.filterChip} ${catId===c.id?s.fActive:''}`} onClick={() => { setCatId(c.id); setPage(0); }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
              <div className={s.filterGroup}>
                <p className={s.filterLabel}>Sort By</p>
                {[['createdAt','Newest'],['price','Price: Low→High'],['viewCount','Most Viewed']].map(([v,l]) => (
                  <button key={v} className={`${s.filterChip} ${sortBy===v?s.fActive:''}`} onClick={() => { setSortBy(v); setPage(0); }}>{l}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className={s.results}>
            <div className={s.resultsHeader}>
              <h2 className={s.resultsTitle}>
                {keyword ? `Results for "${keyword}"` : 'All Products'}
              </h2>
              <span className={s.resultsCount}>{products.length} items</span>
            </div>

            {loading ? (
              <div className={s.grid}>
                {Array(8).fill(0).map((_,i) => (
                  <div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',overflow:'hidden'}}>
                    <div className="skeleton" style={{height:180}}/>
                    <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
                      <div className="skeleton" style={{height:12,width:'60%'}}/>
                      <div className="skeleton" style={{height:16,width:'80%'}}/>
                      <div className="skeleton" style={{height:22,width:'40%'}}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className={s.empty}>
                <span style={{fontSize:56}}>🔍</span>
                <h3>No results found</h3>
                <p>Try different keywords or remove filters</p>
              </div>
            ) : (
              <div className={s.grid}>
                {products.map((p,i) => <ProductCard key={p.id} product={p} style={{animationDelay:`${i*0.04}s`}}/>)}
              </div>
            )}

            {totalPages > 1 && (
              <div className={s.pages}>
                <button className="btn btn-secondary" onClick={() => setPage(p=>p-1)} disabled={page===0}>← Prev</button>
                <span style={{color:'var(--t2)',fontSize:14}}>{page+1} / {totalPages}</span>
                <button className="btn btn-secondary" onClick={() => setPage(p=>p+1)} disabled={page>=totalPages-1}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
