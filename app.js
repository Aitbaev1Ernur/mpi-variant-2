

function runTask(id, input) {
    const rows = input.trim().split(/\r?\n/).map(line => {
        line = line.trim();
        return line && line !== "—" && line !== "-" ? line.split(/\s+/) : [];
    });
    const k = rows.length;
    const output = Array(k).fill(null);
    const ranks = rows.map((_, rank) => rank);
    const workers = ranks.slice(1);
    const positions = Array(k).fill(0);

    function check(ok, message) {
        if (!ok) throw new Error(message);
    }

    function read(rank, integer = false) {
        const token = rows[rank][positions[rank]++];
        const value = Number(token?.replace(",", "."));
        const pattern = integer ? /^[+-]?\d+$/ : /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i;
        check(token && pattern.test(token) && Number.isFinite(value) &&
              (!integer || (value >= -2147483648 && value <= 2147483647)),
              "Ранг " + rank + " · орын " + positions[rank] + ". Мына мәнді енгізіңіз: " +
              (integer ? "бүтін сан." : "сан."));
        return value;
    }

    function vector(rank, count, integer = false) {
        check(count >= 0 && count <= rows[rank].length - positions[rank],
              "Ранг " + rank + ". Бұл жолға тағы " + count + " сан енгізіңіз.");
        return Array.from({length: count}, () => read(rank, integer));
    }

    function perRank(solve) {
        ranks.forEach(rank => { output[rank] = solve(rank); });
    }

    function selected() {
        const active = ranks.filter(rank => {
            const flag = read(rank, true);
            check(flag === 0 || flag === 1, "Ранг " + rank + ". N мәні 0 немесе 1 болуы керек.");
            return flag === 1;
        });
        check(active.length, "Кемінде бір процесте N = 1 болуы керек.");
        return active;
    }

    function reduceColumns(matrix, operation) {
        return matrix[0].map((_, col) => matrix.map(row => row[col]).reduce(operation));
    }

    check(k <= 128, "Ең көбі 128 процесс үшін дерек енгізіңіз.");
    if ([9,13,15,26,58,63,65,70].includes(id)) check(k >= 2, "Кемінде екі процесс қажет.");

    switch (id) {
        case 3:
            perRank(rank => [2 * read(rank, rank % 2 === 0)]);
            break;
        case 5:
            perRank(rank => {
                const n = read(rank, true);
                check(n > 0, "Ранг " + rank + ". N нөлден үлкен болуы керек.");
                const sum = vector(rank, n).reduce((a, b) => a + b, 0);
                return [rank % 2 ? sum / n : sum];
            });
            break;
        case 9:
            output[0] = workers.flatMap(rank => vector(rank, 4, true));
            break;
        case 13: {
            const n = read(0, true);
            check(n >= k - 1 && n < 10, "N саны K − 1 ≤ N < 10 шартын қанағаттандыруы керек.");
            const values = vector(0, n);
            workers.forEach(rank => {
                output[rank] = values.slice(rank - 1, rank === k - 1 ? n : rank);
            });
            break;
        }
        case 15: {
            const senders = [];
            workers.forEach(rank => {
                const n = read(rank, true);
                check(n >= 0, "Ранг " + rank + ". N теріс сан болмауы керек.");
                if (n) senders.push([...vector(rank, n), rank]);
            });
            check(senders.length === 1, "Тек бір бағыныңқы процесте N > 0 болуы керек.");
            output[0] = senders[0];
            break;
        }
        case 20: {
            const values = ranks.map(rank => vector(rank, 2, true));
            perRank(rank => [values[(rank + k - 1) % k][1], values[(rank + 1) % k][0]]);
            break;
        }
        case 21:
        case 26: {
            const first = id === 21 ? 0 : 1;
            const addressed = Array(k).fill(null);
            ranks.slice(first).forEach(rank => {
                const value = read(rank);
                const dest = read(rank, true);
                check(dest >= first && dest < k && addressed[dest] === null,
                      "Ранг " + rank + ". N сандары әртүрлі және мына аралықта болуы керек: " + first + "–" + (k - 1) + ".");
                addressed[dest] = [value, rank];
            });
            if (id === 21) perRank(rank => addressed[rank]);
            else output[0] = addressed.slice(1).map(([value]) => value);
            break;
        }
        case 25: {
            const values = ranks.map(rank => read(rank)).reverse();
            perRank(rank => [values[rank]]);
            break;
        }
        case 28:
            workers.forEach(rank => {
                const flag = read(0, true);
                check(flag === 0 || flag === 1, "Әр (T, A) жұбында T саны 0 немесе 1 болуы керек.");
                output[rank] = [read(0, flag === 0)];
            });
            break;
        case 32:
        case 33:
            output[0] = ranks.flatMap(rank => vector(rank, id === 32 ? 1 : 5, id === 33));
            break;
        case 39: {
            const values = vector(0, k + 2);
            perRank(rank => values.slice(rank, rank + 3));
            break;
        }
        case 41: {
            const values = ranks.flatMap(rank => vector(rank, 4, true));
            perRank(() => values);
            break;
        }
        case 44:
        case 46: {
            const width = id === 44 ? 3 : 2;
            const stride = id === 44 ? 3 : 1;
            const count = id === 44 ? 3 * k : k + 1;
            const values = ranks.map(rank => vector(rank, count, id === 44));
            perRank(rank => values.flatMap(row => row.slice(stride * rank, stride * rank + width)));
            break;
        }
        case 49:
        case 51:
        case 54:
        case 57: {
            const width = id === 54 ? 2 * k : k + 5;
            const matrix = ranks.map(rank => vector(rank, width, id === 57));
            if (id === 57) {
                let prefix = matrix[0];
                perRank(rank => {
                    prefix = prefix.map((value, col) => Math.max(value, matrix[rank][col]));
                    return prefix;
                });
            } else {
                const op = id === 49 ? Math.min : id === 54 ? Math.max : (a,b) => a * b;
                const values = reduceColumns(matrix, (a,b) => op(a,b));
                if (id === 49) output[0] = values;
                else perRank(rank => id === 54 ? values.slice(2 * rank, 2 * rank + 2) : values);
            }
            break;
        }
        case 58:
        case 66: {
            const values = id === 58 ? vector(0, 3 * (k - 1), true)
                : [...vector(0, k, true), ...vector(0, k)];
            workers.forEach(rank => { output[rank] = values; });
            break;
        }
        case 63:
            output[0] = workers.flatMap(rank => [read(rank), ...vector(rank, 2, true)]);
            break;
        case 65:
            output[0] = workers.flatMap(rank => Array.from({length: rank}, () => [
                ...vector(rank, 2, true), read(rank)
            ]).flat());
            break;
        case 70:
            output[0] = workers.flatMap(rank => [read(rank), ...vector(rank, rank, true)]);
            break;
        case 72: {
            const odd = ranks.filter(rank => rank % 2);
            const values = odd.flatMap(rank => vector(rank, 2));
            odd.forEach(rank => { output[rank] = values; });
            break;
        }
        case 74: {
            const even = ranks.filter(rank => rank % 2 === 0);
            output[0] = reduceColumns(even.map(rank => vector(rank, 3)), (a,b) => Math.min(a,b));
            break;
        }
        case 77:
        case 79:
        case 81: {
            const active = selected();
            const values = active.map(rank => read(rank));
            if (id === 77) output[active[0]] = values;
            else active.forEach(rank => {
                output[rank] = id === 79 ? values : [values.reduce((a,b) => a + b, 0)];
            });
            break;
        }
        case 83: {
            const n = read(0, true);
            check(n > 1 && k % n === 0, "N саны 1-ден үлкен болуы және K саны N-ге қалдықсыз бөлінуі керек.");
            const width = k / n;
            perRank(rank => [Math.floor(rank / width), rank % width]);
            break;
        }
        case 86: {
            check(k >= 4 && k % 2 === 0, "Процестер саны жұп болуы және K ≥ 4 шарты орындалуы керек.");
            const values = [read(0), read(1)];
            perRank(rank => [values[rank % 2]]);
            break;
        }
        case 89:
        case 97: {
            check(k === 8 || k === 12, "8 немесе 12 процесс қажет.");
            const width = k / 4;
            const values = ranks.map(rank => read(rank, id === 89));
            if (id === 89) perRank(rank => rank % width ? null : values.slice(rank, rank + width));
            else perRank(rank => {
                const start = rank - rank % width;
                return [values[start + (rank % width + width - 1) % width]];
            });
            break;
        }
        case 94: {
            const [height, width] = vector(0, 2, true);
            check(height > 0 && width > 0 && height * width <= k, "M және N оң болуы және M × N ≤ K шарты орындалуы керек.");
            ranks.slice(0, height * width).forEach(rank => {
                const [x, y] = vector(rank, 2, true);
                output[rank] = [x < 0 || x >= height ? -1 : x * width + ((y % width + width) % width)];
            });
            break;
        }
        case 100: {
            check([7,10,13].includes(k), "Графқа 7, 10 немесе 13 процесс қажет.");
            const values = ranks.map(rank => read(rank, true));
            perRank(rank => {
                if (rank === 0) return values.filter((_, peer) => peer > 0 && peer % 3 === 0);
                const start = rank - (rank - 1) % 3;
                return ranks.filter(peer => (peer === 0 && rank % 3 === 0) ||
                    (peer >= start && peer < start + 3 && peer !== rank)).map(peer => values[peer]);
            });
            break;
        }
        default:
            throw new Error("Тапсырма табылмады.");
    }

    ranks.forEach(rank => {
        check(positions[rank] === rows[rank].length, "Ранг " + rank + ". Артық сандарды өшіріңіз.");
    });
    return output;
}

