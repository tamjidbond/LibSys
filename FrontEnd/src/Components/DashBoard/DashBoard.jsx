import { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { User, Book, RefreshCw } from "lucide-react";
import Navbar from "../Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { Fade } from "react-awesome-reveal";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    userCount: 0,
    bookCount: 0,
    borrowedBooks: 0,
    returnedBooks: 0,
  });
  const [overdue, setOverdue] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");

    const fetchData = async () => {
      try {
        const statsRes = await axios.get(
          "http://localhost:5000/dashboard/stats"
        );
        const overdueRes = await axios.get(
          "http://localhost:5000/dashboard/overdue"
        );
        const adminsRes = await axios.get(
          "http://localhost:5000/dashboard/admins"
        );

        setStats(statsRes.data);
        setOverdue(overdueRes.data);
        setAdmins(adminsRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchData();
  }, [navigate]);

  const pieData = {
    labels: ["Total Borrowed Books", "Total Returned Books"],
    datasets: [
      {
        data: [stats.borrowedBooks, stats.returnedBooks],
        backgroundColor: ["#4C51BF", "#00B5D8"],
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const statistics = [
    { icon: User, count: stats.userCount, text: "Total User Base" },
    { icon: Book, count: stats.bookCount, text: "Total Book Count" },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const filteredOverdue = overdue.filter((borrower) =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAdminStatus = async (adminId) => {
    try {
      await axios.post(
        `http://localhost:5000/dashboard/admins/${adminId}/toggle`
      );
      // Update the admins state after toggling
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === adminId
            ? {
                ...admin,
                status: admin.status === "Active" ? "Inactive" : "Active",
              }
            : admin
        )
      );
    } catch (err) {
      console.error("Error toggling admin status:", err);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-sky-700 to-blue-700"
      }`}
    >
      <Navbar />
      <div className="p-6 py-24 container mx-auto">
        <button
          onClick={toggleDarkMode}
          className="bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300 ease-in-out transform hover:scale-105 mb-4 flex items-center space-x-2"
        >
          {darkMode ? (
            <span className="material-icons">dark_mode</span>
          ) : (
            <span className="material-icons">light_mode</span>
          )}
          <span>Toggle Dark Mode</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg transform transition-all hover:scale-105 duration-300">
            <Fade>
              <Pie data={pieData} options={pieOptions} />
            </Fade>
            <div className="flex justify-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-600 rounded-full mr-2"></div>
                <span className="text-white">Total Borrowed Books</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-cyan-500 rounded-full mr-2"></div>
                <span className=" text-white">Total Returned Books</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col space-y-4 text-white">
            {statistics.map((stat, index) => (
              <div
                key={index}
                className="flex items-center bg-white/10 p-4 rounded-lg shadow-lg transform transition-all hover:scale-105 duration-300"
              >
                <stat.icon className="w-8 h-8 text-yellow-300 mr-4" />
                <div>
                  <p className="text-xl font-bold">{stat.count}</p>
                  <p className="text-gray-300">{stat.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Borrowers & Admins */}
          <div className="flex flex-col space-y-4">
            {/* Overdue Borrowers */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all hover:scale-105 duration-300">
              <h3 className="font-bold text-lg text-gray-100 mb-2">
                Overdue Borrowers
              </h3>
              <input
                type="text"
                placeholder="Search Borrowers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 rounded-md mb-4"
              />
              {filteredOverdue.map((borrower, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-200 p-2 rounded-md mb-2"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {borrower.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Borrowed ID: {borrower._id}
                    </p>
                  </div>
                  <RefreshCw className="w-5 h-5 text-gray-700 cursor-pointer" />
                </div>
              ))}
            </div>

            {/* Admins */}
            <div className="mt-6 bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-lg transform transition-all hover:scale-105 duration-300">
              <h3 className="font-bold text-lg text-gray-100 mb-2">
                BookWorm Admins
              </h3>
              {admins.map((admin, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-200 p-2 rounded-md mb-2"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-600">
                      Admin ID: {admin._id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`${
                        admin.status === "Active"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {admin.status}
                    </span>
                    <button
                      onClick={() => toggleAdminStatus(admin._id)}
                      className="text-gray-700 cursor-pointer"
                    >
                      Toggle Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
