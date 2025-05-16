
import { useState, useEffect } from "react";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export default function App() {
  const [quests, setQuests] = useState(() => loadFromStorage("quests", []));
  const [newQuest, setNewQuest] = useState("");
  const [clickTimestamps, setClickTimestamps] = useState({});

  useEffect(() => {
    saveToStorage("quests", quests);
  }, [quests]);

  const addQuest = () => {
    if (!newQuest.trim()) return;
    setQuests([
      ...quests,
      {
        title: newQuest,
        completed: false,
        expanded: false,
        subtasks: [],
        editing: false,
        priority: false,
        showSubtaskInput: false,
        editText: "",
        id: Date.now(),
      },
    ]);
    setNewQuest("");
  };

  const updateQuest = (id, changes) => {
    setQuests(quests.map(q => q.id === id ? { ...q, ...changes } : q));
  };

  const deleteQuest = (id) => setQuests(quests.filter(q => q.id !== id));

  const addSubtask = (id, text) => {
    setQuests(quests.map(q => q.id === id
      ? { ...q, subtasks: [...q.subtasks, { text, done: false }] }
      : q
    ));
  };

  const toggleSubtask = (qid, idx) => {
    setQuests(quests.map(q => q.id === qid
      ? {
          ...q,
          subtasks: q.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s)
        }
      : q
    ));
  };

  const sortedQuests = [...quests].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) return a.priority ? -1 : 1;
    return 0;
  });

  const handleClick = (quest) => {
    const now = Date.now();
    const lastClick = clickTimestamps[quest.id] || 0;

    if (now - lastClick < 300) {
      updateQuest(quest.id, { completed: !quest.completed });
    } else {
      updateQuest(quest.id, { expanded: !quest.expanded });
    }

    setClickTimestamps({ ...clickTimestamps, [quest.id]: now });
  };

  return (
    <div>
      <h1 className="text-3xl mb-4 border-b border-green-400 pb-2">
        Pip-Boy Quest Log
      </h1>
      <div className="mb-4">
        <input
          type="text"
          value={newQuest}
          onChange={(e) => setNewQuest(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newQuest.trim()) {
              addQuest();
            }
          }}
          placeholder="Add new quest..."
        />
        <button onClick={addQuest} className="ml-2">ADD</button>
      </div>
      <hr />
      <ul>
        {sortedQuests.map((quest) => (
          <li
            key={quest.id}
            className={quest.completed ? "faded" : ""}
            style={{
              backgroundColor: quest.priority ? "#276727" : "transparent",
              padding: "10px",
              marginBottom: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {quest.editing ? (
                <input
                  type="text"
                  value={quest.editText || ""}
                  onChange={(e) => updateQuest(quest.id, { editText: e.target.value })}
                  onBlur={() =>
                    updateQuest(quest.id, {
                      title: quest.editText,
                      editing: false,
                      editText: "",
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateQuest(quest.id, {
                        title: quest.editText,
                        editing: false,
                        editText: "",
                      });
                    }
                  }}
                  autoFocus
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    flexGrow: 1,
                    marginRight: "12px",
                  }}
                />
              ) : (
                <span
                  onClick={() => handleClick(quest)}
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    flexGrow: 1,
                    marginRight: "12px",
                    cursor: "pointer",
                  }}
                >
                  {quest.title}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuest(quest.id, { priority: !quest.priority });
                }}
                style={{
                  marginLeft: "2px",
                  width: "28px",
                  height: "28px",
                  fontSize: "18px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  backgroundColor: quest.priority ? "#276727" : "transparent",
                  color: quest.priority ? "#cfc" : "#666",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {quest.priority ? "★" : "☆"}
              </button>
            </div>

            {quest.expanded && (
              <div className="ml-4 text-sm">
                <div style={{ marginBottom: "8px" }}>
                  <button onClick={() => updateQuest(quest.id, { editing: !quest.editing })}>EDIT</button>
                  <button onClick={() => deleteQuest(quest.id)}>DEL</button>
                </div>

                <ul>
                  {quest.subtasks.length === 0 && !quest.showSubtaskInput && (
                    <li>
                      <button onClick={() => updateQuest(quest.id, { showSubtaskInput: true })}>+</button>
                    </li>
                  )}

                  {quest.subtasks.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => toggleSubtask(quest.id, i)}
                      className={`cursor-pointer ${s.done ? "faded" : ""}`}
                    >
                      - {s.text}
                    </li>
                  ))}

                  {quest.subtasks.length > 0 && !quest.showSubtaskInput && (
                    <li>
                      <button onClick={() => updateQuest(quest.id, { showSubtaskInput: true })}>+</button>
                    </li>
                  )}

                  {quest.showSubtaskInput && (
                    <li>
                      <input
                        type="text"
                        placeholder="Add subtask"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            const text = e.target.value.trim();
                            e.target.value = "";
                            updateQuest(quest.id, { showSubtaskInput: false });
                            addSubtask(quest.id, text);
                          }
                          if (e.key === "Backspace" && !e.target.value) {
                            updateQuest(quest.id, { showSubtaskInput: false });
                          }
                        }}
                      />
                    </li>
                  )}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
