import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { InventarioAdmin } from "../../components/admin/gestion/InventarioAdmin"
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";

export function InventarioAdminPage() {

    return (
        <>
            <NavbarAdmin />
            <InventarioAdmin />
            <FooterAdmin />
        </>
    )

}