import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { UsuariosAdmin } from "../../components/admin/gestion/UsuariosAdmin";
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";

export function UsuariosAdminPage() {

    return (
        <>
            <NavbarAdmin />
            <UsuariosAdmin />
            <FooterAdmin />
        </>
    )

}