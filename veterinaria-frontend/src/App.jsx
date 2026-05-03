import { Routes, Route } from "react-router-dom";

import { Login } from "./pages/Guest/Log_In/login.jsx";
import { Guest } from "./pages/Guest/Main_Page/guest.jsx";
import { Register } from "./pages/Guest/Register/register.jsx";
import { ClientHome } from "./pages/Client/Main_Page/client.jsx";
import { Appointment } from "./pages/Client/Appointment/appointment.jsx";
import { Pets } from "./pages/Client/Pets/pets.jsx";
import { PetAdd } from "./pages/Client/PetAdd/petAdd.jsx";
import { PetDetails } from "./pages/Client/PetDetails/petDetails.jsx";
import { History } from "./pages/Client/History/history.jsx";
import { Profile } from "./pages/Shared/Profile/profile.jsx";
import { ClientRoute } from "./components/Routes/ClientRoute.jsx";
import { GuestRoute } from "./components/Routes/GuestRoute.jsx";
import { AuthRoute } from "./components/Routes/AuthRoute.jsx";
import { VetRoute } from "./components/Routes/VetRoute.jsx";
import { VetHome } from "./pages/Vets/MainPage/vets.jsx";
import { AtenderCita } from "./pages/Vets/Atender/atender.jsx";
import { VetHistory } from "./pages/Vets/History/vetHistory.jsx";
import { AdminRoute } from "./components/Routes/AdminRoute.jsx";
import { AdminCitas } from "./pages/Admin/Citas/adminCitas.jsx";
import { AdminVets } from "./pages/Admin/Vets/adminVets.jsx";
import { RegisterVet } from "./pages/Admin/AddVet/registerVet.jsx";
import { AdminManager } from "./pages/Admin/AdminManager/adminManager.jsx";
import { RegisterAdmin } from "./pages/Admin/AddAdmin/registerAdmin.jsx";
import { AdminServices } from "./pages/Admin/Services/adminServices.jsx";
import { AddService } from "./pages/Admin/AddService/addService.jsx";
import { AdminLogs } from "./pages/Admin/Logs_Admin/adminLogs.jsx";
import { AdminClients } from "./pages/Admin/Clients/adminClients.jsx";
import { AdminPets } from "./pages/Admin/Pets/adminPets.jsx";

export function App() {
	return (
		<Routes>
			{/* Rutas de invitado: solo accesibles sin sesión activa */}
			<Route element={<GuestRoute />}>
				<Route path="/" element={<Guest />} />
				<Route path="/inicio-sesion" element={<Login />} />
				<Route path="/registro" element={<Register />} />
			</Route>

			{/* Rutas exclusivas de cliente */}
			<Route element={<ClientRoute />}>
				<Route path="/cliente" element={<ClientHome />} />
				<Route path="/agendar-cita" element={<Appointment />} />
				<Route path="/mascotas" element={<Pets />} />
				<Route path="/nueva-mascota" element={<PetAdd />} />
				<Route path="/detalles-mascota/:id" element={<PetDetails />} />
				<Route path="/historial" element={<History />} />
			</Route>

			{/* Rutas exclusivas de veterinario */}
			<Route element={<VetRoute />}>
				<Route path="/veterinario" element={<VetHome />} />
				<Route path="/atender-cita/:id" element={<AtenderCita />} />
				<Route path="/vet-historial" element={<VetHistory />} />
			</Route>

			{/* Rutas exclusivas de administrador */}
			<Route element={<AdminRoute />}>
				<Route path="/admin/citas" element={<AdminCitas />} />
				<Route path="/admin/veterinarios" element={<AdminVets />} />
				<Route path="/admin/nuevo-veterinario" element={<RegisterVet />} />
				<Route path="/admin/administradores" element={<AdminManager />} />
				<Route path="/admin/nuevo-administrador" element={<RegisterAdmin />} />
				<Route path="/admin/servicios" element={<AdminServices />} />
				<Route path="/admin/nuevo-servicio" element={<AddService />} />
				<Route path="/admin/logs" element={<AdminLogs />} />
				<Route path="/admin/clientes" element={<AdminClients />} />
				<Route path="/admin/mascotas" element={<AdminPets />} />
			</Route>

			{/* Rutas compartidas: cualquier usuario autenticado */}
			<Route element={<AuthRoute />}>
				<Route path="/perfil" element={<Profile />} />
			</Route>
		</Routes>
	);
}
