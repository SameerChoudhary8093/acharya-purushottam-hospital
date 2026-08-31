import Home from "./pages/Home";
import Services from "./pages/Services";
import Doctors from "./pages/Doctors";
import Facilities from "./pages/Facilities";
import Layout from "./components/Layout";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/facilities" element={<Facilities />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
