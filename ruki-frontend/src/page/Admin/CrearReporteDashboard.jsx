import { NavbarAdmin } from "../../components/admin/navbar/NavbarAdmin";
import { FooterAdmin } from "../../components/admin/footer/FooterAdmin";
import { ReporteDashboard } from "../../components/admin/gestion/ReporteDashboard";

/*-------------------------------------------------*/

export function CrearReporteDashboard() {
	return (
		<div className="admin-reporte-page">
			<NavbarAdmin />
			<ReporteDashboard />
			<FooterAdmin />
		</div>
	);
}

export default CrearReporteDashboard;
