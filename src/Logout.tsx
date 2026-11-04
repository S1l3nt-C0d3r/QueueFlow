import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("staff");
    localStorage.removeItem("staffNumber");
    localStorage.removeItem("staffRole");
    localStorage.removeItem("selectedRestaurantId");

    // Go back to login
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 rounded-xl
                 bg-red-500/10 border border-red-500/20
                 text-red-400 hover:bg-red-500/20
                 transition-all"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
}
