import { Routes, Route } from 'react-router-dom'
import { PaginapalCliente } from './page/Cliente/PaginaPrinicpal.jsx'
import { PaginaNuevosCliente } from './page/Cliente/PaginaNuevos.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginapalCliente />} />
      <Route path="/new-arrivals" element={<PaginaNuevosCliente />} />
    </Routes>
  )
}

export default App
