import { Search, Plus, Edit, Trash, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../Navbar/Navbar";
import { Navigate } from "react-router-dom";
import axios from "axios";

const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookList, setBookList] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [newBookDetails, setNewBookDetails] = useState({
    name: "",
    type: "",
    language: "",
    availability: "Available",
    quantity: 1, // Added quantity field
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) Navigate("/");

    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/books");
        console.log(response.data); // Check if quantity is part of the response
        setBookList(response.data);
      } catch (err) {
        toast.error("Failed to fetch books from the server.");
      }
    };
    fetchBooks();
  }, [Navigate, bookList]);

  const filteredBooks = bookList.filter((book) => {
    const name = book.name?.toLowerCase() || "";
    const type = book.type?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || type.includes(search);
  });

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handleEditClick = (book) => {
    setEditingBook(book);
    setNewBookDetails({ ...book });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/books/${editingBook._id}`,
        newBookDetails
      );

      const updatedBook = response.data;

      setBookList((prevList) =>
        prevList.map((book) =>
          book._id === updatedBook._id ? updatedBook : book
        )
      );

      setEditingBook(null);
      setNewBookDetails({
        name: "",
        type: "",
        language: "",
        availability: "Available",
        quantity: 1, // Reset quantity
      });
      toast.info("Book updated successfully! ✏️");
    } catch (err) {
      toast.error("Failed to update book.");
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/books/${id}`);
      setBookList(bookList.filter((book) => book._id !== id));
      toast.error("Book deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete book.");
    }
  };

  const handleAddNewBook = async () => {
    if (
      !newBookDetails.name ||
      !newBookDetails.type ||
      !newBookDetails.language ||
      newBookDetails.quantity <= 0 // Ensure quantity is valid
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/books",
        newBookDetails
      );
      setBookList([...bookList, response.data]);
      setIsAddModalOpen(false);
      setNewBookDetails({
        name: "",
        type: "",
        language: "",
        availability: "Available",
        quantity: 1, // Reset quantity
      });
      toast.success("Book added successfully! 📚");
    } catch (err) {
      toast.error("Failed to add book.");
    }
  };

  const handleNextPage = () => {
    if (currentPage * booksPerPage < filteredBooks.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 min-h-screen pt-24 bg-gradient-to-br from-sky-600 to-blue-600 text-white">
        {/* Header */}
        <div className="flex flex-wrap container mx-auto justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-100 w-full md:w-auto">
            Book Management
          </h2>
          <div className="flex flex-wrap space-x-4 mt-4 md:mt-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center transition duration-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Book
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name or Type"
                className="border border-gray-300 p-2 rounded-md outline-none pl-10 focus:ring-2 focus:ring-indigo-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-5 h-5 absolute left-3 top-2 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 container mx-auto backdrop-blur-md p-4 rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-left">
                {[
                  "ID",
                  "Name",
                  "Type",
                  "Language",
                  "Availability",
                  "Quantity", // Added Quantity header
                  "Action",
                ].map((header, index) => (
                  <th key={index} className="p-2 text-gray-700">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentBooks.length > 0 ? (
                currentBooks.map((book, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-700 bg-gray-800 transition duration-200"
                  >
                    <td className="p-2">{book._id}</td>
                    <td className="p-2">{book.name}</td>
                    <td className="p-2">{book.type}</td>
                    <td className="p-2">{book.language}</td>
                    <td
                      className={`p-2 font-bold ${
                        book.availability === "Available"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {book.availability}
                    </td>
                    <td className="p-2">{book.quantity}</td>{" "}
                    {/* Display Quantity */}
                    <td className="p-2 flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleEditClick(book)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClick(book._id)}
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <BookOpen className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-gray-100 p-4">
                    No books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-around items-center">
          <button
            disabled={currentPage === 1}
            onClick={handlePrevPage}
            className={`px-4 py-2 rounded-lg transition ${
              currentPage === 1
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105"
            }`}
          >
            Previous
          </button>
          <span className="text-white p-2 text-lg">{`Page ${currentPage}`}</span>
          <button
            disabled={currentBooks.length < booksPerPage}
            onClick={handleNextPage}
            className={`px-4 py-2 rounded-lg transition ${
              currentBooks.length < booksPerPage
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-sky-500 hover:scale-105"
            }`}
          >
            Next
          </button>
        </div>

        {/* Add Book Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-sky-600 to-blue-600">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md w-96 max-w-full">
              <h3 className="text-xl font-semibold mb-4">Add New Book</h3>
              {["name", "type", "language"].map((field) => (
                <div key={field} className="mt-4">
                  <label className="block text-gray-100 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    value={newBookDetails[field]}
                    onChange={(e) =>
                      setNewBookDetails({
                        ...newBookDetails,
                        [field]: e.target.value,
                      })
                    }
                    className="border p-2 rounded-md w-full mt-2 placeholder:text-gray-200"
                  />
                </div>
              ))}
              <div className="mt-4">
                <label className="block text-gray-100">Availability</label>
                <select
                  value={newBookDetails.availability}
                  onChange={(e) =>
                    setNewBookDetails({
                      ...newBookDetails,
                      availability: e.target.value,
                    })
                  }
                  className="border p-2 rounded-md w-full mt-2 hover:bg-gray-800"
                >
                  <option value="Available">Available</option>
                  <option value="Borrowed">Borrowed</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-gray-100">Quantity</label>
                <input
                  type="number"
                  value={newBookDetails.quantity}
                  onChange={(e) =>
                    setNewBookDetails({
                      ...newBookDetails,
                      quantity: Math.max( e.target.value), // Ensure quantity is at least 1
                    })
                  }
                  className="border p-2 rounded-md w-full mt-2 placeholder:text-gray-200"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleAddNewBook}
                  className="bg-indigo-600 hover:bg-indigo-800 text-white px-4 py-2 rounded-md"
                >
                  Add Book
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="ml-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {editingBook && (
          <div className="fixed inset-0 flex justify-center items-center bg-gradient-to-br from-sky-600 to-blue-600">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md w-96 max-w-full">
              <h3 className="text-xl font-semibold mb-4">Edit Book</h3>
              {["name", "type", "language"].map((field) => (
                <div key={field} className="mt-4">
                  <label className="block text-gray-100 capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    value={newBookDetails[field]}
                    onChange={(e) =>
                      setNewBookDetails({
                        ...newBookDetails,
                        [field]: e.target.value,
                      })
                    }
                    className="border p-2 rounded-md w-full mt-2 placeholder:text-gray-200"
                  />
                </div>
              ))}
              <div className="mt-4">
                <label className="block text-gray-100">Availability</label>
                <select
                  value={newBookDetails.availability}
                  onChange={(e) =>
                    setNewBookDetails({
                      ...newBookDetails,
                      availability: e.target.value,
                    })
                  }
                  className="border p-2 rounded-md w-full mt-2 hover:bg-gray-800"
                >
                  <option value="Available">Available</option>
                  <option value="Borrowed">Borrowed</option>
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-gray-100">Quantity</label>
                <input
                  type="number"
                  value={newBookDetails.quantity}
                  onChange={(e) =>
                    setNewBookDetails({
                      ...newBookDetails,
                      quantity: Math.max(0,e.target.value), // Ensure quantity is at least 1
                    })
                  }
                  className="border p-2 rounded-md w-full mt-2 placeholder:text-gray-200"
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingBook(null)}
                  className="ml-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default BookManagement;
