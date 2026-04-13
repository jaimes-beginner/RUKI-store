import { Routes, Route } from 'react-router-dom'
import { PaginaPrincipalCliente } from './page/Cliente/PaginaPrinicpal.jsx'
import { PaginaNuevosCliente } from './page/Cliente/PaginaNuevos.jsx'
import { PaginaSaleCliente } from './page/Cliente/PaginaSale.jsx'
import { PaginaProductosCliente } from './page/Cliente/PaginaProductos.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPrincipalCliente />} />
      <Route path="/new-arrivals" element={<PaginaNuevosCliente />} />
      <Route path="/productos" element={<PaginaProductosCliente />} />
      <Route path="/sale" element={<PaginaSaleCliente />} />
    </Routes>
  )
}

export default App
