import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonCard, IonLabel, IonText, IonButton, IonIcon, IonFooter, IonSearchbar, IonButtons, IonLoading, IonBadge,
} from '@ionic/react';
import { cartOutline, logOutOutline, addOutline, removeOutline, cashOutline, fastFoodOutline, listOutline } from 'ionicons/icons';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, query, addDoc, getDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const Home: React.FC = () => {
  const [menus, setMenus] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]); 
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) history.replace('/login');
      else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'siswa') {
          setAuthorized(true);
          loadData();
        } else history.replace('/dashboard-penjual');
      }
    });
    return () => unsubscribe();
  }, [history]);

  const loadData = () => {
    onSnapshot(query(collection(db, "menus")), (snapshot) => {
      setMenus(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  };

  // --- TAMBAHKAN FUNGSI LOGOUT INI ---
  const handleLogout = async () => {
    if (window.confirm("Yakin ingin keluar?")) {
      await auth.signOut();
      history.replace('/login');
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.id === item.id);
    if ((existing?.qty || 0) < item.stok) {
      if (existing) setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      else setCart([...cart, { ...item, qty: 1 }]);
    } else alert("Stok habis!");
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(c => c.id === itemId);
    if (existing?.qty === 1) setCart(cart.filter(c => c.id !== itemId));
    else setCart(cart.map(c => c.id === itemId ? { ...c, qty: c.qty - 1 } : c));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      for (const item of cart) {
        await updateDoc(doc(db, "menus", item.id), { stok: increment(-item.qty) });
      }
      await addDoc(collection(db, "orders"), {
        siswaId: auth.currentUser?.uid,
        siswaEmail: auth.currentUser?.email, // Tambahin email biar penjual tahu siapa yang beli
        items: cart,
        total: cart.reduce((acc, curr) => acc + (curr.harga * curr.qty), 0),
        status: "Diproses",
        createdAt: new Date()
      });
      alert("Pesanan Terkirim!");
      setCart([]);
    } catch (e: any) { alert(e.message); }
    setLoading(false);
  };

  if (!authorized) return <IonPage><IonLoading isOpen={loading} message="Mengecek akses..." /></IonPage>;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary" style={{ paddingTop: '10px' }}>
          <IonTitle style={{ fontWeight: '800', fontSize: '1.4rem' }}>SmartKantin</IonTitle>
          <IonButtons slot="end">
            {/* Tombol Riwayat Pesanan */}
            <IonButton onClick={() => history.push('/riwayat-pesanan')}>
              <IonIcon icon={listOutline} slot="icon-only" />
            </IonButton>
            {/* Tombol Logout */}
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar color="primary">
          <IonSearchbar 
            placeholder="Mau makan apa hari ini?" 
            onIonChange={e => setSearchText(e.detail.value!)}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '16px 16px 0 16px' }}>
          <h2 style={{ fontWeight: '700' }}>Menu Spesial</h2>
        </div>
        
        {menus.filter(m => m.nama.toLowerCase().includes(searchText.toLowerCase())).map((item) => {
          const inCart = cart.find(c => c.id === item.id);
          return (
            <IonCard key={item.id}>
              <div style={{ display: 'flex', padding: '15px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '15px', background: '#e0f2fe', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <IonIcon icon={fastFoodOutline} style={{ fontSize: '30px', color: '#3880ff' }} />
                </div>
                <div style={{ flex: 1, paddingLeft: '15px' }}>
                  <h3 style={{ fontWeight: '700', margin: '0' }}>{item.nama}</h3>
                  <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#2ecc71' }}>Rp {item.harga.toLocaleString()}</p>
                  <IonBadge color="light">Sisa: {item.stok}</IonBadge>
                </div>
              </div>

              <div style={{ padding: '0 15px 15px 15px' }}>
                {inCart ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', padding: '5px' }}>
                    <IonButton fill="clear" color="danger" onClick={() => removeFromCart(item.id)}><IonIcon icon={removeOutline} /></IonButton>
                    <IonText style={{ fontWeight: 'bold' }}>{inCart.qty}</IonText>
                    <IonButton fill="clear" color="success" onClick={() => addToCart(item)}><IonIcon icon={addOutline} /></IonButton>
                  </div>
                ) : (
                  <IonButton expand="block" shape="round" disabled={item.stok <= 0} onClick={() => addToCart(item)}>
                    {item.stok > 0 ? "Tambah Pesanan" : "Habis"}
                  </IonButton>
                )}
              </div>
            </IonCard>
          );
        })}
      </IonContent>

      {cart.length > 0 && (
        <IonFooter className="ion-no-border" style={{ background: '#fff', borderRadius: '25px 25px 0 0', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)' }}>
          <div className="ion-padding">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <IonText color="medium">Total Pesanan</IonText>
              <IonText color="primary" style={{ fontWeight: '800', fontSize: '1.2rem' }}>Rp {cart.reduce((a, b) => a + (b.harga * b.qty), 0).toLocaleString()}</IonText>
            </div>
            <IonButton expand="block" color="success" shape="round" onClick={handleCheckout} style={{ height: '50px' }}>
              <IonIcon icon={cashOutline} slot="start" /> Konfirmasi Bayar ({cart.reduce((a, b) => a + b.qty, 0)})
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default Home;