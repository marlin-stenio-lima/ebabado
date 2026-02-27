import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import PDV from "./pages/PDV";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DashboardProducts from "./pages/DashboardProducts";
import DashboardMenu from "./pages/DashboardMenu";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardSales from "./pages/DashboardSales";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/pdv" element={<PDV />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<DashboardProducts />} />
        <Route path="sales" element={<DashboardSales />} />
        <Route path="menu" element={<DashboardMenu />} />
        <Route path="settings" element={<DashboardSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
