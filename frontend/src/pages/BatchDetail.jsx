import React, { useState, useEffect } from "react";
import {
  getBatches,
  createBatch,
  updateBatch,
  getCurriculumsById,
  getCurriculums,
  getTutors,
  deleteBatch,
} from "../api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import useUserAuthStore from "../stores/userAuthStore";

// ================= Progress Circle ===================
const ProgressCircle = ({ percentage }) => {
  const radius = 40;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#3b82f6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: "stroke-dashoffset 0.35s" }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="14"
        fill="#111827"
        fontWeight="bold"
      >
        {percentage}%
      </text>
    </svg>
  );
};

const BatchDetail = () => {
  const [batches, setBatches] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const user =localStorage.getItem('user')
  const { id: projectId } = useParams();

  const [batchForm, setBatchForm] = useState({
    name: "",
    curriculum: "",
    tutor: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchBatches();
    fetchCurriculums();
    fetchTutors();
  }, []);

  const fetchCurriculumById = async (curriculumId) => {
    try {
      const data = await getCurriculumsById(curriculumId);
      return data;
    } catch (err) {
      console.error("Error fetching curriculum:", err);
      toast.error("Failed to fetch curriculum");
      return null;
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getBatches();
      const filtered = data.filter((b) => b.project === projectId);

      const batchesWithCurriculum = await Promise.all(
        filtered.map(async (batch) => {
          if (batch.curriculum?._id) {
            const curriculum = await fetchCurriculumById(batch.curriculum._id);
            return { ...batch, curriculum };
          }
          return batch;
        })
      );

      setBatches(batchesWithCurriculum);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    }
  };

  const fetchCurriculums = async () => {
    try {
      const data = await getCurriculums();
      setCurriculums(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTutors = async () => {
    try {
      const data = await getTutors();
      setTutors(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= Helpers ===================
  const isRowFullyChecked = (batchTypeData, rowIndex) => {
    const totalCols = batchTypeData.curriculumRows?.[0]
      ? Object.keys(batchTypeData.curriculumRows[0]).length - 1
      : 0;
    const done = batchTypeData.activitiesDone?.filter((a) =>
      a.startsWith(`${rowIndex}-`)
    );
    return done?.length === totalCols;
  };

  // ================= Optimistic Update Handlers ===================

  const handleCellToggle = (batch, type, rowIndex, colIndex) => {
    const key = `${rowIndex}-${colIndex}`;
    let updatedActivities =
      batch.activitiesDoneByType?.[type]
        ? [...batch.activitiesDoneByType[type]]
        : [];

    if (updatedActivities.includes(key)) {
      updatedActivities = updatedActivities.filter((k) => k !== key);
    } else {
      updatedActivities.push(key);
    }

    const totalRows = batch.curriculum.rows.filter(
      (row) => row["BASIC PACKAGE"] === type
    ).length;
    const totalCols =
      Object.keys(
        batch.curriculum.rows.find((r) => r["BASIC PACKAGE"] === type)
      ).length - 1;

    const progress = Math.round(
      (updatedActivities.length / (totalRows * totalCols)) * 100
    );

    // 🔹 Optimistic UI update
    setBatches((prev) =>
      prev.map((b) =>
        b._id === batch._id
          ? {
              ...b,
              activitiesDoneByType: {
                ...b.activitiesDoneByType,
                [type]: updatedActivities,
              },
              progressByType: {
                ...b.progressByType,
                [type]: progress,
              },
            }
          : b
      )
    );

    // 🔹 Background update (no delay)
    updateBatch(batch._id, {
      [`activitiesDoneByType.${type}`]: updatedActivities,
      [`progressByType.${type}`]: progress,
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to update batch progress");
      fetchBatches(); // fallback refresh if error
    });
  };

  const handleRowToggle = (batch, type, rowIndex) => {
    const totalCols = Object.keys(
      batch.curriculum.rows.find((r) => r["BASIC PACKAGE"] === type)
    ).length - 1;

    let updatedActivities =
      batch.activitiesDoneByType?.[type]
        ? [...batch.activitiesDoneByType[type]]
        : [];

    const rowKeys = Array.from({ length: totalCols }, (_, i) => `${rowIndex}-${i}`);
    const isChecked = rowKeys.every((k) => updatedActivities.includes(k));

    if (isChecked) {
      updatedActivities = updatedActivities.filter((k) => !rowKeys.includes(k));
    } else {
      updatedActivities = Array.from(new Set([...updatedActivities, ...rowKeys]));
    }

    const totalRows = batch.curriculum.rows.filter(
      (r) => r["BASIC PACKAGE"] === type
    ).length;
    const progress = Math.round(
      (updatedActivities.length / (totalRows * totalCols)) * 100
    );

    // 🔹 Optimistic UI update
    setBatches((prev) =>
      prev.map((b) =>
        b._id === batch._id
          ? {
              ...b,
              activitiesDoneByType: {
                ...b.activitiesDoneByType,
                [type]: updatedActivities,
              },
              progressByType: {
                ...b.progressByType,
                [type]: progress,
              },
            }
          : b
      )
    );

    updateBatch(batch._id, {
      [`activitiesDoneByType.${type}`]: updatedActivities,
      [`progressByType.${type}`]: progress,
    }).catch((err) => {
      console.error(err);
      toast.error("Failed to update batch progress");
      fetchBatches();
    });
  };

  const handleCompleteSubBatch = async (batch, currentType) => {
    const order = ["Basic", "Plus", "Pro"];
    const currentIndex = order.indexOf(currentType);
    const nextType = order[currentIndex + 1];

    if (!nextType) {
      toast.success(`${currentType} Package Completed! All packages are done 🎉`);
      return;
    }

    const updatedUnlocked = Array.from(new Set([...(batch.unlockedPackages || []), nextType]));

    await updateBatch(batch._id, { unlockedPackages: updatedUnlocked });
    toast.success(`${currentType} Package Completed! ${nextType} Package Unlocked ✅`);
    fetchBatches();
  };

  // ================= Create / Delete ===================

const handleBatchSubmit = async () => {
  if (!batchForm.name || !batchForm.curriculum || !batchForm.tutor) {
    return toast.error("Please fill all fields");
  }

  if (isEditMode && selectedBatch) {
    // Update batch
    const updatedBatchData = {
      ...batchForm,
    };

    await updateBatch(selectedBatch._id, updatedBatchData);
    toast.success("✅ Batch updated!");
  } else {
    // Create batch
    const batchData = {
      ...batchForm,
      project: projectId,
      activitiesDoneByType: { Basic: [], Plus: [], Pro: [] },
      progressByType: { Basic: 0, Plus: 0, Pro: 0 },
      unlockedPackages: ["Basic"],
    };

    await createBatch(batchData);
    toast.success("✅ New Batch Created!");
  }

  setIsBatchModalOpen(false);
  setBatchForm({ name: "", curriculum: "", tutor: "", startDate: "", endDate: "" });
  setIsEditMode(false);
  fetchBatches();
};


  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      await deleteBatch(batchId);
      toast.success("Batch deleted successfully");
      fetchBatches();
    }
  };

  // ================= Render ===================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Batch Progress Tracker</h1>
        <button
          onClick={() => setIsBatchModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <FaPlus /> Create Batch
        </button>
      </div>

      {/* Batch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div
            key={batch._id}
              onClick={() => setSelectedBatch(batch)}
            className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl transition duration-300 relative"
          >
            <div className="absolute top-3 right-3 flex gap-2">
             <button
  onClick={() => {
    setSelectedBatch(batch);
    setBatchForm({
      name: batch.name,
      curriculum: batch.curriculum?._id || "",
      tutor: batch.tutor?._id || "",
      startDate: batch.startDate?.split("T")[0] || "",
      endDate: batch.endDate?.split("T")[0] || "",
    });
    setIsBatchModalOpen(true);
    setIsEditMode(true);
  }}
  className="text-blue-600 hover:text-blue-800"
>
  <FaEdit />
</button>

              <button
                onClick={() => handleDeleteBatch(batch._id)}
                className="text-red-600 hover:text-red-800"
              >
                <FaTrash />
              </button>
            </div>

            <h3 className="font-bold text-xl text-gray-700">{batch.name}</h3>
            <div className="flex justify-around mt-3">
              {["Basic", "Plus", "Pro"].map((type) => {
                if (!batch.unlockedPackages?.includes(type)) return null;

                const progress = batch.progressByType?.[type] || 0;
                return (
                  <div key={type} className="text-center">
                    <h4 className="font-semibold">{type}</h4>
                    <ProgressCircle percentage={progress} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Batch Details */}
      {selectedBatch && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{selectedBatch.name}</h2>
            <button
              onClick={() => setSelectedBatch(null)}
              className="px-3 py-1 text-gray-500 border rounded hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          {["Basic", "Plus", "Pro"].map((type) => {
            if (!selectedBatch.unlockedPackages?.includes(type)) return null;

            const subRows =
              selectedBatch.curriculum?.rows?.filter(
                (r) => r["BASIC PACKAGE"] === type
              ) || [];

            return (
              <div key={type} className="mt-6">
                <h3 className="text-xl font-semibold mb-2">{type} Package</h3>

                {subRows.length === 0 ? (
                  <p>No curriculum data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="border border-gray-200 bg-white rounded-lg shadow-sm w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          {selectedBatch.curriculum.columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-2 text-left border-b">
                              {col}
                            </th>
                          ))}
                          <th className="px-4 py-2 text-center border-b">Row Done</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {selectedBatch.curriculum.columns.map((col, colIndex) => (
                              <td key={colIndex} className="px-4 py-2 border-b">
                                <div className="flex items-center gap-2">
                                  <span>{row[col]}</span>
                                  {col !== "BASIC PACKAGE" && (
                                    <input
                                      type="checkbox"
                                      checked={
                                        selectedBatch.activitiesDoneByType?.[type]?.includes(
                                          `${rowIndex}-${colIndex}`
                                        ) || false
                                      }
                                      onChange={() =>
                                        handleCellToggle(selectedBatch, type, rowIndex, colIndex)
                                      }
                                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                                    />
                                  )}
                                </div>
                              </td>
                            ))}

                            {/* ✅ Hide tick if row has no actual data */}
                            <td className="px-4 py-2 text-center border-b">
                              {Object.values(row).some(
                                (val, idx) =>
                                  val &&
                                  selectedBatch.curriculum.columns[idx] !== "BASIC PACKAGE"
                              ) && (
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 accent-green-600 cursor-pointer"
                                  checked={isRowFullyChecked(
                                    {
                                      curriculumRows: subRows,
                                      activitiesDone:
                                        selectedBatch.activitiesDoneByType?.[type],
                                    },
                                    rowIndex
                                  )}
                                  onChange={() =>
                                    handleRowToggle(selectedBatch, type, rowIndex)
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(user.userType === "admin" || user.userType === "teamLeader") && (
                  <>
                    {selectedBatch.progressByType?.[type] === 100 && type !== "Pro" && (
                      <button
                        onClick={() => handleCompleteSubBatch(selectedBatch, type)}
                        className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Proceed to Next Package
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Create Batch Modal =================== */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
  {isEditMode ? "Edit Batch Details" : "Create New Batch"}
</h2>

            <input
              type="text"
              placeholder="Batch Name"
              className="w-full border px-3 py-2 rounded mb-2"
              value={batchForm.name}
              onChange={(e) =>
                setBatchForm({ ...batchForm, name: e.target.value })
              }
            />

            <select
              className="w-full border px-3 py-2 rounded mb-2"
              value={batchForm.curriculum}
              onChange={(e) =>
                setBatchForm({ ...batchForm, curriculum: e.target.value })
              }
            >
              <option value="">Select Curriculum</option>
              {curriculums.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              className="w-full border px-3 py-2 rounded mb-2"
              value={batchForm.tutor}
              onChange={(e) =>
                setBatchForm({ ...batchForm, tutor: e.target.value })
              }
            >
              <option value="">Select Tutor</option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full border px-3 py-2 rounded mb-2"
              value={batchForm.startDate}
              onChange={(e) =>
                setBatchForm({ ...batchForm, startDate: e.target.value })
              }
            />
            <input
              type="date"
              className="w-full border px-3 py-2 rounded mb-2"
              value={batchForm.endDate}
              onChange={(e) =>
                setBatchForm({ ...batchForm, endDate: e.target.value })
              }
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="border px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
  onClick={handleBatchSubmit}
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
  {isEditMode ? "Update" : "Create"}
</button>
            </div>
          </div>
        </div>
      )}
   
    </div>
  );
};

export default BatchDetail;
