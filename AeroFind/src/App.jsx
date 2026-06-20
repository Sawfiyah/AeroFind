import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import BookingPage from "./pages/BookingPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import MyTripsPage from "./pages/MyTripsPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatBot from "./components/ui/ChatBot";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/seats" element={<SeatSelectionPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>
      <ChatBot />
    </>
  );
}
