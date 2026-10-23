import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CanIApply from './pages/CanIApply'
import Learn from './pages/Learn'
import Track from './pages/Track'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/can-i-apply" element={<CanIApply />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/track" element={<Track />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
