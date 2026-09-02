import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import RequireRole from "./components/auth/RequireRole.jsx";
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
import Users from "./pages/Users.jsx";
import NotFound from "./pages/NotFound.jsx";

// Daftar role yang ada di organisasi.
const ALL_ROLES = ["ketua", "wakil-ketua", "sekretaris", "bendahara", "anggota"];

/**
 * Peta akses menu & route berdasarkan user.role (RBAC).
 *
 * Ketua      : semua menu
 * Wakil Ketua: semua menu
 * Sekretaris : semua menu KECUALI anggaran & prediksi anggaran
 * Bendahara  : semua menu KECUALI kelola akun user
 * Anggota    : dashboard, berita, event, galeri, profil & informasi saja
 */
export const roleCan = {
  // Dashboard — semua role
  "/": ALL_ROLES,
  // Kelola Pengurus — semua kecuali anggota
  "/pengurus": ["ketua", "wakil-ketua", "sekretaris", "bendahara"],
  // Konten — semua role
  "/berita": ALL_ROLES,
  "/event": ALL_ROLES,
  "/galeri": ALL_ROLES,
  // Anggaran — ketua, wakil, bendahara (sekretaris & anggota tidak bisa)
  "/anggaran": ["ketua", "wakil-ketua", "bendahara"],
  // Prediksi Anggaran — ketua, wakil, bendahara (sekretaris & anggota tidak bisa)
  "/prediksi-anggaran": ["ketua", "wakil-ketua", "bendahara"],
  "/prediksi-anggaran/parameter": ["ketua", "wakil-ketua", "bendahara"],
  // Kelola Akun User — ketua, wakil, sekretaris (bendahara & anggota tidak bisa)
  "/akun": ["ketua", "wakil-ketua", "sekretaris"],
  // Profil & Informasi — semua role
  "/profil": ALL_ROLES,
};

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
						element={
							<RequireRole roles={roleCan["/"]}>
								<Dashboard />
							</RequireRole>
						}
					/>
					<Route
						path="/pengurus"
						element={
							<RequireRole roles={roleCan["/pengurus"]}>
								<Pengurus />
							</RequireRole>
						}
					/>
					<Route
						path="/berita"
						element={
							<RequireRole roles={roleCan["/berita"]}>
								<Berita />
							</RequireRole>
						}
					/>
					<Route
						path="/event"
						element={
							<RequireRole roles={roleCan["/event"]}>
								<Event />
							</RequireRole>
						}
					/>
					<Route
						path="/galeri"
						element={
							<RequireRole roles={roleCan["/galeri"]}>
								<Galeri />
							</RequireRole>
						}
					/>
					<Route
						path="/anggaran"
						element={
							<RequireRole roles={roleCan["/anggaran"]}>
								<Anggaran />
							</RequireRole>
						}
					/>
					<Route
						path="/prediksi-anggaran"
						element={
							<RequireRole roles={roleCan["/prediksi-anggaran"]}>
								<PrediksiEvent />
							</RequireRole>
						}
					/>
					<Route
						path="/prediksi-anggaran/parameter"
						element={
							<RequireRole roles={roleCan["/prediksi-anggaran/parameter"]}>
								<ParameterEkonomi />
							</RequireRole>
						}
					/>
					<Route
						path="/akun"
						element={
							<RequireRole roles={roleCan["/akun"]}>
								<Users />
							</RequireRole>
						}
					/>
					<Route
						path="/profil"
						element={
							<RequireRole roles={roleCan["/profil"]}>
								<Profil />
							</RequireRole>
						}
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
