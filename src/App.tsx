import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonLoading } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React, { useEffect, useState } from 'react';

/* --- 1. KELOMPOK IMPORT HALAMAN --- */
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home'; // Halaman Siswa
import DashboardPenjual from './pages/DashboardPenjual';
import PesananMasuk from './pages/PesananMasuk';
import RiwayatPesanan from './pages/RiwayatPesanan';
/* --- 2. KELOMPOK FIREBASE CONFIG --- */
import { auth } from './firebaseConfig';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // --- 3. KELOMPOK LOGIC SESSION (KEEP LOGIN) ---
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Fungsi ini akan berjalan otomatis setiap kali aplikasi dibuka
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Jika user ditemukan (sudah login sebelumnya)
        setIsLoggedIn(true);
        console.log("Session Aktif: ", user.email);
      } else {
        // Jika tidak ada user yang login
        setIsLoggedIn(false);
        console.log("Tidak ada session aktif.");
      }
      // Berhenti loading setelah pengecekan selesai
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  // Jika aplikasi masih mengecek status login, tampilkan loading agar tidak "flicker" (kedap-kedip)
  if (loading) {
    return <IonLoading isOpen={true} message="Tunggu sebentar..." />;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* --- 4. KELOMPOK ROUTING (JALUR HALAMAN) --- */}

          {/* Jalur awal: Jika sudah login lempar ke Home, jika belum ke Login */}
          <Route exact path="/">
            {isLoggedIn ? <Redirect to="/home" /> : <Redirect to="/login" />}
          </Route>

          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          
          {/* Jalur Aplikasi Utama */}
          <Route exact path="/home" component={Home} />
          <Route exact path="/dashboard-penjual" component={DashboardPenjual} />
          <Route exact path="/pesanan-masuk" component={PesananMasuk} />

          <Route exact path="/riwayat-pesanan" component={RiwayatPesanan} />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;