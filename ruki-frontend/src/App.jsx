import { Routes, Route } from 'react-router-dom'
import { PaginaPrincipalCliente } from './page/Cliente/PaginaPrinicpal.jsx'
import { PaginaNuevosCliente } from './page/Cliente/PaginaNuevos.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipalCliente />} />
      <Route path="/new-arrivals" element={<PaginaNuevosCliente />} />
    </Routes>
  )
}

export default App
