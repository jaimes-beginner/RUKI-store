import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { POSAdmin } from "../../components/admin/gestion/POSAdmin";
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";

export function POSAdminPage() {

    return (
        <>
            <NavbarAdmin />
            <POSAdmin />
            <FooterAdmin />
        </>
    )

}