import React, { useEffect, useState } from "react";
import { createSheet, updateSheet, deleteSheet, getAllSheets } from "../api";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const AddSheet = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [sheets, setSheets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [updateMode, setUpdateMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
  });

  const [editId, setEditId] = useState(null);

  // 📌 Fetch sheets on load
  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await getAllSheets();
      setSheets(res);
    } catch (err) {
      console.log(err);
    }
  };

  // 📌 Open Create Modal
  const openCreateModal = () => {
    setFormData({ name: "", description: "", url: "" });
    setUpdateMode(false);
    setShowModal(true);
  };

  // 📌 Open Update Modal
  const openUpdateModal = (sheet) => {
    setFormData({
      name: sheet.name,
      description: sheet.description,
      url: sheet.url,
    });
    setEditId(sheet._id);
    setUpdateMode(true);
    setShowModal(true);
  };

  // 📌 Create new sheet
  const handleCreateSheet = async () => {
    try {
      await createSheet({ ...formData, createdBy: userId });
      setShowModal(false);
      fetchSheets();
      toast.success("Sheet created successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Error creating sheet.");
    }
  };

  // 📌 Update sheet
  const handleUpdateSheet = async () => {
    try {
      await updateSheet(editId, formData);
      setShowModal(false);
      fetchSheets();
      toast.success("Sheet updated successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Error updating sheet.");
    }
  };

  // 📌 Delete sheet
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sheet?")) return;

    try {
      await deleteSheet(id);
      fetchSheets();
      toast.success("Sheet deleted");
    } catch (err) {
      console.log(err);
      toast.error("Error deleting sheet.");
    }
  };

  // ⭐ Card component
  const SheetCard = ({ sheet }) => (
    <div className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition relative">
      {/* Image Preview */}
      <a href={sheet.url} target="_blank" rel="noreferrer">
        <img
        // 
         src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(sheet.url).hostname}`}
          alt="falicon"
          className="rounded-md w-full h-40 object-cover border mb-3"
        />
      </a>

      {/* Name */}
      <h2 className="text-xl font-semibold">{sheet.name}</h2>

      {/* Description */}
      <p className="text-gray-600 text-sm">{sheet.description}</p>

      {/* Created By */}
      {sheet.createdBy && (
        <p className="text-gray-400 text-sm mt-2">
          <b>Created By:</b> {sheet.createdBy.firstName} {sheet.createdBy.lastName}
        </p>
      )}

      {/* Buttons */}
      <div className="absolute top-3 right-3 flex gap-3">
        <FaEdit
          className="text-blue-600 cursor-pointer"
          size={18}
          onClick={() => openUpdateModal(sheet)}
        />
        <FaTrash
          className="text-red-600 cursor-pointer"
          size={18}
          onClick={() => handleDelete(sheet._id)}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl bg-white rounded-md mx-auto p-5">
      {/* Header */}
      <div className="flex   justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📄 Sheet Manager</h1>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
        >
          <FaPlus /> Add Sheet
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sheets.length > 0 ? (
          sheets.map((s) => <SheetCard key={s._id} sheet={s} />)
        ) : (
          <p className="text-gray-500">No sheets found.</p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {updateMode ? "Update Sheet" : "Create New Sheet"}
            </h2>

            {/* Inputs */}
            <input
              type="text"
              placeholder="Name"
              className="w-full border px-3 py-2 rounded mb-3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <textarea
              placeholder="Description"
              className="w-full border px-3 py-2 rounded mb-3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <input
              type="text"
              placeholder="Sheet URL"
              className="w-full border px-3 py-2 rounded mb-3"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={updateMode ? handleUpdateSheet : handleCreateSheet}
              >
                {updateMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSheet;
