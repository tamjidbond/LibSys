import { useEffect, useState } from "react";
import { Search, Edit, Trash, Plus } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 11;
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({ name: "", email: "", username: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.username) {
      toast.error('Please fill all fields!');
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, role: "User", status: "Active" }),
      });

      const savedUser = await res.json();
      setUsers([...users, { _id: savedUser.insertedId, ...newUser, role: "User", status: "Active" }]);
      setNewUser({ name: "", email: "", username: "" });

      toast.success("User added successfully!");
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error("Failed to add user.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user._id?.toString().includes(searchTerm) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const saveUserChanges = async (updatedUser) => {
    try {
      await fetch(`http://localhost:5000/api/users/${updatedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      setUsers(users.map(user => user._id === updatedUser._id ? updatedUser : user));
      setEditingUser(null);
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = (userId) => {
    setConfirmDelete(userId);
  };

  const confirmDeleteUser = async () => {
    try {
      await fetch(`http://localhost:5000/api/users/${confirmDelete}`, {
        method: "DELETE",
      });

      setUsers(users.filter(user => user._id !== confirmDelete));
      setConfirmDelete(null);
      toast.error("User deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 min-h-screen bg-gradient-to-br from-sky-600 to-blue-600 flex flex-col items-center text-white py-24">
        <div className="mb-6 text-center">
          <h2 className="ms:text-4xl font-extrabold drop-shadow-lg text-lg sm:text-3xl md:text-4xl">User Management</h2>
          <p className="text-lg opacity-80">Manage your users efficiently with this dashboard!</p>
        </div>

        <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-7xl flex flex-col sm:flex-row items-center gap-6">
          <h3 className="text-xl font-semibold mb-4 sm:mb-0 text-center">Add New User</h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input type="text" placeholder="Name" name="name" value={newUser.name} onChange={handleInputChange} className="border p-2 rounded-lg w-full sm:w-1/3 bg-white/40 text-gray-900 placeholder-gray-700" />
            <input type="email" placeholder="Email" name="email" value={newUser.email} onChange={handleInputChange} className="border p-2 rounded-lg w-full sm:w-1/3 bg-white/40 text-gray-900 placeholder-gray-700" />
            <input type="text" placeholder="Username" name="username" value={newUser.username} onChange={handleInputChange} className="border p-2 rounded-lg w-full sm:w-1/3 bg-white/40 text-gray-900 placeholder-gray-700" />
            <button onClick={handleAddUser} className="bg-gradient-to-r from-blue-700 to-sky-700 text-white px-4 flex items-center py-2 rounded-lg mt-4 sm:mt-0 sm:ml-4">
              <Plus /> Add
            </button>
          </div>

          <input type="text" placeholder="Search by name, email, username" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border p-2 rounded-lg w-full md:w-[300px] bg-white/40 text-gray-900 placeholder-gray-700" />
        </div>

        <div className="bg-white/20 backdrop-blur-md p-6 mt-6 rounded-2xl shadow-lg w-full max-w-7xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/30 text-left">
                  {["ID", "Name", "Email", "Username", "Role", "Status", "Actions"].map((header, index) => (
                    <th key={index} className="p-3">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-300 hover:bg-gray-800 transition">
                    <td className="p-3">{user._id}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.status}</td>
                    <td className="p-3 flex space-x-3">
                      <button className="text-blue-300 hover:text-blue-500 transition" onClick={() => handleEdit(user)}><Edit className="w-5 h-5" /></button>
                      <button className="text-red-300 hover:text-red-500 transition" onClick={() => handleDelete(user._id)}><Trash className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-around items-center  ">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className={`px-4 py-2 rounded-lg transition ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105"}`}>Previous</button>
          <span className="text-white p-2 text-lg">{`Page ${currentPage}`}</span>
          <button disabled={currentUsers.length < usersPerPage} onClick={() => setCurrentPage(currentPage + 1)} className={`px-4 py-2 rounded-lg transition ${currentUsers.length < usersPerPage ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105"}`}>Next</button>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-gradient-to-br from-sky-600 to-blue-600 flex justify-center items-center">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Edit User</h3>
              <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="border p-2 mb-4 rounded-lg w-full" />
              <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="border p-2 mb-4 rounded-lg w-full" />
              <input type="text" value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} className="border p-2 mb-4 rounded-lg w-full" />
              <div className="flex justify-end gap-4">
                <button onClick={() => saveUserChanges(editingUser)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save</button>
                <button onClick={() => setEditingUser(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-gradient-to-br from-sky-600 to-blue-600 flex justify-center items-center">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
              <p>Are you sure you want to delete this user?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={confirmDeleteUser} className="bg-red-500 text-white px-4 py-2 rounded-lg">Yes, Delete</button>
                <button onClick={() => setConfirmDelete(null)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default UserManagement;