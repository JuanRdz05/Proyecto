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

export function App() {
	return (
		<Routes>
			{/* Rutas de invitado: solo accesibles sin sesión activa */}
			<Route path="/" element={<GuestRoute><Guest /></GuestRoute>} />
			<Route path="/inicio-sesion" element={<GuestRoute><Login /></GuestRoute>} />
			<Route path="/registro" element={<GuestRoute><Register /></GuestRoute>} />

			{/* Rutas exclusivas de cliente */}
			<Route path="/cliente" element={<ClientRoute><ClientHome /></ClientRoute>} />
			<Route path="/agendar-cita" element={<ClientRoute><Appointment /></ClientRoute>} />
			<Route path="/mascotas" element={<ClientRoute><Pets /></ClientRoute>} />
			<Route path="/nueva-mascota" element={<ClientRoute><PetAdd /></ClientRoute>} />
			<Route path="/detalles-mascota/:id" element={<ClientRoute><PetDetails /></ClientRoute>} />
			<Route path="/historial" element={<ClientRoute><History /></ClientRoute>} />

			{/* Rutas compartidas: cualquier usuario autenticado */}
			<Route path="/perfil" element={<AuthRoute><Profile /></AuthRoute>} />

			{/* Rutas exclusivas de veterinario */}
			<Route path="/veterinario" element={<VetRoute><VetHome /></VetRoute>} />
			<Route path="/atender-cita/:id" element={<VetRoute><AtenderCita /></VetRoute>} />
			<Route path="/vet-historial" element={<VetRoute><VetHistory /></VetRoute>} />
		</Routes>
	);
}
