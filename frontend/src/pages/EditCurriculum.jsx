import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./CurriculumBuilder.scss";
import { MdArrowBackIos } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { getCurriculumById, updateCurriculum } from "../api";
import { toast } from "react-toastify";

const EditCurriculum = () => {
  const [curriculumTitle, setCurriculumTitle] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { id } = useParams(); // assuming route like /edit-curriculum/:id

  /** Fetch Curriculum Data **/
  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        const data = await getCurriculumById(id);
        if (!data) throw new Error("Curriculum not found");

        setCurriculumTitle(data.title || "");
        setColumns(data.columns || []);
        setRows(data.rows || []);
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        toast.error("❌ Failed to load curriculum.");
        navigate("/curr-activity");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [id, navigate]);

  /** Add new topic (row) **/
  const addTopic = () => {
    const newRow = {};
    columns.forEach((col) => (newRow[col] = ""));
    setRows([...rows, newRow]);
  };

  /** Add new column (heading) **/
  const addHeading = () => {
    const heading = prompt("Enter new heading name:");
    if (heading && !columns.includes(heading)) {
      setColumns([...columns, heading]);
      setRows(rows.map((r) => ({ ...r, [heading]: "" })));
    }
  };

  /** Remove a column **/
  const removeHeading = (col) => {
    if (window.confirm(`Remove heading "${col}"?`)) {
      setColumns(columns.filter((c) => c !== col));
      setRows(
        rows.map((r) => {
          const copy = { ...r };
          delete copy[col];
          return copy;
        })
      );
    }
  };

  /** Remove a topic (row) **/
  const removeTopic = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  /** Update cell value **/
  const updateCell = (rowIdx, col, val) => {
    const newRows = [...rows];
    newRows[rowIdx][col] = val;
    setRows(newRows);
  };

  /** Auto-resize textareas **/
  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  /** Drag and drop reordering **/
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newRows = Array.from(rows);
    const [moved] = newRows.splice(result.source.index, 1);
    newRows.splice(result.destination.index, 0, moved);
    setRows(newRows);
  };

  /** Save updated curriculum **/
  const saveEdits = async () => {
    if (!curriculumTitle.trim()) {
      toast.warning("Please enter a curriculum title before saving.");
      return;
    }

    try {
      const payload = {
        title: curriculumTitle,
        columns,
        rows,
      };

      const data = await updateCurriculum(id, payload);

      toast.success("✅ Curriculum updated successfully!");
      console.log("Updated Curriculum:", data);
    } catch (error) {
      console.error("Error updating curriculum:", error);
      toast.error("❌ Failed to update curriculum.");
    }
  };

  if (loading) return <div className="loading">Loading curriculum...</div>;

  return (
    <div className="curriculum-page">
      <div className="flex flex-row justify-between">
        <p
          className="flex flex-row items-center font-bold cursor-pointer"
          onClick={() => navigate("/curr-activity")}
        >
          <MdArrowBackIos /> Back
        </p>
        <h1 className="title">Edit Curriculum</h1>
      </div>

      <div className="toolbar">
        <input
          type="text"
          value={curriculumTitle}
          onChange={(e) => setCurriculumTitle(e.target.value)}
          style={{ maxWidth: "400px" }}
          placeholder="Enter Curriculum Title..."
          className="title-input"
          disabled={isPreview}
        />

        <button onClick={addTopic} disabled={isPreview} className="btn-primary">
          + Add Topic
        </button>

        <button onClick={addHeading} disabled={isPreview} className="btn-secondary">
          + Add Heading
        </button>

        <button onClick={saveEdits} disabled={isPreview} className="btn-save">
          💾 Save Changes
        </button>

        <button onClick={() => setIsPreview(!isPreview)} className="btn-toggle">
          {isPreview ? "Edit Mode" : "Preview Mode"}
        </button>
      </div>

      <div className="table-container">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="curriculumRows">
            {(provided) => (
              <table className="tableData" ref={provided.innerRef} {...provided.droppableProps}>
                <thead>
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx}>
                        {col}
                        {!isPreview && (
                          <button
                            onClick={() => removeHeading(col)}
                            className="remove-col absolute top-0 right-0"
                          >
                            ×
                          </button>
                        )}
                      </th>
                    ))}
                    {!isPreview && <th>Action</th>}
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="empty-msg">
                        No topics yet. Click “+ Add Topic”.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, rIdx) => (
                      <Draggable key={rIdx} draggableId={`row-${rIdx}`} index={rIdx}>
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {columns.map((col, cIdx) => (
                              <td key={cIdx}>
                                {isPreview ? (
                                  <div className="cell-content">{row[col]}</div>
                                ) : (
                                  <textarea
                                    value={row[col]}
                                    onChange={(e) => {
                                      updateCell(rIdx, col, e.target.value);
                                      autoResize(e);
                                    }}
                                  />
                                )}
                              </td>
                            ))}
                            {!isPreview && (
                              <td>
                                <button
                                  onClick={() => removeTopic(rIdx)}
                                  className="btn-delete"
                                >
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default EditCurriculum;
