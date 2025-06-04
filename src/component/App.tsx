import { Routes, Route } from "react-router-dom";
import Layout from "./Layout.tsx";
import Dashboard from "./Dashboard.tsx";
import Transactions from "./Transactions.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
      </Route>
    </Routes>
  );
}