function formatResult(output) {
    const lines = output.flatMap((values, rank) => {
        if (values === null) return [];
        const formatted = values.map(value => Number.isFinite(value) ? Number(value.toPrecision(12)) : value);
        return [rank + ": " + formatted.join(" ")];
    });
    return lines.length ? lines.join("\n") : "Бұл мысалда ешбір процесс сан шығармайды.";
}

document.querySelectorAll(".runner").forEach(form => {
    const input = form.querySelector("textarea");
    const output = form.querySelector("output");
    const id = Number(form.dataset.task);
    function show() {
        try {
            output.textContent = formatResult(runTask(id, input.value));
            output.classList.remove("error");
        } catch (error) {
            output.textContent = error.message;
            output.classList.add("error");
        }
    }
    form.addEventListener("submit", event => {
        event.preventDefault();
        show();
    });
    form.addEventListener("reset", () => queueMicrotask(show));
    show();
});


let timer;
const feedback = document.querySelector("#feedback");
function report(message) {
    feedback.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => { feedback.textContent = ""; }, 2800);
}
document.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-copy], button[data-download]");
    if (!button) return;
    const id = button.dataset.copy || button.dataset.download;
    const source = document.getElementById("source-" + id);
    if (button.dataset.download) {
        const url = URL.createObjectURL(new Blob([source.textContent], {type: "text/plain;charset=utf-8"}));
        const link = document.createElement("a");
        link.href = url;
        link.download = "MPIBegin" + id + ".c";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
    }
    try {
        await navigator.clipboard.writeText(source.textContent);
        report("Код көшірілді");
    } catch {
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        if (document.execCommand("copy")) {
            selection.removeAllRanges();
            report("Код көшірілді");
        } else {
            report("Код белгіленді. Ctrl+C пернелерін басыңыз.");
        }
    }
});
function revealTask() {
    if (!/^#(?:task|code)-\d+$/.test(location.hash)) return;
    const task = document.getElementById(location.hash.slice(1));
    if (task) {
        task.open = true;
        task.scrollIntoView();
    }
}
window.addEventListener("hashchange", revealTask);
revealTask();
const courseTasks = [
  {
    "id": "3",
    "title": "Санды екі еселеу",
    "solution": "Процесс рангінің жұп не тақ екеніне қарай санның түрін таңдап, оны 2-ге көбейтеміз.",
    "input": "7\n2.5\n-3\n-1.5",
    "module": "module-1"
  },
  {
    "id": "5",
    "title": "Қосынды және орташа мән",
    "solution": "Әр процесс өз сандарын қосады. Тақ рангте қосындыны N-ге бөлеміз.",
    "input": "3 1 2 3\n2 4 8\n1 -2\n3 2 4 9",
    "module": "module-1"
  },
  {
    "id": "9",
    "title": "Әр бағыныңқы процестен төрт сан алу",
    "solution": "0-ранг әр жіберушіден төрт сан қабылдайды.",
    "input": "—\n1 2 3 4\n5 6 7 8",
    "module": "module-2"
  },
  {
    "id": "13",
    "title": "Бір-бір саннан тарату және қалдықты беру",
    "solution": "Алғашқы K − 2 сан жеке жіберіледі, тізімнің қалған бөлігі соңғы рангке бір хабарламамен беріледі.",
    "input": "6 1 2 3 4 5 6\n—\n—\n—",
    "module": "module-2"
  },
  {
    "id": "15",
    "title": "Белгісіз жіберушіден қабылдау",
    "solution": "0-ранг MPI_Probe арқылы хабарламаны тауып, оның ұзындығын және жіберушісін анықтайды.",
    "input": "—\n0\n3 1.5 2 8\n0",
    "module": "module-2"
  },
  {
    "id": "20",
    "title": "Сақинадағы екі көршімен алмасу",
    "solution": "Екі бағыттағы хабарламаны тегтері арқылы ажыратамыз.",
    "input": "10 11\n20 21\n30 31\n40 41",
    "module": "module-2"
  },
  {
    "id": "21",
    "title": "Рангтерді алмастыру арқылы жіберу",
    "solution": "Әр сан N рангке барады. Қабылдаушы жіберуші рангін хабарлама мәртебесінен алады.",
    "input": "1.5 2\n2.5 0\n3.5 1\n4.5 3",
    "module": "module-2"
  },
  {
    "id": "25",
    "title": "Сандарды кері ретпен орналастыру",
    "solution": "r рангі K − 1 − r рангімен алмасады.",
    "input": "1.5\n2.5\n3.5",
    "module": "module-2"
  },
  {
    "id": "26",
    "title": "Тегтегі реттік нөмір",
    "solution": "0-ранг хабарламаларды 1-ден K − 1-ге дейінгі тегтер бойынша қабылдайды.",
    "input": "—\n9.5 3\n4.5 1\n7.5 2",
    "module": "module-2"
  },
  {
    "id": "28",
    "title": "Тегтегі сан түрі",
    "solution": "0 тегі MPI_INT түріне, 1 тегі MPI_DOUBLE түріне сәйкес келеді.",
    "input": "0 7 1 2.5 0 -3\n—\n—\n—",
    "module": "module-2"
  },
  {
    "id": "49",
    "title": "Бағандар бойынша минимум",
    "solution": "Әр позицияны жеке салыстырып, минимумдарды 0-рангке жинаймыз.",
    "input": "4 9 2 8 3 7 0 1\n3 8 5 1 4 6 2 2\n6 7 1 9 0 8 3 3",
    "module": "module-3"
  },
  {
    "id": "51",
    "title": "Бағандар бойынша көбейтінді",
    "solution": "Әр ранг бірдей көбейтінділер тізімін алады.",
    "input": "2 1 0 3 4 -1 2\n3 2 5 2 1 2 -3",
    "module": "module-3"
  },
  {
    "id": "54",
    "title": "Максимумдарды есептеу және тарату",
    "solution": "Әр рангке есептелген максимумдардың өзіне тиесілі жұбы беріледі.",
    "input": "1 9 3 4 5 6\n7 2 8 3 4 8\n2 3 4 9 5 0",
    "module": "module-3"
  },
  {
    "id": "57",
    "title": "Рангке дейінгі максимумдар",
    "solution": "MPI_MAX операциясы әр позициядағы максимумды ағымдағы рангке дейін есептейді.",
    "input": "1 9 3 4 5 6 7 8\n7 2 8 3 4 8 1 0\n2 3 4 9 5 0 9 10",
    "module": "module-3"
  },
  {
    "id": "58",
    "title": "Бүтін үштіктерді тарату",
    "solution": "MPI_Type_contiguous үштіктің түрін сипаттайды, MPI_Bcast оны таратады.",
    "input": "1 2 3 4 5 6\n—\n—",
    "module": "module-3"
  },
  {
    "id": "63",
    "title": "Нақты сан мен екі бүтін санды жіберу",
    "solution": "Туынды түр құрылымның өрістерін сипаттайды. 0-ранг әр жіберушіден бір жазба алады.",
    "input": "—\n1.5 2 3\n4.5 5 6",
    "module": "module-3"
  },
  {
    "id": "65",
    "title": "Үштіктер жиынын жіберу",
    "solution": "MPI_Type_create_resized массив элементтерінің қадамын құрылым өлшеміне теңестіреді.",
    "input": "—\n1 2 3.5\n4 5 6.5 7 8 9.5",
    "module": "module-3"
  },
  {
    "id": "66",
    "title": "Екі тізімді буып-түю және тарату",
    "solution": "0-ранг алдымен бүтін, кейін нақты сандарды буып, бір MPI_Bcast арқылы таратады.",
    "input": "1 2 3 0.5 1.5 2.5\n—\n—",
    "module": "module-3"
  },
  {
    "id": "70",
    "title": "Әр рангтен бір пакет қабылдау",
    "solution": "Әр пакетке әуелі нақты сан, содан кейін бүтін сандар жазылады.",
    "input": "—\n1.5 7\n2.5 8 9",
    "module": "module-3"
  },
  {
    "id": "32",
    "title": "Әр процестен бір сан жинау",
    "solution": "Жиналған тізім 0-рангтің өз санынан басталады.",
    "input": "1.5\n2.5\n3.5",
    "module": "module-4"
  },
  {
    "id": "33",
    "title": "Бес бүтін саннан жинау",
    "solution": "Жиналған тізімде әр рангке бес қатарлас позиция тиесілі.",
    "input": "1 2 3 4 5\n6 7 8 9 10",
    "module": "module-4"
  },
  {
    "id": "39",
    "title": "Қабаттасатын үштіктерді тарату",
    "solution": "0-ранг қабаттасатын үштіктерді бөлек блоктарға көшіріп, MPI_Scatterv арқылы таратады.",
    "input": "10 20 30 40 50\n—\n—",
    "module": "module-4"
  },
  {
    "id": "41",
    "title": "Төрттіктерді барлық процеске жинау",
    "solution": "MPI_Allgather барлық рангке бірдей нәтиже береді.",
    "input": "1 2 3 4\n5 6 7 8",
    "module": "module-4"
  },
  {
    "id": "44",
    "title": "Үш сандық блоктармен алмасу",
    "solution": "Әр адресатқа тиесілі үш сан MPI_Alltoall арқылы бір блок ретінде жіберіледі.",
    "input": "1 2 3 4 5 6\n7 8 9 10 11 12",
    "module": "module-4"
  },
  {
    "id": "46",
    "title": "Көршілес жұптармен алмасу",
    "solution": "Жұптарды бөлек блоктарға орналастырып, ығысу мәндерін MPI_Alltoallv-ге береміз.",
    "input": "1 2 3 4\n5 6 7 8\n9 10 11 12",
    "module": "module-4"
  },
  {
    "id": "72",
    "title": "Тақ рангтер арасында алмасу",
    "solution": "Жұп рангтерді топтан шығарып, жаңа коммуникаторда MPI_Allgather орындаймыз.",
    "input": "—\n1.5 2.5\n—\n3.5 4.5",
    "module": "module-4"
  },
  {
    "id": "74",
    "title": "Жұп рангтердегі минимумдар",
    "solution": "MPI_Comm_split жұп рангтерді топтастырады. Сол топта MPI_Reduce және MPI_MIN қолданылады.",
    "input": "1 8 3\n—\n4 2 1\n—",
    "module": "module-4"
  },
  {
    "id": "77",
    "title": "Таңдалған бірінші процеске жинау",
    "solution": "Таңдалған коммуникаторда бірінші процестің жергілікті рангі 0 болады. Сол процеске MPI_Gather арқылы жинаймыз.",
    "input": "0\n1 2.5\n0\n1 7.5",
    "module": "module-4"
  },
  {
    "id": "79",
    "title": "Таңдалған барлық процеске жинау",
    "solution": "Жаңа коммуникатордағы MPI_Allgather әр қатысушыға толық тізімді береді.",
    "input": "0\n1 2.5\n0\n1 7.5",
    "module": "module-4"
  },
  {
    "id": "81",
    "title": "Таңдалған процестерде қосындыны табу",
    "solution": "Таңдалған топта MPI_Allreduce және MPI_SUM қолданылады.",
    "input": "0\n1 2.5\n0\n1 7.5",
    "module": "module-4"
  },
  {
    "id": "83",
    "title": "Екі өлшемді тордағы координаталар",
    "solution": "MPI_Bcast параметрді таратады, одан кейін әр ранг тордағы жолы мен бағанын табады.",
    "input": "2\n—\n—\n—",
    "module": "module-5"
  },
  {
    "id": "86",
    "title": "Бағандар бойынша тарату",
    "solution": "Бірінші өлшемді сақтап, әр баған ішінде MPI_Bcast орындаймыз.",
    "input": "1.5\n2.5\n—\n—\n—\n—",
    "module": "module-5"
  },
  {
    "id": "89",
    "title": "Әр жолда сандарды жинау",
    "solution": "MPI_Cart_sub үшінші өлшемді сақтайды. Әр жолдың жергілікті 0-рангі сандарды MPI_Gather арқылы жинайды.",
    "input": "10\n11\n12\n13\n14\n15\n16\n17",
    "module": "module-5"
  },
  {
    "id": "94",
    "title": "Периодты координаталар бойынша ранг табу",
    "solution": "Y координатасы период бойынша оралады. X тор шегінен шықса, нәтиже −1 болады.",
    "input": "2 2 0 -1\n1 4\n2 0\n1 -1\n—",
    "module": "module-5"
  },
  {
    "id": "97",
    "title": "Матрицаларды циклдік ығыстыру",
    "solution": "Үшінші өлшемді периодты етіп, сол өлшем бойымен +1 қадамға ығыстырамыз.",
    "input": "0.5\n1.5\n2.5\n3.5\n4.5\n5.5\n6.5\n7.5\n8.5\n9.5\n10.5\n11.5",
    "module": "module-5"
  },
  {
    "id": "100",
    "title": "Жұлдыз графында алмасу",
    "solution": "Әр сәуле үшбұрыш құрайды. Көршілердің рангтерін сұрыптап, әр көршімен бір сан алмасамыз.",
    "input": "10\n11\n12\n13\n14\n15\n16",
    "module": "module-5"
  }
];
const search = document.getElementById("task-search");
const searchResults = document.getElementById("search-results");

function normalize(text) {
    return text.toLocaleLowerCase("kk").trim().replace(/\s+/g, " ");
}

function findTasks(query) {
    const words = normalize(query).split(" ").filter(Boolean);
    if (!words.length) return [];
    return courseTasks.filter(task => {
        const text = normalize("MPIBegin" + task.id + " " + task.id + " " + task.title);
        return words.every(word => /^\d+$/.test(word) ? task.id === word : text.includes(word));
    });
}

function hideSearch() {
    searchResults.hidden = true;
    search.setAttribute("aria-expanded", "false");
}

function showSearch() {
    searchResults.replaceChildren();
    if (!search.value.trim()) { hideSearch(); return; }
    const matches = findTasks(search.value);
    if (matches.length) {
        matches.forEach(task => {
            const link = document.createElement("a");
            link.href = task.module + ".html#task-" + task.id;
            link.textContent = "MPIBegin" + task.id + " · " + task.title;
            searchResults.append(link);
        });
    } else {
        const message = document.createElement("p");
        message.textContent = "Тапсырма табылмады.";
        searchResults.append(message);
    }
    searchResults.hidden = false;
    search.setAttribute("aria-expanded", "true");
}

search.addEventListener("input", showSearch);
search.addEventListener("focus", showSearch);
search.addEventListener("keydown", event => {
    if (event.key === "Escape") hideSearch();
    if (event.key === "Enter" || event.key === "ArrowDown") {
        const first = searchResults.hidden ? null : searchResults.querySelector("a");
        if (first) {
            event.preventDefault();
            if (event.key === "Enter") first.click();
            else first.focus();
        }
    }
});
searchResults.addEventListener("click", event => {
    if (event.target.closest("a")) {
        hideSearch();
        setTimeout(revealTask, 0);
    }
});
searchResults.addEventListener("keydown", event => {
    if (event.key === "Escape") { search.focus(); hideSearch(); }
});
document.addEventListener("click", event => {
    if (!event.target.closest(".search-box")) hideSearch();
});

const navigation = [...document.querySelectorAll(".course-nav a")];
function updateNavigation() {
    const page = location.pathname.split("/").pop() || "index.html";
    navigation.forEach(link => {
        if (link.getAttribute("href") === page) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
}
window.addEventListener("hashchange", updateNavigation);
updateNavigation();

const faq = [
    [/mpi_comm_(rank|size)|ранг|жергілікті ранг/i, "Ранг — процесс нөмірі. MPI_Comm_rank ағымдағы рангті, MPI_Comm_size коммуникатордағы процестер санын береді.", "module-1.html"],
    [/mpi_sendrecv_replace|mpi_sendrecv/i, "MPI_Sendrecv бір шақыруда хабарлама жібереді және қабылдайды. MPI_Sendrecv_replace қабылданған деректі жіберу буферінің өзіне жазады.", "module-2.html"],
    [/mpi_any_source|mpi_any_tag|mpi_get_count|mpi_probe/i, "MPI_Probe хабарламаны алмай тұрып оның мәртебесін тексереді. MPI_Get_count элементтер санын анықтайды. MPI_ANY_SOURCE кез келген жіберушіні, MPI_ANY_TAG кез келген тегті қабылдауға мүмкіндік береді.", "module-2.html"],
    [/mpi_send|mpi_recv|хабарлама|тег/i, "MPI_Send деректі басқа рангке жібереді, MPI_Recv оны қабылдайды. Тег бір коммуникатордағы хабарламаларды ажыратуға көмектеседі.", "module-2.html"],
    [/mpi_allreduce|mpi_reduce|mpi_scan|редукц|минимум|максимум/i, "Редукция бірнеше процестің деректерін біріктіреді. MPI_Reduce нәтижені бір процеске, MPI_Allreduce барлық қатысушыға береді. MPI_Scan нәтижені әр рангке дейін есептейді.", "module-3.html"],
    [/mpi_pack|mpi_unpack|туынды|буып/i, "Туынды дерек түрі бірнеше өрісті бір жазба ретінде сипаттайды. MPI_Pack мәндерді буферге жинайды, MPI_Unpack оларды сол ретпен шығарады.", "module-3.html"],
    [/mpi_allgather|mpi_gather|mpi_scatterv|mpi_alltoall|ұжымдық/i, "MPI_Gather деректерді бір рангке жинайды. MPI_Allgather жиналған деректерді бәріне береді. MPI_Scatterv блоктарды берілген ығысулар бойынша таратады.", "module-4.html"],
    [/mpi_comm_split|mpi_comm_world|коммуникатор/i, "Коммуникатор MPI операциясына қай процестер қатысатынын анықтайды. MPI_COMM_WORLD барлық процесті қамтиды, MPI_Comm_split оларды топтарға бөледі.", "module-4.html"],
    [/mpi_cart|mpi_graph|топологи|декарт|граф|координат/i, "MPI процестерді тор немесе граф түрінде ұйымдастыра алады. MPI_Cart_create тор құрады, MPI_Cart_coords рангтің координатасын табады, MPI_Graph_neighbors көршілерді береді.", "module-5.html"],
    [/код|бастапқы|жүкте|mpicc/i, "«Бастапқы код» бөлімінен тапсырманы ашыңыз. Сол жерде C коды, көшіру түймесі және MPI арқылы терминалда іске қосу пәрмендері бар.", "code.html"],
    [/іске қос|қалай орында|қалай баст|енгіз|деректер|нәтиже/i, "Тапсырманы ашыңыз. Әр рангке бір жол жазыңыз, сандарды бос орынмен бөліңіз. Дерегі жоқ рангке — белгісін қойыңыз. Содан кейін «Іске қосу» түймесін басыңыз.", "index.html#guide"],
    [/неше|қанша|модуль/i, "Практикумда 5 модуль және 36 тапсырма бар. Модульді мәзірден таңдауға немесе тапсырманы іздеу жолағына оның нөмірін жазуға болады.", "index.html#guide"],
    [/mpi_init|mpi_finalize/i, "MPI_Init MPI ортасын іске қосады, MPI_Finalize оны аяқтайды. MPI операциялары осы екі шақырудың арасында орындалады.", "module-1.html"],
    [/^mpi[?!.]*$|mpi деген|mpi не|mpi қалай|параллель/i, "MPI — бөлек жады бар бірнеше процесс арасында хабарлама алмасуға арналған стандарт. Процестер бір бағдарлама бөліктерін қатар орындай алады.", "module-1.html"],
    [/^сәлем|^салем|^ассалаумағалейкүм/i, "Сәлем! MPI, тапсырмалар немесе бастапқы код туралы сұраңыз."],
    [/^рақмет|^рахмет/i, "Оқуыңызға сәттілік!"]
];

const mpiFunctions = {
  "mpi_init": [
    "MPI_Init бағдарламаның басында MPI ортасын іске қосады. C тілінде әдетте MPI_Init(&argc, &argv) шақырылады.",
    "module-1.html"
  ],
  "mpi_finalize": [
    "MPI_Finalize MPI жұмысын аяқтайды. Әр процесс оны барлық байланысын аяқтағаннан кейін шақырады.",
    "module-1.html"
  ],
  "mpi_comm_rank": [
    "MPI_Comm_rank (comm, &rank) ағымдағы процестің осы коммуникатордағы нөмірін береді. Ранг 0-ден басталады.",
    "module-1.html"
  ],
  "mpi_comm_size": [
    "MPI_Comm_size (comm, &size) коммуникатордағы процестер санын береді. Практикумда бұл сан K деп белгіленеді.",
    "module-1.html"
  ],
  "mpi_comm_world": [
    "MPI_COMM_WORLD бағдарлама іске қосылған кездегі барлық MPI процестерін қамтиды. Жаңа коммуникаторда ранг нөмірлері өзгеруі мүмкін.",
    "module-1.html"
  ],
  "mpi_send": [
    "MPI_Send буфердегі деректі көрсетілген алушы рангке және тегке жібереді. Мысалы, 0-рангке төрт бүтін сан үшін count = 4, type = MPI_INT болады.",
    "module-2.html"
  ],
  "mpi_recv": [
    "MPI_Recv сәйкес хабарламаны буферге қабылдайды. Буфер хабарламаға жеткілікті болуы, ал дерек түрі жіберілген түрге сәйкес келуі керек.",
    "module-2.html"
  ],
  "mpi_probe": [
    "MPI_Probe хабарламаны қабылдамай тұрып оның мәртебесін береді. Содан кейін ұзындығын MPI_Get_count арқылы біліп, MPI_Recv шақыруға болады.",
    "module-2.html"
  ],
  "mpi_get_count": [
    "MPI_Get_count мәртебе мен берілген MPI дерек түрі бойынша хабарламадағы элементтер санын қайтарады. Мысалы, санау түрі MPI_INT болса, нәтиже байт саны емес, бүтін сандар саны болады.",
    "module-2.html"
  ],
  "mpi_any_source": [
    "MPI_ANY_SOURCE қабылдаушыға кез келген жіберушіден хабарлама алуға мүмкіндік береді. Нақты жіберуші status.MPI_SOURCE өрісінде көрсетіледі.",
    "module-2.html"
  ],
  "mpi_any_tag": [
    "MPI_ANY_TAG кез келген тегпен келген хабарламаны сәйкестендіреді. Нақты тегті status.MPI_TAG өрісінен оқуға болады.",
    "module-2.html"
  ],
  "mpi_sendrecv": [
    "MPI_Sendrecv бір шақыруда бөлек буферлер арқылы хабарлама жібереді және қабылдайды. MPI_Sendrecv_replace бір буферді қолданады, оған соңында қабылданған мәндер жазылады.",
    "module-2.html"
  ],
  "mpi_sendrecv_replace": [
    "MPI_Sendrecv_replace бір буфердегі деректі жібереді және қабылданған деректі сол буферге жазады. MPIBegin25 тапсырмасында r рангі K − 1 − r рангімен алмасады.",
    "module-2.html"
  ],
  "mpi_reduce": [
    "MPI_Reduce барлық қатысушының бірдей позицияларындағы мәндерді біріктіреді. Нәтиже тек таңдалған түбірлік процесте болады.",
    "module-3.html"
  ],
  "mpi_allreduce": [
    "MPI_Allreduce әр позициядағы мәндерді біріктіріп, нәтижені барлық қатысушы процеске береді.",
    "module-3.html"
  ],
  "mpi_reduce_scatter": [
    "MPI_Reduce_scatter әуелі мәндерді позиция бойынша біріктіреді, кейін нәтижені әр рангке көрсетілген мөлшерде бөліп береді.",
    "module-3.html"
  ],
  "mpi_scan": [
    "MPI_Scan r рангінде 0-ден r-ге дейінгі процестердің деректерін біріктіреді. Әр рангтің қамтитын аралығы әртүрлі.",
    "module-3.html"
  ],
  "mpi_min": [
    "MPI_MIN бірдей позициядағы мәндердің ең кішісін таңдайды. [2, 7] және [4, 3] үшін нәтиже [2, 3] болады.",
    "module-3.html"
  ],
  "mpi_max": [
    "MPI_MAX бірдей позициядағы мәндердің ең үлкенін таңдайды. [2, 7] және [4, 3] үшін нәтиже [4, 7] болады.",
    "module-3.html"
  ],
  "mpi_prod": [
    "MPI_PROD мәндерді көбейтеді. [2, 7] және [4, 3] тізімдері үшін нәтиже [8, 21] болады.",
    "module-3.html"
  ],
  "mpi_sum": [
    "MPI_SUM мәндерді қосады. Массивтер берілсе, қосынды әр позиция үшін бөлек есептеледі.",
    "module-3.html"
  ],
  "mpi_type_commit": [
    "MPI_Type_commit жасалған туынды дерек түрін MPI хабарламаларында қолдануға дайындайды. Жұмыс біткенде MPI_Type_free арқылы босатуға болады.",
    "module-3.html"
  ],
  "mpi_type_contiguous": [
    "MPI_Type_contiguous бір MPI түрінің қатар орналасқан бірнеше элементін жаңа туынды түрге біріктіреді. Мысалы, үш MPI_INT бір үштік ретінде жіберіледі.",
    "module-3.html"
  ],
  "mpi_type_create_struct": [
    "MPI_Type_create_struct әртүрлі түрдегі өрістерді олардың ығысулары арқылы сипаттайды. Мысалы, бір жазбаға екі MPI_INT және бір MPI_DOUBLE енгізуге болады.",
    "module-3.html"
  ],
  "mpi_type_create_resized": [
    "MPI_Type_create_resized туынды түрдің MPI есептейтін қадамын өзгертеді. Бұл құрылымдар массивін жібергенде элементтердің аралығы sizeof мәніне тең болуы үшін қолданылады.",
    "module-3.html"
  ],
  "mpi_pack": [
    "MPI_Pack әртүрлі мәндерді бір буферге кезекпен жазады. position айнымалысы келесі мәннің жазылатын орнын көрсетеді.",
    "module-3.html"
  ],
  "mpi_unpack": [
    "MPI_Unpack мәндерді буферден буылған ретімен оқиды. Оқу кезінде де position айнымалысы келесі мәннің орнын көрсетеді.",
    "module-3.html"
  ],
  "mpi_bcast": [
    "MPI_Bcast түбірлік процестің бір дерегін коммуникатордағы барлық процестерге таратады. Барлық қатысушы бір түбір рангін көрсетеді.",
    "module-4.html"
  ],
  "mpi_gather": [
    "MPI_Gather әр процестен дерек жинап, түбірлік рангке жазады. Блоктар коммуникатордағы рангтердің өсу ретімен орналасады.",
    "module-4.html"
  ],
  "mpi_allgather": [
    "MPI_Allgather барлық процестен дерек жинап, толық тізімді әр қатысушыға береді.",
    "module-4.html"
  ],
  "mpi_scatterv": [
    "MPI_Scatterv түбірден әр рангке мөлшері мен бастапқы ығысуы көрсетілген блокты жібереді. MPIBegin39 тапсырмасында әр процесс үш сан алады.",
    "module-4.html"
  ],
  "mpi_alltoall": [
    "MPI_Alltoall әр процестің дерегін блоктарға бөліп, әр адресатқа өз блогын жібереді. Бір қабылдаушының нәтижесінде әр жіберушіден бір блок болады.",
    "module-4.html"
  ],
  "mpi_alltoallv": [
    "MPI_Alltoallv әр адресатқа жіберілетін және әр жіберушіден қабылданатын көлемді жеке көрсетуге мүмкіндік береді. Орындар ығысу массивтерімен беріледі.",
    "module-4.html"
  ],
  "mpi_comm_group": [
    "MPI_Comm_group берілген коммуникатордың процесс тобын қайтарады. Осы топтың негізінде жаңа топ құруға болады.",
    "module-4.html"
  ],
  "mpi_group_excl": [
    "MPI_Group_excl көрсетілген рангтерді алып тастап, жаңа топ құрады. MPIBegin72 тапсырмасында жұп рангтер алынып тасталады.",
    "module-4.html"
  ],
  "mpi_comm_create": [
    "MPI_Comm_create берілген топтан жаңа коммуникатор жасайды. Топқа кірмейтін процестер MPI_COMM_NULL алады.",
    "module-4.html"
  ],
  "mpi_comm_split": [
    "MPI_Comm_split процестерді color мәні бойынша бөледі. Бір түсті процестер бірге қалады, key жергілікті ранг ретін анықтайды, ал MPI_UNDEFINED процесті топқа қоспайды.",
    "module-4.html"
  ],
  "mpi_cart_create": [
    "MPI_Cart_create процестерді өлшемдері мен периодтылығы көрсетілген тікбұрышты торға орналастырады.",
    "module-5.html"
  ],
  "mpi_cart_coords": [
    "MPI_Cart_coords берілген рангтің декарттық тордағы координаталарын береді. Мысалы, рангтер өзгермеген 2 × 3 торында 4-ранг (1, 1) ұяшығында тұрады.",
    "module-5.html"
  ],
  "mpi_cart_rank": [
    "MPI_Cart_rank тор координаталарын рангке түрлендіреді. Периодты өлшемде координата тордың шекарасынан айналып өтеді.",
    "module-5.html"
  ],
  "mpi_cart_sub": [
    "MPI_Cart_sub тордың таңдалған өлшемдерін сақтап, кіші тор коммуникаторларын құрады. Мысалы, екі өлшемді тордан бағандарды бөлуге болады.",
    "module-5.html"
  ],
  "mpi_cart_shift": [
    "MPI_Cart_shift ығысу үшін деректі қай рангтен алып, қай рангке жіберу керегін анықтайды. Деректі кейін MPI_Sendrecv арқылы тасымалдауға болады.",
    "module-5.html"
  ],
  "mpi_graph_create": [
    "MPI_Graph_create процестерді граф түйіндері ретінде байланыстырады. Әр процестің көршілері берілген қырлар арқылы анықталады.",
    "module-5.html"
  ],
  "mpi_graph_neighbors_count": [
    "MPI_Graph_neighbors_count графтағы көрсетілген процестің көршілер санын береді. Ол көршілер тізімі үшін буфер өлшемін таңдауға көмектеседі.",
    "module-5.html"
  ],
  "mpi_graph_neighbors": [
    "MPI_Graph_neighbors графтағы процестің көрші рангтерін қайтарады. Рангтерді өсу ретімен шығару қажет болса, оларды сұрыптаңыз.",
    "module-5.html"
  ]
};
const courseModules = [{"id":1,"title":"Бағдарламаларды параллель режимде орындау","count":2},{"id":2,"title":"Екі процесс арасында хабарлама жіберу","count":8},{"id":3,"title":"Редукция операциялары және құрама дерек түрлері","count":9},{"id":4,"title":"Ұжымдық операциялар және коммуникаторлар құру","count":11},{"id":5,"title":"Виртуалды топологияларды пайдалану","count":6}];
function answerFor(question) {
    const query = normalize(question);
    const number = query.match(/(?:mpibegin\s*|тапсырма\s*)(\d+)|\b(\d+)\s*[-–]?\s*тапсырма|^(\d+)[?!.\s]*$/);
    if (number) {
        const id = number[1] || number[2] || number[3];
        const task = courseTasks.find(item => item.id === id);
        if (!task) return ["Бұл нөмір 2-нұсқада жоқ. Тапсырмаларды іздеу жолағын қолданып көріңіз."];
        const target = task.module + ".html#task-" + id;
        if (/код|бастапқы/i.test(query)) return ["MPIBegin" + id + " тапсырмасының C тіліндегі шешімі.", "code.html#code-" + id, "Кодты ашу"];
        if (/мысал|дерек|енгіз/i.test(query)) {
            const lines = task.input.split("\n").map((line,rank) => rank + ": " + line);
            return ["MPIBegin" + id + " тапсырмасының мысалы. Деректер рангтер бойынша берілген.\n" + lines.join("\n"), target, "Мысалды іске қосу"];
        }
        return ["MPIBegin" + id + " · " + task.title + ". " + task.solution, target, "Тапсырманы ашу"];
    }
    const module = query.match(/модуль\s*([1-5])|([1-5])\s*[-–]?\s*модуль/);
    if (module) {
        const id = Number(module[1] || module[2]);
        const {title,count} = courseModules[id - 1];
        return [id + "-модуль. " + title + ". Бұл бетте теория және " + count + " тапсырма бар.", "module-" + id + ".html", "Модульді ашу"];
    }
    const extra = additionalFaq.find(([pattern]) => pattern.test(query));
    if (extra && /reduce.*allreduce|allreduce.*reduce|gather.*allgather|allgather.*gather/.test(query)) return extra.slice(1);
    const names = query.replace(/\bmpi\s+([a-z]+(?:\s+[a-z]+)*)/g, (_, parts) => "mpi_" + parts.replaceAll(" ","_")).match(/\bmpi(?:_[a-z]+)+\b/g) || [];
    const known = [...new Set(names)].filter(name => Object.hasOwn(mpiFunctions,name));
    if (known.length) {
        const items = known.slice(0,3).map(name => mpiFunctions[name]);
        return [items.map(item => item[0]).join("\n\n"),items[0][1],"Теорияны ашу"];
    }
    if (extra) return extra.slice(1);
    const match = faq.find(([pattern]) => pattern.test(query));
    return match ? match.slice(1) : ["Бұл сұраққа дайын жауабым жоқ. «MPI_Gather деген не?», «4-модуль», «MPIBegin20 мысалы» немесе «Қате шықса не істеймін?» деп сұрап көріңіз."];
}
const additionalFaq = [
    [/reduce.*allreduce|allreduce.*reduce/i,"MPI_Reduce нәтижені бір түбірлік процеске береді. MPI_Allreduce нәтижені барлық қатысушыға береді.","module-3.html"],
    [/gather.*allgather|allgather.*gather/i,"MPI_Gather деректерді бір процеске жинайды, MPI_Allgather толық тізімді барлық процеске береді.","module-4.html"],
    [/қате|жарамсыз|артық сан|жетпей/i,"Ранг пен позиция көрсетілсе, 0-рангтен бастап тиісті жолды тексеріңіз. Әр жолда шартта көрсетілген мөлшерде сан болсын. Мысалды қалпына келтіріп, өзгерістерді бір-бірлеп енгізуге болады.","index.html#guide"],
    [/бос жол|дерегі жоқ|тире|сызықша/i,"Дерегі жоқ ранг үшін жеке жолға — белгісін қойыңыз. Сонда келесі рангтің жолы өз орнында қалады.","index.html#guide"],
    [/қатып|тұйықтал|deadlock/i,"Тұйықталу процестер бір-бірін күтіп, ешқайсысы жалғастыра алмаған кезде болады. Блоктаушы жіберу мен қабылдауды реттеңіз немесе екі жақты алмасуда MPI_Sendrecv қолданыңыз.","module-2.html"],
    [/орнат|интернет|сервер|симуляц|модель/i,"Веб-тапсырмалар браузерде MPI алмасуын модельдейді. Сайт файлдарын бірге сақтасаңыз, index.html арқылы интернетсіз ашуға болады. C бағдарламасын терминалда орындау үшін MPI ортасы қажет.","index.html#guide"],
    [/бөлшек|ондық|үтір|нақты сан/i,"Нақты санды 2.5 немесе 2,5 түрінде енгізуге болады. Бүтін сан сұралса, бөлшек бөлігі жоқ жазылым қолданыңыз.","index.html#guide"],
    [/период|циклдік/i,"Периодты торда координата шекарадан қайта айналып келеді. Мысалы, ені 3 торда −1 бағаны 2 бағанына сәйкес келеді.","module-5.html"]
];

function redirectOldLinks() {
    if (!/(?:\/|\/index\.html)$/.test(location.pathname)) return;
    const hash = location.hash;
    const module = hash.match(/^#module-([1-5])$/);
    const task = courseTasks.find(item => hash === "#task-" + item.id);
    if (module) location.replace("module-" + module[1] + ".html");
    else if (task) location.replace(task.module + ".html" + hash);
    else if (/^#code(?:-\d+)?$/.test(hash)) location.replace("code.html" + hash);
}
redirectOldLinks();
window.addEventListener("hashchange", redirectOldLinks);


const chatDialog = document.getElementById("chat-dialog");
const chatLog = document.getElementById("chat-log");
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");

function appendMessage(text, who, href, label) {
    const message = document.createElement("p");
    message.className = "message " + who;
    message.textContent = text;
    if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label || "Бөлімді ашу";
        message.append(" ", link);
    }
    chatLog.append(message);
}

function ask(question) {
    const normalized = question.trim();
    if (!normalized) return;
    appendMessage(normalized, "user");
    const [reply, href, label] = answerFor(normalized);
    appendMessage(reply, "bot", href, label);
    chatLog.scrollTop = chatLog.scrollHeight;
}

document.querySelectorAll("[data-chat-open]").forEach(button => button.addEventListener("click", () => {
    if (!chatDialog.open) chatDialog.showModal();
    chatInput.focus();
}));
document.getElementById("chat-close").addEventListener("click", () => chatDialog.close());
chatLog.addEventListener("click", event => {
    if (event.target.closest("a")) {
        chatDialog.close();
        setTimeout(revealTask, 0);
    }
});
document.querySelectorAll(".chat-prompts button").forEach(button => {
    button.addEventListener("click", () => ask(button.textContent));
});
chatForm.addEventListener("submit", event => {
    event.preventDefault();
    ask(chatInput.value);
    chatInput.value = "";
});
