import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Guest/Log_In/login.jsx";
import { Guest } from "./pages/Guest/Main_Page/guest.jsx";
import { Register } from "./pages/Guest/Register/register.jsx";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<Guest />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
		</Routes>
	);
}
