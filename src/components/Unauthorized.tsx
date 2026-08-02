import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">

        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6" />

        <h1 className="text-3xl font-bold text-white mb-4">
          Access Denied
        </h1>

        <p className="text-slate-400 mb-8">
          You do not have permission to access this page.
        </p>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          Go Back
        </button>

      </div>
    </div>
  );
}