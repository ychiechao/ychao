const SETTINGS_KEY = "ai2_coach_settings";
const TASKS_KEY = "ai2_coach_tasks";

const el = (id) => document.getElementById(id);
const chatBox = el("chatBox");
let conversation = [];
let pastedImages = [];

function renderPastedList() {
  const ul = el("pastedList");
  ul.innerHTML = "";
  pastedImages.forEach((img, i) => {
    const li = document.createElement("li");
    li.textContent = `${img.name} (${Math.round(img.file.size / 1024)} KB)`;
    ul.appendChild(li);
  });
}

function setupPasteZone() {
  const zone = el("pasteZone");
  zone.addEventListener("paste", (event) => {
    const items = [...(event.clipboardData?.items || [])];
    const imageItems = items.filter((it) => it.type.startsWith("image/"));
    if (!imageItems.length) return;

    imageItems.forEach((it, idx) => {
      const file = it.getAsFile();
      if (!file) return;
      pastedImages.push({
        name: `pasted_${Date.now()}_${idx}.png`,
        file,
      });
    });
    renderPastedList();
    addMessage("assistant", "已收到貼上的截圖，請繼續描述問題。");
    event.preventDefault();
  });
}


function addMessage(role, text) {
  conversation.push({ role, text });
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<strong>${role === "assistant" ? "教練" : "學生"}</strong>${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  el("apiBase").value = saved.apiBase || "https://openrouter.ai/api/v1";
  el("model").value = saved.model || "meta-llama/llama-3.1-8b-instruct:free";
  el("apiKey").value = saved.apiKey || "";
}

function saveSettings() {
  const data = {
    apiBase: el("apiBase").value.trim(),
    model: el("model").value.trim(),
    apiKey: el("apiKey").value.trim(),
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  el("settingsStatus").textContent = "✅ 設定已儲存";
  return data;
}

function getTasks() {
  return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
}

function saveTask(task) {
  const tasks = getTasks();
  tasks.unshift(task);
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const tasks = getTasks();
  const ul = el("taskList");
  ul.innerHTML = "";
  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(t.createdAt).toLocaleString()}｜${t.name}｜${t.status}`;
    ul.appendChild(li);
  });
}

async function callCoach(userText) {
  const { apiBase, model, apiKey } = saveSettings();
  if (!apiBase || !model || !apiKey) {
    addMessage("assistant", "請先完成 API 設定。\n");
    return;
  }

  const systemPrompt = `你是國中 App Inventor 教練。規則：
1) 不直接告訴答案或錯誤位置。
2) 每次先肯定，再提出 1~3 個引導問題。
3) 問題要可操作，例如：先觀察元件屬性、事件觸發、變數值。
4) 最後給一個「下一步小任務」。`;

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...conversation.map((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: userText },
    ],
    temperature: 0.6,
  };

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "我暫時沒有產生回覆，請再試一次。";
    addMessage("assistant", text);
  } catch (err) {
    addMessage("assistant", `連線失敗：${err.message}`);
  }
}

el("saveSettings").addEventListener("click", saveSettings);
el("testApi").addEventListener("click", async () => {
  addMessage("assistant", "正在測試連線...");
  await callCoach("請用一句話自我介紹你是怎樣的教練。");
});

el("startCoach").addEventListener("click", async () => {
  const taskName = el("taskName").value.trim();
  const desc = el("problemDescription").value.trim();
  const uploadedFiles = [...el("attachments").files].map((f) => f.name);
  const pastedFiles = pastedImages.map((p) => p.name);
  const files = [...uploadedFiles, ...pastedFiles];

  if (!taskName || !desc) {
    alert("請填寫任務名稱與問題描述");
    return;
  }

  saveTask({
    name: taskName,
    status: "進行中",
    createdAt: Date.now(),
    files,
    desc,
  });

  addMessage("student", `任務：${taskName}\n問題：${desc}\n附件：${files.join(", ") || "無"}`);
  await callCoach(`任務：${taskName}\n問題：${desc}\n附件：${files.join(", ") || "無"}`);

  pastedImages = [];
  renderPastedList();
});

el("sendReply").addEventListener("click", async () => {
  const reply = el("studentReply").value.trim();
  if (!reply) return;
  addMessage("student", reply);
  el("studentReply").value = "";
  await callCoach(reply);
});

loadSettings();
renderTasks();
setupPasteZone();
