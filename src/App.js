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

  let lastClickTime = 0;

  const handleClick = (quest) => {
    const now = Date.now();
    if (now - lastClickTime < 300) {
      updateQuest(quest.id, { completed: !quest.completed });
    } else {
      updateQuest(quest.id, { expanded: !quest.expanded });
    }
    lastClickTime = now;
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
        <button onClick={addQuest} className="ml-2">ADD</button>
      </div>
      <hr />
      <ul>
        {sortedQuests.map((quest) => (
          <li
            key={quest.id}
            className={"mb-4 p-2 " + (quest.priority ? "priority " : "") + (quest.completed ? "faded" : "")}
          >
            <div className="flex justify-between items-center mb-1">
              {quest.editing ? (
                <input
                  value={quest.title}
                  onChange={(e) => updateQuest(quest.id, { title: e.target.value })}
                  onBlur={() => updateQuest(quest.id, { editing: false })}
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => handleClick(quest)}
                  className="cursor-pointer"
                >
                  {quest.title}
                </span>
              )}
              <div className="flex gap-1 ml-2">
                <button onClick={() => updateQuest(quest.id, { editing: !quest.editing })}>EDIT</button>
                <button onClick={() => updateQuest(quest.id, { priority: !quest.priority })}>★</button>
                <button onClick={() => deleteQuest(quest.id)}>DEL</button>
              </div>
            </div>

            {quest.expanded && (
              <ul className="ml-4 text-sm">
                {quest.subtasks.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => toggleSubtask(quest.id, i)}
                    className={"cursor-pointer " + (s.done ? "faded" : "")}
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
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}