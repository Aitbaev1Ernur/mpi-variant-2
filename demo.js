const roles = {admin:"Әкімші",teacher:"Оқытушы",student:"Студент"};
const credentials = "demo123";
const key = "mpi-demo-v1";
const modules = [
  {
    "id": 1,
    "tasks": [
      {
        "id": "3",
        "title": "Санды екі еселеу"
      },
      {
        "id": "5",
        "title": "Қосынды және орташа мән"
      }
    ]
  },
  {
    "id": 2,
    "tasks": [
      {
        "id": "9",
        "title": "Әр бағыныңқы процестен төрт сан алу"
      },
      {
        "id": "13",
        "title": "Бір-бір саннан тарату және қалдықты беру"
      },
      {
        "id": "15",
        "title": "Белгісіз жіберушіден қабылдау"
      },
      {
        "id": "20",
        "title": "Сақинадағы екі көршімен алмасу"
      },
      {
        "id": "21",
        "title": "Рангтерді алмастыру арқылы жіберу"
      },
      {
        "id": "25",
        "title": "Сандарды кері ретпен орналастыру"
      },
      {
        "id": "26",
        "title": "Тегтегі реттік нөмір"
      },
      {
        "id": "28",
        "title": "Тегтегі сан түрі"
      }
    ]
  },
  {
    "id": 3,
    "tasks": [
      {
        "id": "49",
        "title": "Бағандар бойынша минимум"
      },
      {
        "id": "51",
        "title": "Бағандар бойынша көбейтінді"
      },
      {
        "id": "54",
        "title": "Максимумдарды есептеу және тарату"
      },
      {
        "id": "57",
        "title": "Рангке дейінгі максимумдар"
      },
      {
        "id": "58",
        "title": "Бүтін үштіктерді тарату"
      },
      {
        "id": "63",
        "title": "Нақты сан мен екі бүтін санды жіберу"
      },
      {
        "id": "65",
        "title": "Үштіктер жиынын жіберу"
      },
      {
        "id": "66",
        "title": "Екі тізімді буып-түю және тарату"
      },
      {
        "id": "70",
        "title": "Әр рангтен бір пакет қабылдау"
      }
    ]
  },
  {
    "id": 4,
    "tasks": [
      {
        "id": "32",
        "title": "Әр процестен бір сан жинау"
      },
      {
        "id": "33",
        "title": "Бес бүтін саннан жинау"
      },
      {
        "id": "39",
        "title": "Қабаттасатын үштіктерді тарату"
      },
      {
        "id": "41",
        "title": "Төрттіктерді барлық процеске жинау"
      },
      {
        "id": "44",
        "title": "Үш сандық блоктармен алмасу"
      },
      {
        "id": "46",
        "title": "Көршілес жұптармен алмасу"
      },
      {
        "id": "72",
        "title": "Тақ рангтер арасында алмасу"
      },
      {
        "id": "74",
        "title": "Жұп рангтердегі минимумдар"
      },
      {
        "id": "77",
        "title": "Таңдалған бірінші процеске жинау"
      },
      {
        "id": "79",
        "title": "Таңдалған барлық процеске жинау"
      },
      {
        "id": "81",
        "title": "Таңдалған процестерде қосындыны табу"
      }
    ]
  },
  {
    "id": 5,
    "tasks": [
      {
        "id": "83",
        "title": "Екі өлшемді тордағы координаталар"
      },
      {
        "id": "86",
        "title": "Бағандар бойынша тарату"
      },
      {
        "id": "89",
        "title": "Әр жолда сандарды жинау"
      },
      {
        "id": "94",
        "title": "Периодты координаталар бойынша ранг табу"
      },
      {
        "id": "97",
        "title": "Матрицаларды циклдік ығыстыру"
      },
      {
        "id": "100",
        "title": "Жұлдыз графында алмасу"
      }
    ]
  }
];
const catalog = new Map(modules.flatMap(module => module.tasks.map(task => [task.id, {...task, module:module.id}])));
const fresh = () => ({role:null, studentActive:true, studentName:"", selected:"3", submissions:{}});
let state = fresh();
try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved) {
        state = {...state,...saved};
        if (!saved.submissions && saved.work) {
            state.submissions["3"] = {code:saved.work,score:saved.score ?? null,note:saved.comment || ""};
        }
        delete state.work;
        delete state.score;
        delete state.comment;
    }
} catch {}

