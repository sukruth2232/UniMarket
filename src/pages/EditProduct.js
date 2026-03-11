import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import s from './CreateProduct.module.css';

export default function EditProduct() {
  const { id } = useParams();
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [f, setF] = useState({ title:'', description:'', price:'', condition:'GOOD', categoryId:'', location:'' });

  useEffect(() => {
    Promise.all([categoryAPI.getAll(), productAPI.getById(id)])
      .then(([cats, prod]) => {
        setCategories(cats.data.data || []);
        const p = prod.data.data;
        setF({ title:p.title||'', description:p.description||'', price:p.price||'', condition:p.condition||'GOOD', categoryId:p.category?.id||'', location:p.location||'' });
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setFetching(false));
  }, [id]);

  const set = k => e => setF({...f, [k]: e.target.value});

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await productAPI.update(id, { ...f, price: parseFloat(f.price), categoryId: parseInt(f.categoryId) });
      toast.success('Listing updated!');
      nav(`/products/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (fetching) return <div style={{display:'flex',justifyContent:'center',padding:80}}><div className="spinner" style={{width:36,height:36}}/></div>;

  return (
    <div className={s.page}>
      <div className={s.container}>
        <h1 className={s.title}>Edit Listing</h1>
        <p className={s.sub}>Update your listing details</p>
        <form onSubmit={onSubmit} className={s.form}>
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-xl)',padding:28,maxWidth:600}}>
            <div className={s.field}>
              <label className={s.label}>Title *</label>
              <input className="input" type="text" value={f.title} onChange={set('title')} required maxLength={200}/>
            </div>
            <div className={s.field}>
              <label className={s.label}>Description</label>
              <textarea className={`input ${s.textarea}`} value={f.description} onChange={set('description')} rows={5}/>
            </div>
            <div className={s.row}>
              <div className={s.field}>
                <label className={s.label}>Price (₹) *</label>
                <input className="input" type="number" value={f.price} onChange={set('price')} min={0} required/>
              </div>
              <div className={s.field}>
                <label className={s.label}>Location</label>
                <input className="input" type="text" value={f.location} onChange={set('location')}/>
              </div>
            </div>
            <div className={s.row}>
              <div className={s.field}>
                <label className={s.label}>Category *</label>
                <select className="input" value={f.categoryId} onChange={set('categoryId')} required>
                  <option value="">Select</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.label}>Condition *</label>
                <select className="input" value={f.condition} onChange={set('condition')}>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{width:'100%',padding:'13px',fontSize:15,marginTop:8}} disabled={loading}>
              {loading ? <><div className="spinner"/>Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
