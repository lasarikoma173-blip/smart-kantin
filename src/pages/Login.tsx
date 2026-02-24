import React, { useState } from 'react';
import { IonContent, IonPage, IonInput, IonButton, IonLoading, IonText, IonIcon } from '@ionic/react';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Email dan password harus diisi!");
      return;
    }

    setLoading(true);
    try {
      // 1. Proses Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Cek Role di Firestore dengan AWAIT
      const docSnap = await getDoc(doc(db, "users", user.uid));

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        // 3. Redirect cepat
        history.replace(role === 'penjual' ? '/dashboard-penjual' : '/home');
      } else {
        alert("Data user tidak ditemukan di database!");
      }
    } catch (error: any) {
      alert("Gagal Login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={"Menghubungkan..."} />
        
        <div style={{ textAlign: 'center', marginTop: '80px', marginBottom: '40px' }}>
          <h1 style={{ fontWeight: '800', fontSize: '2.5rem', color: '#3880ff', marginBottom: '5px' }}>SmartKantin</h1>
          <IonText color="medium"><p>Silakan login untuk mulai memesan</p></IonText>
        </div>

        <div style={{ padding: '0 10px' }}>
          <div className="modern-input">
            <IonInput 
              placeholder="Email" 
              type="email" 
              value={email} 
              onIonInput={e => setEmail(e.detail.value!)} // PAKAI onIonInput
            >
              <IonIcon icon={mailOutline} slot="start" style={{marginRight: '10px'}} />
            </IonInput>
          </div>

          <div className="modern-input">
            <IonInput 
              placeholder="Password" 
              type="password" 
              value={password} 
              onIonInput={e => setPassword(e.detail.value!)} // PAKAI onIonInput
            >
              <IonIcon icon={lockClosedOutline} slot="start" style={{marginRight: '10px'}} />
            </IonInput>
          </div>

          <IonButton expand="block" onClick={handleLogin} disabled={loading} style={{ height: '55px', marginTop: '30px' }}>
            {loading ? "Menghubungkan..." : "Masuk"}
          </IonButton>

          <IonButton fill="clear" expand="block" color="medium" onClick={() => history.push('/register')}>
            Belum punya akun? <b style={{marginLeft: '5px', color: '#3880ff'}}>Daftar</b>
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;