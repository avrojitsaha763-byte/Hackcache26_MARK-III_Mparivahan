import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CanIApply from './pages/CanIApply'
import Apply from './pages/Apply'
import MockTest from './pages/MockTest'
import Learn from './pages/Learn'
import Track from './pages/Track'
import PermanentDL from './pages/PermanentDL'
import AdminPortal from './pages/AdminPortal'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/can-i-apply" element={<CanIApply />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/documents" element={<Apply />} />
        <Route path="/mock-test" element={<MockTest />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/track" element={<Track />} />
        <Route path="/permanent-dl" element={<PermanentDL />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
