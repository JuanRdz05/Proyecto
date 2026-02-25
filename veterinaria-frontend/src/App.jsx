import { Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login/login.jsx";
import { Guest } from "./pages/Guest/guest.jsx";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<Guest />} />
			<Route path="/login" element={<Login />} />
		</Routes>
	);
}
