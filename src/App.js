import { useState, useEffect } from "react";
import './App.css';

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
    if (a.priority === b.priority) return 0;
    return a.priority ? -1 : 1;
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
          placeholder="Add new quest..."
        />
        <button onClick={addQuest} style={{ marginLeft: "12px" }}>ADD</button>
      </div>
      <hr />
      <ul>
        {sortedQuests.map((quest) => (
          <li
            key={quest.id}
            className={quest.completed ? "faded" : ""}
            style={{ backgroundColor: quest.priority ? "#276727" : "transparent", padding: "10px", marginBottom: "16px" }}
          >
            <div className="flex justify-between items-center mb-1">
              {quest.editing ? (
  <input
    type="text"
    value={quest.editText || ""}
    onChange={(e) => updateQuest(quest.id, { editText: e.target.value })}
    onBlur={() => updateQuest(quest.id, { title: quest.editText, editing: false, editText: "" })}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        updateQuest(quest.id, { title: quest.editText, editing: false, editText: "" });
      }
    }}
    autoFocus
    style={{ fontSize: "20px", fontWeight: "bold", flexGrow: 1, marginRight: "12px" }}
  />
) : (
  <span
    onClick={() => handleClick(quest)}
    style={{ fontSize: "20px", fontWeight: "bold", flexGrow: 1, marginRight: "12px", cursor: "pointer" }}
  >
    {quest.title}
  </span>
)
              <button onClick={() => updateQuest(quest.id, { priority: !quest.priority })} style={{ marginLeft: "12px" }}>★</button>
            </div>

            {quest.expanded && (
              <div className="ml-4 text-sm">
                <div style={{ marginBottom: "8px" }}>
                    <button onClick={() => updateQuest(quest.id, { editing: true, editText: quest.title })}>EDIT</button>
                    <button onClick={() => deleteQuest(quest.id)}>DEL</button>
                  </div>

                  <ul>
                    {quest.subtasks.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => toggleSubtask(quest.id, i)}
                      className={`cursor-pointer ${s.done ? "faded" : ""}`}
                    >
                      - {s.text}
                    </li>
                  ))}
                  <li>
                    <input
                      type="text"
                      placeholder="Add subtask"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          addSubtask(quest.id, e.target.value.trim());
                          e.target.value = "";
                        }
                      }}
                    />
                  </li>
                </ul>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => updateQuest(quest.id, { editing: true, editText: quest.title })}>EDIT</button>
                  <button onClick={() => deleteQuest(quest.id)}>DEL</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}