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
import ListBookings from "./pages/admin/ListBookings";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";
import ListMovies from "./pages/admin/ListMovies";
import EditMovie from "./pages/admin/EditMovie";
import AdminMovieDetail from "./pages/admin/AdminMovieDetail";
import CreateMovie from "./pages/admin/CreateMovie";
import ListGenres from "./pages/admin/ListGenres";
import CreateGenre from "./pages/admin/CreateGenre";
import EditGenre from "./pages/admin/EditGenre";
import GenreDetail from "./pages/admin/GenreDetail";
import ListSeatTypes from "./pages/admin/ListSeatTypes";
import CreateSeatType from "./pages/admin/CreateSeatType";
import EditSeatType from "./pages/admin/EditSeatType";
import SeatTypeDetail from "./pages/admin/SeatTypeDetail";
import ListRooms from "./pages/admin/ListRooms";
import CreateRoom from "./pages/admin/CreateRoom";
import RoomDetail from "./pages/admin/RoomDetail";
import EditRoom from "./pages/admin/EditRoom";
const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();
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
        <Route
          path="/admin/*"
          element={
            user ? (
              <Layout />
            ) : (
              <div className="min-h-screen flex justify-center items-center">
                <SignIn fallbackRedirectUrl={"/admin"} />
              </div>
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<ListMovies />} />
          <Route path="movies/create" element={<CreateMovie />} />
          <Route path="movies/:id" element={<AdminMovieDetail />} />
          <Route path="movies/:id/edit" element={<EditMovie />} />
          <Route path="create-movies" element={<CreateMovie />} />
          <Route path="create-shows" element={<CreateShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
          <Route path="genres" element={<ListGenres />} />
          <Route path="genres/create" element={<CreateGenre />} />
          <Route path="genres/:id" element={<GenreDetail />} />
          <Route path="genres/:id/edit" element={<EditGenre />} />
          <Route path="seat-types" element={<ListSeatTypes />} />
          <Route path="seat-types/create" element={<CreateSeatType />} />
          <Route path="seat-types/:id" element={<SeatTypeDetail />} />
          <Route path="seat-types/:id/edit" element={<EditSeatType />} />
          <Route path="rooms" element={<ListRooms />} />
          <Route path="rooms/create" element={<CreateRoom />} />
          <Route path="rooms/:id" element={<RoomDetail />} />
          <Route path="rooms/:id/edit" element={<EditRoom />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
