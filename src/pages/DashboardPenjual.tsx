import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton, IonList, 
  IonCard, IonCardContent, IonText, IonIcon, IonLoading, IonFooter, IonButtons 
} from '@ionic/react';
import { trashOutline, createOutline, listOutline, logOutOutline, addCircleOutline } from 'ionicons/icons';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const DashboardPenjual: React.FC = () => {
  const [namaMenu, setNamaMenu] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState(''); 
  const [daftarMenu, setDaftarMenu] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        history.replace('/login');
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'penjual') {
          setAuthorized(true);
          onSnapshot(query(collection(db, "menus"), where("penjualId", "==", user.uid)), (snap) => {
            setDaftarMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          });
          setLoading(false);
        } else {
          history.replace('/home');
        }
      }
    });
    return () => unsubscribe();
  }, [history]);

  const simpanMenu = async () => {
    // Validasi ketat: pastikan semua terisi
    if (!namaMenu.trim() || !harga || !stok) {
      alert("Isi semua data menu!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama: namaMenu, 
        harga: Number(harga), 
        stok: Number(stok), 
        penjualId: auth.currentUser?.uid 
      };

      if (isEditing) {
        await updateDoc(doc(db, "menus", editId), payload);
        alert("Menu diperbarui!");
      } else {
        await addDoc(collection(db, "menus"), payload);
        alert("Menu berhasil ditambah!");
      }
      
      // Reset form
      setNamaMenu(''); setHarga(''); setStok(''); setIsEditing(false);
    } catch (e: any) { 
      alert("Error: " + e.message); 
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m: any) => {
    setIsEditing(true);
    setEditId(m.id);
    setNamaMenu(m.nama);
    setHarga(m.harga.toString());
    setStok(m.stok.toString());
  };

  if (!authorized) return <IonPage><IonLoading isOpen={loading} message="Mengecek akses..." /></IonPage>;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="success">
          <IonTitle style={{fontWeight: '800'}}>Toko Saya</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => auth.signOut()}><IonIcon icon={logOutOutline} slot="icon-only" /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonLoading isOpen={loading} message="Memproses..." />
        <IonCard style={{marginTop: '20px'}}>
          <IonCardContent>
            <h3 style={{fontWeight: '700', marginBottom: '15px'}}>{isEditing ? 'Update Menu' : 'Tambah Menu Baru'}</h3>
            <div className="modern-input">
              <IonInput placeholder="Nama Menu" value={namaMenu} onIonInput={e => setNamaMenu(e.detail.value!)} />
            </div>
            <div className="modern-input">
              <IonInput type="number" placeholder="Harga" value={harga} onIonInput={e => setHarga(e.detail.value!)} />
            </div>
            <div className="modern-input">
              <IonInput type="number" placeholder="Stok" value={stok} onIonInput={e => setStok(e.detail.value!)} />
            </div>
            <IonButton expand="block" onClick={simpanMenu} shape="round" disabled={loading}>
              <IonIcon icon={isEditing ? createOutline : addCircleOutline} slot="start" /> 
              {isEditing ? "Update Menu" : "Simpan Menu"}
            </IonButton>
            {isEditing && <IonButton fill="clear" expand="block" onClick={() => { setIsEditing(false); setNamaMenu(''); setHarga(''); setStok(''); }}>Batal</IonButton>}
          </IonCardContent>
        </IonCard>

        <div style={{padding: '0 20px'}}><h3 style={{fontWeight: '700'}}>Daftar Inventori</h3></div>

        <IonList style={{background: 'transparent'}}>
          {daftarMenu.map((m) => (
            <IonCard key={m.id} style={{marginBottom: '10px'}}>
              <div style={{display: 'flex', alignItems: 'center', padding: '10px 15px'}}>
                <div style={{flex: 1}}>
                  <h4 style={{fontWeight: '700', margin: '0'}}>{m.nama}</h4>
                  <IonText color="medium"><small>Rp {m.harga.toLocaleString()} | Stok: {m.stok}</small></IonText>
                </div>
                <IonButton fill="clear" color="warning" onClick={() => handleEdit(m)}><IonIcon icon={createOutline} /></IonButton>
                <IonButton fill="clear" color="danger" onClick={async () => { if(window.confirm('Hapus menu?')) await deleteDoc(doc(db, "menus", m.id)) }}><IonIcon icon={trashOutline} /></IonButton>
              </div>
            </IonCard>
          ))}
        </IonList>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className="ion-padding">
          <IonButton expand="block" color="tertiary" routerLink="/pesanan-masuk" shape="round">
            <IonIcon icon={listOutline} slot="start" /> Cek Pesanan Masuk
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default DashboardPenjual;