import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const VENDORS = [
  {
    category: 'food',
    businessName: 'Mama Bisi Foods',
    name: 'Bisi Ogunlesi',
    phone: '08012345671',
    location: 'Mama Market, Stall 5',
    description: 'Hot jollof rice, fried rice, beans & plantain, egusi soup, snacks & cold drinks. Open for breakfast, lunch & dinner.',
    isAvailable: true,
    rating: 4.3,
    totalRatings: 12,
  },
  {
    category: 'laundry',
    businessName: 'Quick Clean Laundry',
    name: 'Emeka Nwosu',
    phone: '08012345672',
    location: 'Near Block C, Room 10',
    description: 'Wash, iron & fold. Same-day service available. Khaki, white uniforms & casual wear. Pickup & delivery included.',
    isAvailable: true,
    rating: 4.8,
    totalRatings: 24,
  },
  {
    category: 'errands',
    businessName: 'Camp Runner',
    name: 'Chidi Okonkwo',
    phone: '08012345673',
    location: 'Parade Ground Kiosk',
    description: 'I run any errand — recharge cards, toiletries, snacks, printing, photocopying. Just text me what you need.',
    isAvailable: true,
    rating: 3.9,
    totalRatings: 8,
  },
  {
    category: 'items',
    businessName: 'Corps Mart',
    name: 'Aisha Bello',
    phone: '08012345674',
    location: 'Block A, Room 3',
    description: 'Selling uniform accessories, white canvas, belts, socks, name tags, padlocks, bed sheets, and basic toiletries.',
    isAvailable: false,
    rating: 4.1,
    totalRatings: 6,
  },
];

export async function seedDatabase() {
  const vendorIds = [];
  for (const v of VENDORS) {
    const ref = await addDoc(collection(db, 'vendors'), {
      ...v,
      uid: 'demo_' + v.businessName.replace(/\s+/g, '_').toLowerCase(),
      createdAt: serverTimestamp(),
    });
    vendorIds.push(ref.id);
  }

  await addDoc(collection(db, 'orders'), {
    corpsId: 'demo_corps',
    corpsName: 'Adekunle Gold',
    vendorId: vendorIds[0],
    vendorName: 'Mama Bisi Foods',
    description: '1 plate of jollof rice with chicken, extra pepper, and a bottle of water',
    deliveryLocation: 'Block B, Room 14',
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'orders'), {
    corpsId: 'demo_corps',
    corpsName: 'Adekunle Gold',
    vendorId: vendorIds[1],
    vendorName: 'Quick Clean Laundry',
    description: '2 pairs of khaki trousers and 3 white shirts — wash and iron',
    deliveryLocation: 'Platoon 3',
    status: 'in_progress',
    paymentStatus: 'unpaid',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'orders'), {
    corpsId: 'demo_corps',
    corpsName: 'Adekunle Gold',
    vendorId: vendorIds[0],
    vendorName: 'Mama Bisi Foods',
    description: '2 servings of fried rice and 1 bottle of Fanta',
    deliveryLocation: 'Parade Ground',
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { vendorIds };
}

export async function clearSeedData() {
  const { deleteDoc, getDocs } = await import('firebase/firestore');
  const vendorSnap = await getDocs(collection(db, 'vendors'));
  const orderSnap = await getDocs(collection(db, 'orders'));
  const del = async (snap) => { for (const d of snap.docs) await deleteDoc(d.ref); };
  await del(vendorSnap);
  await del(orderSnap);
}
