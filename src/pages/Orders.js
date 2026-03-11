import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPackage, FiCheck, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import s from './Orders.module.css';

const statusBadge = { PENDING:'badge-yellow', CONFIRMED:'badge-blue', COMPLETED:'badge-green', CANCELLED:'badge-gray' };

export default function Orders() {
  const { user } = useAuth();
  const [tab, setTab] = useState('purchases');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [tab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const r = tab === 'purchases'
        ? await orderAPI.getPurchases({ page: 0, size: 20 })
        : await orderAPI.getSales({ page: 0, size: 20 });
      setOrders(r.data.data?.content || []);
    } catch {} finally { setLoading(false); }
  };

  const complete = async id => {
    try {
      await orderAPI.complete(id);
      toast.success('Order marked complete!');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  const cancel = async id => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderAPI.cancel(id);
      toast.success('Order cancelled');
      fetchOrders();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className={s.page}>
      <div className={s.container}>
        <h1 className={s.title}>My Orders</h1>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab==='purchases'?s.tabActive:''}`} onClick={() => setTab('purchases')}>Purchases</button>
          <button className={`${s.tab} ${tab==='sales'?s.tabActive:''}`} onClick={() => setTab('sales')}>Sales</button>
        </div>

        {loading ? (
          <div className={s.list}>
            {Array(4).fill(0).map((_,i) => (
              <div key={i} className={s.skOrder}>
                <div className="skeleton" style={{height:80,flex:1,borderRadius:'var(--r-md)'}}/>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={s.empty}>
            <FiPackage size={48} color="var(--t4)"/>
            <h3>No {tab} yet</h3>
            <p>{tab === 'purchases' ? 'Browse listings and place your first order!' : 'List something to start selling!'}</p>
          </div>
        ) : (
          <div className={s.list}>
            {orders.map(o => (
              <div key={o.id} className={s.order}>
                <div className={s.orderLeft}>
                  <div className={s.orderIcon}>📦</div>
                  <div className={s.orderInfo}>
                    <p className={s.orderTitle}>
                      {o.product?.title || 'Product'}
                    </p>
                    <p className={s.orderMeta}>
                      {tab === 'purchases'
                        ? `Seller: ${o.seller?.username}`
                        : `Buyer: ${o.buyer?.username}`
                      }
                    </p>
                    <p className={s.orderTime}>{o.createdAt ? formatDistanceToNow(new Date(o.createdAt), {addSuffix:true}) : ''}</p>
                  </div>
                </div>
                <div className={s.orderRight}>
                  <p className={s.orderPrice}>₹{Number(o.amount).toLocaleString('en-IN')}</p>
                  <span className={`badge ${statusBadge[o.status]}`}>{o.status}</span>
                  <div className={s.orderActions}>
                    {tab === 'sales' && o.status === 'PENDING' && (
                      <button className="btn btn-primary" style={{padding:'7px 14px',fontSize:13}} onClick={() => complete(o.id)}>
                        <FiCheck size={14}/> Complete
                      </button>
                    )}
                    {o.status === 'PENDING' && (
                      <button className="btn btn-danger" style={{padding:'7px 14px',fontSize:13}} onClick={() => cancel(o.id)}>
                        <FiX size={14}/> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
