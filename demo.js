const roles = {admin:"Әкімші",teacher:"Оқытушы",student:"Студент"};
const credentials = "demo123";
const key = "mpi-demo-v1";
const fresh = () => ({role:null, studentActive:true, work:"", score:null, comment:""});
let state = fresh();
try { const saved = JSON.parse(sessionStorage.getItem(key)); if (saved) state = {...state,...saved}; } catch {}

const login = document.getElementById("demo-login");
const cabinet = document.getElementById("demo-cabinet");
const panel = document.getElementById("demo-panel");
const status = document.getElementById("demo-status");
const loginForm = document.getElementById("demo-login-form");
const escape = text => String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
function save() {
    try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {}
}
function render() {
    const role = state.role;
    login.hidden = Boolean(role);
    cabinet.hidden = !role;
    if (!role) { panel.replaceChildren(); return; }
    document.getElementById("demo-role").textContent = roles[role] + " · " + role;
    if (role === "admin") {
        panel.innerHTML = '<h3>Демо есептік жазбалар</h3><ul><li>admin — әкімші</li><li>teacher — оқытушы</li><li>student — студент · '+
            (state.studentActive ? 'белсенді' : 'бұғатталған')+'</li></ul><div class="actions"><button type="button" id="toggle-student">'+
            (state.studentActive ? 'Студентті бұғаттау' : 'Студентті қайта қосу')+'</button></div>';
        document.getElementById("toggle-student").addEventListener("click", () => {
            state.studentActive = !state.studentActive;
            save(); render();
            status.textContent = state.studentActive ? "Студент қайта қосылды." : "Студент бұғатталды.";
        });
    } else if (role === "teacher") {
        panel.innerHTML = '<h3>Студенттің тапсырмасы · MPIBegin3</h3>'+
            (state.work ? '<pre>'+escape(state.work)+'</pre><form id="demo-grade" class="runner"><label>Балл (0–100)<input name="score" type="number" min="0" max="100" step="1" required value="'+(state.score ?? '')+'"></label><label>Пікір<textarea name="comment" maxlength="1000" rows="3">'+escape(state.comment)+'</textarea></label><div class="actions"><button type="submit">Бағаны сақтау</button></div></form>' : '<p>Тапсырылған жұмыс әзірге жоқ. Алдымен студент ретінде үлгі жұмысын тапсырып көріңіз.</p>');
        document.getElementById("demo-grade")?.addEventListener("submit", event => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const score = Number(data.get("score"));
            if (!Number.isInteger(score) || score < 0 || score > 100) return;
            state.score = score;
            state.comment = String(data.get("comment")).slice(0,1000);
            save(); render(); status.textContent = "Үлгі баға сақталды.";
        });
    } else {
        panel.innerHTML = '<h3>Менің тапсырмам · MPIBegin3</h3><p><a href="module-1.html#task-3">Тапсырманы ашу</a></p>'+
            (state.score !== null ? '<p>Баға: <strong>'+state.score+' / 100</strong></p><p>'+escape(state.comment)+'</p><pre>'+escape(state.work)+'</pre>' :
             '<form id="demo-submit" class="runner"><label>Үлгі шешім<textarea name="work" maxlength="3000" rows="4" required>'+escape(state.work)+'</textarea></label><div class="actions"><button type="submit">Тапсыру</button></div></form>');
        document.getElementById("demo-submit")?.addEventListener("submit", event => {
            event.preventDefault();
            const work = String(new FormData(event.currentTarget).get("work")).trim().slice(0,3000);
            if (!work) { status.textContent = "Үлгі шешімді жазыңыз."; return; }
            state.work = work; save(); render(); status.textContent = "Үлгі жұмыс тапсырылды.";
        });
    }
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

