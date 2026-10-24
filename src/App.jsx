import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RootLayout from './components/RootLayout'
import Home from './pages/Home'
import CanIApply from './pages/CanIApply'
import Apply from './pages/Apply'
import MockTest from './pages/MockTest'
import Learn from './pages/Learn'
import Track from './pages/Track'
import DigiLockerCallback from './pages/DigiLockerCallback'
import PermanentDL from './pages/PermanentDL'
import VisionTest from './pages/VisionTest'
import HazardTest from './pages/HazardTest'
import TrustLedger from './pages/TrustLedger'
import AdminPortal from './pages/AdminPortal'
import AdminAuth from './pages/AdminAuth'
import AdminGuard from './components/AdminGuard'

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          {/* Citizen Journey Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/can-i-apply" element={<CanIApply />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/documents" element={<Apply />} />
          <Route path="/digilocker-callback" element={<DigiLockerCallback />} />
          <Route path="/digilocker/callback" element={<DigiLockerCallback />} />
          <Route path="/mock-test" element={<MockTest />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/track" element={<Track />} />
          <Route path="/permanent-dl" element={<PermanentDL />} />

          {/* HackCache26 Mark-III Winning Innovation Pillars */}
          <Route path="/vision-test" element={<VisionTest />} />
          <Route path="/netra-vision" element={<VisionTest />} />
          <Route path="/hazard-test" element={<HazardTest />} />
          <Route path="/stall-pro" element={<HazardTest />} />
          <Route path="/verify" element={<TrustLedger />} />
          <Route path="/trust-ledger" element={<TrustLedger />} />

          {/* Dedicated Official RTO Admin Authentication Routes */}
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin/signup" element={<AdminAuth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />

          {/* Protected Official RTO Admin Scrutiny Portal */}
          <Route 
            path="/admin" 
            element={
              <AdminGuard>
                <AdminPortal />
              </AdminGuard>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  )
}