const login = document.getElementById("demo-login");
const cabinet = document.getElementById("demo-cabinet");
const panel = document.getElementById("demo-panel");
const status = document.getElementById("demo-status");
const loginForm = document.getElementById("demo-login-form");
const escape = text => String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
const taskName = id => "MPIBegin" + id + " · " + catalog.get(id).title;
const taskLink = id => "module-" + catalog.get(id).module + ".html#task-" + id;
function save() {
    try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {}
}

function renderAdmin() {
    panel.innerHTML = '<h3>Демо есептік жазбалар</h3><ul><li>admin — әкімші</li><li>teacher — оқытушы</li><li>student — студент · '+
        (state.studentActive ? 'белсенді' : 'бұғатталған')+'</li></ul><div class="actions"><button type="button" id="toggle-student">'+
        (state.studentActive ? 'Студентті бұғаттау' : 'Студентті қайта қосу')+'</button></div>';
    document.getElementById("toggle-student").addEventListener("click", () => {
        state.studentActive = !state.studentActive;
        save(); render();
        status.textContent = state.studentActive ? "Студент қайта қосылды." : "Студент бұғатталды.";
    });
}

function renderTeacher() {
    const entries = Object.entries(state.submissions).filter(([id]) => catalog.has(id));
    panel.innerHTML = '<h3>Студент жіберген кодтар</h3>' +
        (entries.length ? entries.map(([id,entry]) => '<section class="theory"><h3>'+escape(taskName(id))+'</h3><p>Студент: <strong>'+escape(entry.studentName || 'Аты-жөні көрсетілмеген')+'</strong></p><p><a href="'+taskLink(id)+'">Тапсырма шарты</a></p><pre tabindex="0"><code>'+escape(entry.code)+'</code></pre>'+
            '<form data-grade="'+id+'" class="runner"><label>Балл (0–100)<input name="score" type="number" min="0" max="100" step="1" required value="'+escape(entry.score ?? '')+'"></label>'+
            '<label>Пікір (міндетті емес)<textarea name="note" maxlength="1000" rows="3">'+escape(entry.note)+'</textarea></label><div class="actions"><button type="submit">Бағаны сақтау</button></div></form></section>').join("") :
            '<p>Әзірге код жіберілген жоқ.</p>');
    panel.querySelectorAll("[data-grade]").forEach(form => form.addEventListener("submit", event => {
        event.preventDefault();
        const id = form.dataset.grade;
        const data = new FormData(form);
        const raw = data.get("score");
        if (state.role !== "teacher" || !/^\d{1,3}$/.test(raw) || Number(raw) > 100 || !state.submissions[id]) return;
        state.submissions[id].score = Number(raw);
        state.submissions[id].note = String(data.get("note") || "").slice(0,1000);
        save();
        status.textContent = "MPIBegin"+id+" тапсырмасының бағасы сақталды.";
    }));
}

