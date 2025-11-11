import  { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./CurriculumBuilder.scss";
import { MdArrowBackIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {createCurriculum } from '../api'
import { toast } from "react-toastify";

const CreateCurriculum = () => {
  const [curriculumTitle, setCurriculumTitle] = useState("");
  const [columns, setColumns] = useState([
    "TOPICS", "BASIC PACKAGE", "NO. OF CLASSES", "ACTIVITIES", "TESTS",
    "ACTIVITY BOOK", "EXTRA ACTIVITIES", "TEST SERIES", "RECORDING SESSION", "RECORDING ACTIVITY","PTM"
  ]); 
  // Retrieve user from localStorage
const user = JSON.parse(localStorage.getItem("user"));

  const [rows, setRows] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
const navigate=useNavigate();
  const addTopic = () => {
    const newRow = {};
    columns.forEach(col => (newRow[col] = ""));
    setRows([...rows, newRow]);
  };
const saveCurriculum = async () => {
  if (!curriculumTitle.trim()) {
    toast.warning("Please enter a curriculum title before saving.");
    return;
  }

  try {
    const payload = {
      title: curriculumTitle,
      columns,
      rows,
      createdBy: user.id, 
    };

    const data = await createCurriculum(payload);
  
    toast.success(" Curriculum saved successfully!");
    console.log("Saved Curriculum:", data);
  } catch (error) {
 console.log("Error saving curriculum:", error);
    toast.error("❌ Failed to save curriculum. Please try again")
    
  }
};

  const addHeading = () => {
    const heading = prompt("Enter new heading name:");
    if (heading && !columns.includes(heading)) {
      setColumns([...columns, heading]);
      setRows(rows.map(r => ({ ...r, [heading]: "" })));
    }
  };

  const removeHeading = (col) => {
    if (window.confirm(`Remove heading "${col}"?`)) {
      setColumns(columns.filter(c => c !== col));
      setRows(rows.map(r => {
        const copy = { ...r };
        delete copy[col];
        return copy;
      }));
    }
  };

  const removeTopic = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const updateCell = (rowIdx, col, val) => {
    const newRows = [...rows];
    newRows[rowIdx][col] = val;
    setRows(newRows);
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newRows = Array.from(rows);
    const [moved] = newRows.splice(result.source.index, 1);
    newRows.splice(result.destination.index, 0, moved);
    setRows(newRows);
  };

  return (
    <div className="curriculum-page">
        <div className="flex flex-row justify-between">
            <p className="flex flex-row items-center font-bold cursor-pointer" onClick={()=>navigate("/curr-activity")}><MdArrowBackIos/>back</p>
      <h1 className="title">Curriculum Builder</h1>

        </div>

      <div className="toolbar">
        <input
          type="text"
          value={curriculumTitle}
          onChange={(e) => setCurriculumTitle(e.target.value)}
          style={{maxWidth:'400px'}}
          placeholder="Enter Curriculum Title..."
          className="title-input"
          disabled={isPreview}
          required
        />

        <button onClick={addTopic} disabled={isPreview} className="btn-primary">
          + Create New Topic
        </button>

        <button onClick={addHeading} disabled={isPreview} className="btn-secondary">
          + Create New Heading
        </button>
        <button onClick={saveCurriculum} disabled={isPreview} className="btn-save">
    💾 Save Curriculum
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
                          <button onClick={() => removeHeading(col)} className="remove-col absolute top-0 right-0">
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
                        No topics yet. Click “+ Create New Topic”.
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

export default CreateCurriculum;
