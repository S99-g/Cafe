import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Hello {user?.username}! You can manage categories and products here (hook up your forms to the existing APIs).
      </p>
      <ul className="mt-4 list-disc list-inside text-gray-700">
        <li>Create / Edit / Delete Category</li>
        <li>Create / Edit / Delete Product</li>
      </ul>
    </div>
  );
}
