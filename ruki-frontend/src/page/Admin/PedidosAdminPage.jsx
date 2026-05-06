import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { PedidosAdmin } from "../../components/admin/gestion/PedidosAdmin";
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";

export function PedidosAdminPage() {

    return (
        <>
            <NavbarAdmin />
            <PedidosAdmin />
            <FooterAdmin />
        </>
    )

}