import CinematicLanding from "./components/CinematicLanding.jsx";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CinematicLanding />
      <div id="mission-dashboard">
        <App />
      </div>
  </StrictMode>,
)
