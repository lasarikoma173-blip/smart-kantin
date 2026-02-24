import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonItem, IonLabel, IonText, IonBadge, IonIcon, IonButtons, IonBackButton, IonLoading 
} from '@ionic/react';
import { timeOutline, fastFoodOutline, checkmarkCircle, hourglassOutline } from 'ionicons/icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const RiwayatPesanan: React.FC = () => {
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Query: Ambil order milik saya saja, urutkan dari yang terbaru
      const q = query(
        collection(db, "orders"), 
        where("siswaId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyOrders(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle style={{fontWeight: '800'}}>Pesanan Saya</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Menarik riwayat..." />

        {myOrders.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonText color="medium">Kamu belum pernah pesan apa-apa nih.</IonText>
          </div>
        )}

        {myOrders.map((order) => (
          <IonCard key={order.id} style={{ marginBottom: '15px' }}>
            <IonItem lines="full">
              <IonIcon 
                icon={order.status === 'Selesai' ? checkmarkCircle : hourglassOutline} 
                slot="start" 
                color={order.status === 'Selesai' ? "success" : "warning"} 
              />
              <IonLabel>
                <h2 style={{ fontWeight: 'bold' }}>
                  {order.status === 'Selesai' ? 'Pesanan Siap!' : 'Sedang Disiapkan'}
                </h2>
                <p style={{ display: 'flex', alignItems: 'center' }}>
                  <IonIcon icon={timeOutline} style={{ marginRight: '5px' }} />
                  {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'Baru saja'}
                </p>
              </IonLabel>
              <IonBadge color={order.status === 'Selesai' ? "success" : "warning"}>
                {order.status}
              </IonBadge>
            </IonItem>

            <div className="ion-padding">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <IonText>{item.nama} x{item.qty}</IonText>
                  <IonText color="medium">Rp {(item.harga * item.qty).toLocaleString()}</IonText>
                </div>
              ))}
              <hr style={{ border: '0.5px solid #eee' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <IonText>Total Bayar</IonText>
                <IonText color="primary">Rp {order.total.toLocaleString()}</IonText>
              </div>
            </div>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default RiwayatPesanan;