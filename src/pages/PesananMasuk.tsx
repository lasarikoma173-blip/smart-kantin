import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonItem, IonLabel, IonText, IonButton, IonBadge, IonIcon, IonButtons, IonBackButton, IonLoading
} from '@ionic/react';
import { checkmarkDoneOutline, timeOutline, personOutline, fastFoodOutline, receiptOutline } from 'ionicons/icons';
import { db, auth } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const PesananMasuk: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil semua order, urutkan dari yang paling baru
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataTemp: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // LOGIC FILTER: Hanya tampilkan pesanan yang punya item milik penjual ini
        const myItems = data.items.filter((item: any) => item.penjualId === auth.currentUser?.uid);
        
        if (myItems.length > 0) {
          dataTemp.push({ id: doc.id, ...data, filteredItems: myItems });
        }
      });
      setOrders(dataTemp);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const tandaiSelesai = async (orderId: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Selesai"
      });
    } catch (e) { alert(e); }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="success">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard-penjual" />
          </IonButtons>
          <IonTitle style={{fontWeight: '800'}}>Pesanan Masuk</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Memuat pesanan..." />

        <div style={{ marginBottom: '20px', padding: '0 10px' }}>
          <h2 style={{ fontWeight: '700', margin: '0' }}>Antrean Pesanan</h2>
          <IonText color="medium"><p>Kelola pesanan siswa secara real-time</p></IonText>
        </div>

        {orders.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <IonIcon icon={receiptOutline} style={{ fontSize: '80px', color: '#ccc' }} />
            <br />
            <IonText color="medium"><h3>Belum ada pesanan hari ini</h3></IonText>
          </div>
        )}

        {orders.map((order) => (
          <IonCard key={order.id} style={{ 
            borderLeft: order.status === 'Selesai' ? '12px solid #2dd36f' : '12px solid #ffd534',
            margin: '0 0 20px 0'
          }}>
            <IonItem lines="full">
              <div style={{ 
                background: '#f4f4f4', 
                padding: '8px', 
                borderRadius: '10px', 
                marginRight: '12px',
                display: 'flex'
              }}>
                <IonIcon icon={personOutline} color="primary" />
              </div>
              <IonLabel>
                <h2 style={{ fontWeight: 'bold' }}>Siswa: {order.siswaEmail?.split('@')[0]}</h2>
                <p style={{ display: 'flex', alignItems: 'center' }}>
                  <IonIcon icon={timeOutline} style={{ marginRight: '5px' }} />
                  {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Baru saja'}
                </p>
              </IonLabel>
              <IonBadge 
                style={{ padding: '8px 12px', borderRadius: '8px' }}
                color={order.status === 'Selesai' ? "success" : "warning"}
              >
                {order.status}
              </IonBadge>
            </IonItem>

            <div className="ion-padding">
              <IonText color="medium" style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                Detail Menu:
              </IonText>
              
              <div style={{ marginTop: '10px' }}>
                {order.filteredItems.map((item: any, idx: number) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '8px',
                    background: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '8px'
                  }}>
                    <IonText style={{ fontWeight: '600' }}>
                      <span style={{ color: '#3880ff' }}>{item.qty}x</span> {item.nama}
                    </IonText>
                    <IonText style={{ fontWeight: 'bold' }}>Rp {(item.harga * item.qty).toLocaleString()}</IonText>
                  </div>
                ))}
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '15px', 
                padding: '10px', 
                borderTop: '1px dashed #ccc' 
              }}>
                <IonText style={{ fontWeight: 'bold' }}>Total Pendapatan</IonText>
                <IonText color="primary" style={{ fontWeight: '800', fontSize: '1.1rem' }}>
                  Rp {order.total.toLocaleString()}
                </IonText>
              </div>

              {order.status !== 'Selesai' && (
                <IonButton 
                  expand="block" 
                  color="success" 
                  className="ion-margin-top" 
                  shape="round"
                  style={{ height: '50px' }}
                  onClick={() => tandaiSelesai(order.id)}
                >
                  <IonIcon icon={checkmarkDoneOutline} slot="start" />
                  Selesaikan Pesanan
                </IonButton>
              )}
            </div>
          </IonCard>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default PesananMasuk;