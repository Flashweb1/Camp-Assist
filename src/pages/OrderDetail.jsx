import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChatBox from '../components/ChatBox';
import DeliveryMap from '../components/DeliveryMap';
import './OrderDetail.css';

const STATUS_FLOW = {
  vendor: {
    pending:     { next: 'accepted',    label: 'Accept Order ✅' },
    accepted:    { next: 'in_progress', label: 'Mark In Progress 🚶' },
    in_progress: { next: 'delivered',   label: 'Mark Delivered ✔️' },
  },
};

const STATUS_LABELS = {
  pending: '⏳ Pending',
  accepted: '✅ Accepted',
  in_progress: '🚶 In Progress',
  delivered: '✔️ Delivered',
  cancelled: '❌ Cancelled',
};

const STATUS_BADGE = {
  pending: 'badge--gold', accepted: 'badge--green',
  in_progress: 'badge--blue', delivered: 'badge--green', cancelled: 'badge--red',
};

function StarRatingInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: '2rem', cursor: 'pointer' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange(i)} style={{ color: i <= value ? '#E8A020' : 'rgba(232,160,32,0.25)', transition: 'color 0.15s' }}>★</span>
      ))}
    </div>
  );
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orders', orderId), snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return unsub;
  }, [orderId]);

  const updateStatus = async (nextStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
        ...(nextStatus === 'delivered' ? { paymentStatus: 'paid' } : {}),
      });
      addToast(`Order marked as ${STATUS_LABELS[nextStatus]}`, 'success');
    } catch {
      addToast('Error updating status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled', updatedAt: serverTimestamp() });
      addToast('Order cancelled', 'info');
    } catch {
      addToast('Error cancelling order', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const submitRating = async () => {
    if (rating === 0) return;
    setUpdating(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        orderId,
        corpsId: currentUser.uid,
        vendorId: order.vendorId,
        stars: rating,
        comment,
        createdAt: serverTimestamp(),
      });
      const q = query(collection(db, 'ratings'), where('vendorId', '==', order.vendorId));
      const snap = await getDocs(q);
      const stars = snap.docs.map(d => d.data().stars).filter(s => typeof s === 'number');
      const avg = stars.length > 0 ? stars.reduce((a, b) => a + b, 0) / stars.length : rating;
      await updateDoc(doc(db, 'vendors', order.vendorId), {
        rating: Math.round(avg * 10) / 10,
        totalRatings: stars.length,
      });
      setRated(true);
      addToast('Thank you for rating!', 'success');
    } catch {
      addToast('Error submitting rating', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!order) return (
    <div className="page container">
      <div className="empty-state">
        <div className="empty-state__icon">❌</div>
        <div className="empty-state__title">Order not found</div>
        <button className="btn btn--outline" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );

  const isVendor = role === 'vendor';
  const otherName = isVendor ? order.corpsName : order.vendorName;
  const flow = isVendor ? STATUS_FLOW.vendor[order.status] : null;

  return (
    <div className="page od-page">
      <div className="container">
        <div className="od-nav">
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Back</button>
        </div>

        {/* Order header */}
        <div className="od-header card">
          <div className="od-header__top">
            <div>
              <div className="od-header__label">Order from</div>
              <div className="od-header__name">{otherName}</div>
            </div>
            <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABELS[order.status]}</span>
          </div>
          <div className="od-header__desc">{order.description}</div>
          <div className="od-header__meta">
            <span>📍 {order.deliveryLocation}</span>
            <span className={`od-payment ${order.paymentStatus === 'paid' ? 'od-payment--paid' : ''}`}>
              💵 {order.paymentStatus === 'paid' ? 'Paid' : 'Pay on delivery'}
            </span>
          </div>
        </div>

        {/* Vendor actions */}
        {isVendor && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <div className="od-actions">
            {flow && (
              <button className="btn btn--primary btn--full" disabled={updating} onClick={() => updateStatus(flow.next)}>
                {updating ? 'Updating...' : flow.label}
              </button>
            )}
            <button className="btn btn--danger btn--full" disabled={updating} onClick={cancelOrder}>
              Cancel Order
            </button>
          </div>
        )}

        {/* Corps member: cancel if pending */}
        {!isVendor && order.status === 'pending' && (
          <div className="od-actions">
            <button className="btn btn--danger btn--full" disabled={updating} onClick={cancelOrder}>
              Cancel Order
            </button>
          </div>
        )}

        {/* Rating — corps member, only when delivered */}
        {!isVendor && order.status === 'delivered' && !rated && (
          <div className="od-rating card">
            <div className="od-rating__title">Rate this service</div>
            <StarRatingInput value={rating} onChange={setRating} />
            <textarea
              className="form-input" rows={2}
              placeholder="Leave a comment (optional)"
              value={comment} onChange={e => setComment(e.target.value)}
              style={{ marginTop: 10 }}
            />
            <button className="btn btn--gold btn--full" disabled={rating === 0 || updating} onClick={submitRating} style={{ marginTop: 10 }}>
              Submit Rating
            </button>
          </div>
        )}
        {rated && (
          <div className="od-rated">⭐ Thanks for your rating!</div>
        )}

        {/* Live Location — when order is active */}
        {(order.status === 'accepted' || order.status === 'in_progress') && (
          <DeliveryMap orderId={orderId} />
        )}

        {/* Chat */}
        <div style={{ marginTop: 20 }}>
          <ChatBox orderId={orderId} otherPartyName={otherName} />
        </div>
      </div>
    </div>
  );
}
