import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './PlaceOrder.css';

export default function PlaceOrder() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState({ description: '', deliveryLocation: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'vendors', vendorId));
      if (snap.exists()) setVendor({ uid: snap.id, ...snap.data() });
      setFetching(false);
    }
    load();
    // Pre-fill delivery location from profile
    if (userProfile?.hostelBlock) {
      setForm(f => ({ ...f, deliveryLocation: userProfile.hostelBlock }));
    }
  }, [vendorId, userProfile]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setLoading(true);
    try {
      const orderData = {
        corpsId: currentUser.uid,
        corpsName: userProfile?.name || 'Corps Member',
        vendorId,
        vendorName: vendor?.businessName || vendor?.name || 'Vendor',
        description: form.description.trim(),
        deliveryLocation: form.deliveryLocation.trim(),
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'orders'), orderData);
      addToast('Order placed successfully!', 'success');
      navigate(`/order/${ref.id}`);
    } catch (err) {
      addToast('Error placing order: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page po-page">
      <div className="container">
        <div className="po-nav">
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        <div className="page-hd">
          <div className="page-hd__title">Place Order</div>
          <div className="page-hd__sub">Tell the vendor exactly what you need</div>
        </div>

        {/* Vendor summary */}
        {vendor && (
          <div className="po-vendor card">
            <div className="po-vendor__avatar">
              {(vendor.businessName || vendor.name || '?').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="po-vendor__name">{vendor.businessName || vendor.name}</div>
              <div className="po-vendor__loc">📍 {vendor.location}</div>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">What do you want?</label>
            <textarea
              name="description"
              className="form-input"
              rows={4}
              placeholder="Describe your order in detail e.g. 1 plate of jollof rice + chicken, extra sauce please"
              value={form.description}
              onChange={handle}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Location</label>
            <input
              name="deliveryLocation"
              className="form-input"
              placeholder="e.g. Block B, Room 14"
              value={form.deliveryLocation}
              onChange={handle}
              required
            />
            <span className="form-hint">Your hostel block and room number</span>
          </div>

          <div className="po-note card">
            <div className="po-note__icon">💵</div>
            <div className="po-note__text">
              <strong>Pay on delivery</strong> — no upfront payment needed.
              The vendor will collect cash when they bring your order.
            </div>
          </div>

          <button type="submit" className="btn btn--gold btn--full btn--lg" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Placing order...' : 'Send Order Request →'}
          </button>
        </form>
      </div>
    </div>
  );
}
