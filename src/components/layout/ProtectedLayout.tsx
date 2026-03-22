import { Navigate, Outlet } from "react-router-dom";
import Header from "./Header"; // Adjust import path based on your structure

const ProtectedLayout = () => {
  // Check if the user is authenticated 
  // (e.g., by checking if the accessToken exists from your axios interceptor logic)
  const token = localStorage.getItem("accessToken");

  // If no token, kick them back to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, render the Header and the child routes (<Outlet />)
  return (
    <>
      <Header />
      {/* Add top padding so the fixed header doesn't cover the page content */}
      <main style={{ paddingTop: "90px", minHeight: "100vh", backgroundColor: "#121212" }}>
        <Outlet /> 
      </main>
    </>
  );
};

export default ProtectedLayout;