function renderStudent() {
    if (!state.studentName) {
        panel.innerHTML = '<h3>Студенттің аты-жөні</h3><form id="demo-name-form" class="runner"><label>Аты-жөні<input id="demo-name" name="fullName" maxlength="100" placeholder="Мысалы, Аян Нұрланов" required></label><div class="actions"><button type="submit">Жалғастыру</button></div></form>';
        const nameForm = document.getElementById("demo-name-form");
        nameForm.addEventListener("submit", event => {
            event.preventDefault();
            const name = String(new FormData(nameForm).get("fullName") || "").trim().replace(/\s+/g," ");
            if (state.role !== "student") return;
            if (name.length > 100 || name.split(" ").filter(part => /\p{L}/u.test(part)).length < 2) {
                status.textContent = "Атыңыз бен тегіңізді жазыңыз."; return;
            }
            state.studentName = name;
            save(); status.textContent = ""; render();
        });
        document.getElementById("demo-name").focus();
        return;
    }
    panel.innerHTML = '<p>Студент: <strong>'+escape(state.studentName)+'</strong></p><h3>Код жіберу</h3><label>Тапсырманы таңдаңыз <select id="demo-task">'+modules.map(module =>
        '<optgroup label="'+module.id+'-модуль">'+module.tasks.map(task => '<option value="'+task.id+'">'+escape(taskName(task.id))+'</option>').join("")+'</optgroup>').join("")+
        '</select></label><div id="demo-editor"></div><h3>Мен жіберген жұмыстар</h3><div id="demo-submissions"></div>';
    const select = document.getElementById("demo-task");
    const drafts = new Map();
    select.value = catalog.has(state.selected) ? state.selected : "3";
    function showEditor() {
        const id = select.value;
        const entry = state.submissions[id];
        const editor = document.getElementById("demo-editor");
        editor.innerHTML = '<p><a href="'+taskLink(id)+'">Тапсырма шартын ашу</a></p>'+
            (entry?.score != null ? '<p>Бұл жұмыс бағаланды.</p>' :
             '<form id="demo-submit" class="runner"><label>C коды<textarea name="code" id="demo-code" maxlength="30000" rows="9" required spellcheck="false">'+escape(drafts.get(id) ?? entry?.code ?? "")+'</textarea></label><div class="actions"><button type="submit">Кодты жіберу</button></div></form>');
        document.getElementById("demo-code")?.addEventListener("input", event => drafts.set(id,event.currentTarget.value));
        document.getElementById("demo-submit")?.addEventListener("submit", event => {
            event.preventDefault();
            const code = String(new FormData(event.currentTarget).get("code") || "");
            if (state.role !== "student" || !state.studentName || state.submissions[id]?.score != null) return;
            if (!code.trim() || code.length > 30000) { status.textContent = "Кодты жазыңыз (ең көбі 30 000 таңба)."; return; }
            state.submissions[id] = {code,studentName:state.studentName,score:null,note:""};
            state.selected = id;
            drafts.delete(id);
            save(); showEditor(); showSubmissions();
            status.textContent = "MPIBegin"+id+" тапсырмасының коды оқытушыға жіберілді.";
        });
    }
    function showSubmissions() {
        const entries = Object.entries(state.submissions).filter(([id]) => catalog.has(id));
        document.getElementById("demo-submissions").innerHTML = entries.length ? entries.map(([id,entry]) =>
            '<details class="task"><summary>'+escape(taskName(id))+'</summary><div class="task-body"><p>'+
            (entry.score == null ? 'Баға қойылған жоқ.' : '<strong>'+escape(entry.score)+' / 100</strong>')+
            '</p>'+(entry.note ? '<p>'+escape(entry.note)+'</p>' : '')+'<pre tabindex="0"><code>'+escape(entry.code)+'</code></pre></div></details>').join("") : '<p>Әзірге жұмыс жіберілген жоқ.</p>';
    }
    select.addEventListener("change", () => { state.selected = select.value; save(); showEditor(); });
    showEditor(); showSubmissions();
}

function render() {
    const role = state.role;
    login.hidden = Boolean(role);
    cabinet.hidden = !role;
    if (!role) { panel.replaceChildren(); return; }
    document.getElementById("demo-role").textContent = roles[role] + " · " + role;
    if (role === "admin") renderAdmin();
    else if (role === "teacher") renderTeacher();
    else renderStudent();
}
function signIn(name,password) {
    if (!Object.hasOwn(roles,name) || password !== credentials) { status.textContent = "Логин немесе құпиясөз қате."; return; }
    if (name === "student" && !state.studentActive) { status.textContent = "Студент демо есептік жазбасы бұғатталған."; return; }
    state.role = name; save(); loginForm.reset(); status.textContent = ""; render();
}
document.querySelectorAll("[data-demo]").forEach(button => button.addEventListener("click", () => signIn(button.dataset.demo,credentials)));
loginForm.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    signIn(String(data.get("login")).trim().toLowerCase(),data.get("password"));
});
document.getElementById("demo-logout").addEventListener("click", () => {
    state.role = null; save(); render(); status.textContent = "Демо кабинеттен шықтыңыз.";
});
if (!Object.hasOwn(roles,state.role) || (state.role==="student" && !state.studentActive)) state.role=null;
render();
