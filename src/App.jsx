import React from 'react'
import MainLayout from './components/Layout/MainLayout'
import MapComponent from './components/Map/MapContainer'
import { RFProvider } from './context/RFContext'


function App() {
  return (
    <RFProvider>
      <MainLayout>
        <MapComponent />
      </MainLayout>
    </RFProvider>
  )
}

export default App
