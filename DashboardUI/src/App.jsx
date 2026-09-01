import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Pengurus from "./pages/Pengurus.jsx";
import Berita from "./pages/Berita.jsx";
import Event from "./pages/Event.jsx";
import Galeri from "./pages/Galeri.jsx";
import Anggaran from "./pages/Anggaran.jsx";
import Profil from "./pages/Profil.jsx";
import PrediksiEvent from "./pages/PrediksiEvent.jsx";
import ParameterEkonomi from "./pages/ParameterEkonomi.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
	return (
		<Routes>
			{/* Login — full page, di luar AdminLayout */}
			<Route
				path="/login"
				element={<Login />}
			/>

			{/* Halaman dashboard — dilindungi RequireAuth */}
			<Route element={<RequireAuth />}>
				<Route element={<AdminLayout />}>
					<Route
						path="/"
						element={<Dashboard />}
					/>
					<Route
						path="/pengurus"
						element={<Pengurus />}
					/>
					<Route
						path="/berita"
						element={<Berita />}
					/>
					<Route
						path="/event"
						element={<Event />}
					/>
					<Route
						path="/galeri"
						element={<Galeri />}
					/>
					<Route
						path="/anggaran"
						element={<Anggaran />}
					/>
					<Route
						path="/prediksi-anggaran"
						element={<PrediksiEvent />}
					/>
					<Route
						path="/prediksi-anggaran/parameter"
						element={<ParameterEkonomi />}
					/>
					<Route
						path="/profil"
						element={<Profil />}
					/>
				</Route>
			</Route>

			{/* 404 & fallback — di luar auth */}
			<Route
				path="/404"
				element={<NotFound />}
			/>
			<Route
				path="*"
				element={
					<Navigate
						to="/404"
						replace
					/>
				}
			/>
		</Routes>
	);
}
