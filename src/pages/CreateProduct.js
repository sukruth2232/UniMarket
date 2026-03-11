import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import s from './CreateProduct.module.css';

export default function CreateProduct() {
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ title:'', description:'', price:'', condition:'GOOD', categoryId:'', location:'' });

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const set = k => e => setF({...f, [k]: e.target.value});

  const onImages = e => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = i => {
    setImages(imgs => imgs.filter((_,idx) => idx !== i));
    setPreviews(ps => ps.filter((_,idx) => idx !== i));
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!f.title.trim()) { toast.error('Title is required'); return; }
    if (!f.price || parseFloat(f.price) < 0) { toast.error('Enter a valid price'); return; }
    if (!f.categoryId) { toast.error('Please select a category'); return; }
    if (!f.condition) { toast.error('Please select condition'); return; }

    const payload = {
      title: f.title.trim(),
      description: f.description.trim(),
      price: parseFloat(f.price),
      condition: f.condition,
      categoryId: parseInt(f.categoryId),
      location: f.location.trim(),
    };

    setLoading(true);
    try {
      const res = await productAPI.create(payload);
      const productId = res.data.data.id;
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append('files', img));
        await productAPI.addImages(productId, fd);
      }
      toast.success('Listing created!');
      nav(`/products/${productId}`);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('title')) toast.error('Title is required');
      else if (msg.includes('price')) toast.error('Enter a valid price');
      else if (msg.includes('condition')) toast.error('Please select a condition');
      else if (msg.includes('categoryId')) toast.error('Please select a category');
      else toast.error(msg || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <h1 className={s.title}>Create Listing</h1>
        <p className={s.sub}>List your item for sale</p>

        <form onSubmit={onSubmit} className={s.form}>
          <div className={s.grid}>
            {/* Left */}
            <div className={s.left}>
              <div className={s.section}>
                <h3 className={s.sTitle}>Product Details</h3>
                <div className={s.field}>
                  <label className={s.label}>Title *</label>
                  <input className="input" type="text" placeholder="e.g. MacBook Air M2" value={f.title} onChange={set('title')} required maxLength={200}/>
                </div>
                <div className={s.field}>
                  <label className={s.label}>Description</label>
                  <textarea className={`input ${s.textarea}`} placeholder="Describe your item — condition, age, any issues..." value={f.description} onChange={set('description')} rows={5}/>
                </div>
                <div className={s.row}>
                  <div className={s.field}>
                    <label className={s.label}>Price (₹) *</label>
                    <input className="input" type="number" placeholder="0" value={f.price} onChange={set('price')} min={0} required/>
                  </div>
                  <div className={s.field}>
                    <label className={s.label}>Location</label>
                    <input className="input" type="text" placeholder="Hostel / Area" value={f.location} onChange={set('location')}/>
                  </div>
                </div>
                <div className={s.row}>
                  <div className={s.field}>
                    <label className={s.label}>Category *</label>

                    <select className="input" value={f.categoryId} onChange={set('categoryId')} required>
                      <option value="">Select category</option>
                      <option value="ELECTRONICS">Electronics</option>
                                           <option value="FASHION">Fashion</option>
                                           <option value="SPORTS">Sports</option>
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
              </div>
            </div>

            {/* Right */}
            <div className={s.right}>
              <div className={s.section}>
                <h3 className={s.sTitle}>Photos</h3>
                <label className={s.uploadArea}>
                  <FiUpload size={28} color="var(--t3)"/>
                  <span className={s.uploadText}>Click to upload photos</span>
                  <span className={s.uploadSub}>PNG, JPG up to 10MB each</span>
                  <input type="file" multiple accept="image/*" onChange={onImages} style={{display:'none'}}/>
                </label>
                {previews.length > 0 && (
                  <div className={s.previews}>
                    {previews.map((p,i) => (
                      <div key={i} className={s.preview}>
                        <img src={p} alt={`${i+1}`}/>
                        <button type="button" className={s.removeImg} onClick={() => removeImage(i)}><FiX size={14}/></button>
                        {i === 0 && <span className={s.mainBadge}>Main</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:16}} disabled={loading}>
                {loading ? <><div className="spinner"/>Publishing...</> : 'Publish Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
