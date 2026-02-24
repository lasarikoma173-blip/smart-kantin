import React, { useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonItem, IonLabel, IonInput, IonButton, IonList, 
  IonCard, IonCardContent, IonSelect, IonSelectOption, 
  IonText, IonLoading, IonIcon 
} from '@ionic/react';
import { personAddOutline, keyOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('siswa');
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const SECRET_TOKEN_PENJUAL = "KANTIN-JUARA"; 

  const handleRegister = async () => {
    // Validasi input: hapus spasi kosong dengan trim()
    if (!email.trim() || !password.trim()) {
      alert("Email dan password wajib diisi!");
      return;
    }

    if (role === 'penjual' && tokenInput !== SECRET_TOKEN_PENJUAL) {
      alert("KODE AKTIVASI SALAH!");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, "users", res.user.uid), {
        email: email,
        role: role,
        createdAt: new Date()
      });

      alert("Pendaftaran Berhasil sebagai " + role);
      history.replace(role === 'penjual' ? '/dashboard-penjual' : '/home');
    } catch (e: any) {
      alert("Gagal Daftar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Daftar Akun SmartKantin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={"Mendaftarkan akun..."} />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <IonIcon icon={personAddOutline} style={{ fontSize: '64px', color: '#3880ff' }} />
          <h2>Buat Akun Baru</h2>
        </div>

        <IonCard>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={mailOutline} slot="start" />
                <IonLabel position="floating">Email</IonLabel>
                <IonInput 
                  type="email" 
                  value={email} 
                  onIonInput={e => setEmail(e.detail.value!)} // PAKAI onIonInput
                />
              </IonItem>

              <IonItem>
                <IonIcon icon={lockClosedOutline} slot="start" />
                <IonLabel position="floating">Password</IonLabel>
                <IonInput 
                  type="password" 
                  value={password} 
                  onIonInput={e => setPassword(e.detail.value!)} // PAKAI onIonInput
                />
              </IonItem>

              <IonItem>
                <IonLabel>Daftar Sebagai</IonLabel>
                <IonSelect value={role} onIonChange={e => setRole(e.detail.value)}>
                  <IonSelectOption value="siswa">Siswa (Pembeli)</IonSelectOption>
                  <IonSelectOption value="penjual">Penjual (Kantin)</IonSelectOption>
                </IonSelect>
              </IonItem>

              {role === 'penjual' && (
                <IonItem lines="none" style={{ marginTop: '10px', background: '#fff4f4', borderRadius: '10px' }}>
                  <IonIcon icon={keyOutline} slot="start" color="danger" />
                  <IonLabel position="floating" color="danger">Kode Aktivasi Penjual</IonLabel>
                  <IonInput 
                    type="text" 
                    value={tokenInput} 
                    onIonInput={e => setTokenInput(e.detail.value!)}
                    placeholder="Wajib diisi bagi penjual"
                  />
                </IonItem>
              )}
            </IonList>

            <IonButton expand="block" className="ion-margin-top" onClick={handleRegister} disabled={loading}>
              {loading ? "Proses..." : "Daftar Sekarang"}
            </IonButton>

            <IonButton expand="block" fill="clear" color="medium" onClick={() => history.push('/login')}>
              Sudah punya akun? Login
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Register;