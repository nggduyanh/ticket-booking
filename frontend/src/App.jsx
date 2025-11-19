import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import Movies from "./pages/Movies";
import SeatLayout from "./pages/SeatLayout";
import MovieDetail from "./pages/MovieDetail";
import Footer from "./components/Footer";
import NavBar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import CreateShows from "./pages/admin/CreateShows";
import ListShows from "./pages/admin/ListShows";
import ListBooknigs from "./pages/admin/ListBookings";
import ListBookings from "./pages/admin/ListBookings";
import CreateMoives from "./pages/admin/CreateMoives";
const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  return (
    <>
      <Toaster />
      {!isAdminRoute && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/admin/*" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create-movies" element={<CreateMoives />} />
          <Route path="create-shows" element={<CreateShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
