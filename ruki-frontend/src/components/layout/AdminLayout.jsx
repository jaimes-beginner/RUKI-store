import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; 
import AdminFooter from './AdminFooter'; 

export default function AdminLayout() {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <AdminNavbar />
            
            <main className="flex-grow-1 p-4">
                <Outlet />
            </main>
            
            <AdminFooter />
        </div>
    );
}