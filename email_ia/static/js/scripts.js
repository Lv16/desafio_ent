const emailTextArea = document.getElementById("email_text");
const respostaEl = document.getElementById("resposta");
const toastRegion = document.getElementById('toastRegion');

function toast(message, type = 'info', title = null, timeoutMs = 3200) {
    if (!toastRegion) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `
        <div class="t-dot" aria-hidden="true"></div>
        <div class="t-body">
            <div class="t-title">${title || (type === 'error' ? 'Ops…' : type === 'success' ? 'Pronto!' : 'Info')}</div>
            <div class="t-msg"></div>
        </div>
        <button class="t-close" type="button" aria-label="Fechar">×</button>
    `;
    t.querySelector('.t-msg').textContent = message;
    const close = () => {
        t.style.animation = 'toast-out .22s ease forwards';
        setTimeout(() => t.remove(), 240);
    };
    t.querySelector('.t-close').addEventListener('click', close);
    toastRegion.appendChild(t);
    if (timeoutMs > 0) setTimeout(close, timeoutMs);
}

// Theme (dark mode)
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const THEME_KEY = 'email_ai_theme_v1';

function applyTheme(theme) {
    const t = theme === 'dark' ? 'dark' : 'light';
    document.body.dataset.theme = t;
    const isDark = t === 'dark';
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark));
    if (themeIcon) themeIcon.textContent = isDark ? '☀' : '☾';
    if (themeText) themeText.textContent = isDark ? 'Modo claro' : 'Modo escuro';
}

function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === 'dark' || saved === 'light') {
        applyTheme(saved);
        return;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
}

themeToggle && themeToggle.addEventListener('click', () => {
    const cur = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
});

const splash = document.getElementById('splash');
const appRoot = document.getElementById('app');
const enterBtn = document.getElementById('enterBtn');
let _splashDone = false;

function finishSplash() {
    if (_splashDone) return;
    _splashDone = true;
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => splash.classList.add('visually-gone'), 520);
    }
    if (appRoot) {
        appRoot.classList.remove('app-hidden');
        appRoot.classList.add('app-show');
    }
}

if (splash) {
    const delay = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 2200;
    setTimeout(finishSplash, delay);
    enterBtn && enterBtn.addEventListener('click', finishSplash);
    splash.addEventListener('click', (e) => {
        if (e.target === splash) finishSplash();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') finishSplash();
    });
} else {
    appRoot && appRoot.classList.add('app-show');
}

const btnText = document.getElementById("btnText");
const btnFile = document.getElementById("btnFile");
const textInput = document.getElementById("textInput");
const fileInput = document.getElementById("fileInput");
const inputHint = document.getElementById('inputHint');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
let _resultHideTimeout = null;
const badge = document.getElementById("badge");
const copyBtn = document.getElementById("copyBtn");
const fileEl = document.getElementById("email_file");
const fileInfo = document.getElementById("fileInfo");
const dropZone = document.getElementById('dropZone');
const filePreview = document.getElementById('filePreview');
const restartBtn = document.getElementById("restartBtn");

const historyRoot = document.getElementById('history');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const HISTORY_KEY = 'email_ai_history_v1';

// Analytics (local)
const analyticsRoot = document.getElementById('analytics');
const resetAnalyticsBtn = document.getElementById('resetAnalyticsBtn');
const aTodayEl = document.getElementById('aToday');
const aTotalEl = document.getElementById('aTotal');
const aProdEl = document.getElementById('aProd');
const aImprodEl = document.getElementById('aImprod');
const aMetaEl = document.getElementById('aMeta');
const aTodayMiniEl = document.getElementById('aTodayMini');
const aTotalMiniEl = document.getElementById('aTotalMini');
const ANALYTICS_KEY = 'email_ai_analytics_v1';

function dayKey(d = new Date()) {
    try { return d.toISOString().slice(0, 10); } catch (e) { return String(Date.now()); }
}

function loadAnalytics() {
    try {
        const raw = localStorage.getItem(ANALYTICS_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {}
    return { total: 0, byCategory: { Produtivo: 0, Improdutivo: 0 }, byDay: {}, lastAt: null };
}

function saveAnalytics(a) {
    try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(a)); } catch (e) {}
}

function renderAnalytics() {
    if (!analyticsRoot) return;
    const a = loadAnalytics();
    const today = dayKey();
    const todayCount = (a.byDay && a.byDay[today]) ? a.byDay[today] : 0;
    const prod = (a.byCategory && a.byCategory.Produtivo) ? a.byCategory.Produtivo : 0;
    const improd = (a.byCategory && a.byCategory.Improdutivo) ? a.byCategory.Improdutivo : 0;
    const total = a.total || 0;

    if (aTodayEl) aTodayEl.textContent = String(todayCount);
    if (aTotalEl) aTotalEl.textContent = String(total);
    if (aProdEl) aProdEl.textContent = String(prod);
    if (aImprodEl) aImprodEl.textContent = String(improd);
    if (aTodayMiniEl) aTodayMiniEl.textContent = String(todayCount);
    if (aTotalMiniEl) aTotalMiniEl.textContent = String(total);

    if (aMetaEl) {
        if (a.lastAt) {
            const d = new Date(a.lastAt);
            aMetaEl.textContent = `Último processamento: ${d.toLocaleString()}`;
        } else {
            aMetaEl.textContent = 'Nenhum processamento ainda.';
        }
    }
}

function trackAnalytics(categoria) {
    const a = loadAnalytics();
    const today = dayKey();
    a.total = (a.total || 0) + 1;
    a.byCategory = a.byCategory || { Produtivo: 0, Improdutivo: 0 };
    if (categoria === 'Produtivo') a.byCategory.Produtivo = (a.byCategory.Produtivo || 0) + 1;
    else if (categoria === 'Improdutivo') a.byCategory.Improdutivo = (a.byCategory.Improdutivo || 0) + 1;
    a.byDay = a.byDay || {};
    a.byDay[today] = (a.byDay[today] || 0) + 1;
    a.lastAt = Date.now();
    saveAnalytics(a);
    renderAnalytics();
}

resetAnalyticsBtn && resetAnalyticsBtn.addEventListener('click', () => {
    saveAnalytics({ total: 0, byCategory: { Produtivo: 0, Improdutivo: 0 }, byDay: {}, lastAt: null });
    renderAnalytics();
    toast('Analytics zerado (local).', 'success');
});

function nowLabel() {
    try {
        const d = new Date();
        return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch (e) {
        return new Date().toISOString();
    }
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function saveHistory(items) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch (e) {}
}

function renderHistory() {
    if (!historyRoot || !historyList) return;
    const items = loadHistory();
    historyList.innerHTML = '';
    if (!items.length) {
        historyRoot.classList.add('hidden');
        return;
    }
    historyRoot.classList.remove('hidden');
    for (const item of items) {
        const row = document.createElement('div');
        row.className = 'history-item';
        const safeCat = item.categoria || '';
        const excerpt = item.excerpt || '';
        const when = item.when || '';
        row.innerHTML = `
          <div class="history-left">
            <div><strong>${safeCat}</strong></div>
            <div class="history-meta">${when}</div>
            <div class="history-meta">${excerpt}</div>
          </div>
          <div class="history-actions">
            <button class="history-open" type="button">Abrir</button>
          </div>
        `;
        row.querySelector('.history-open').addEventListener('click', () => {
            showResult({ categoria: item.categoria, resposta: item.resposta }, { saveHistory: false, trackAnalytics: false });
            toast('Resposta aberta a partir do histórico.', 'info');
            try { if (window.scrollTo) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch(e) {}
        });
        historyList.appendChild(row);
    }
}

clearHistoryBtn && clearHistoryBtn.addEventListener('click', () => {
    saveHistory([]);
    renderHistory();
    toast('Histórico limpo.', 'success');
});

function showTextMode() {
    btnText.classList.add("active");
    btnFile.classList.remove("active");
    textInput.classList.remove("hidden");
    fileInput.classList.add("hidden");
    updateSubmitState();
}

function showFileMode() {
    btnFile.classList.add("active");
    btnText.classList.remove("active");
    fileInput.classList.remove("hidden");
    textInput.classList.add("hidden");
    updateSubmitState();
}

btnText.addEventListener("click", showTextMode);
btnFile.addEventListener("click", showFileMode);

function isFileMode() {
    return fileInput && !fileInput.classList.contains('hidden');
}

function updateCharCount() {
    if (!charCount || !emailTextArea) return;
    const n = (emailTextArea.value || '').length;
    charCount.textContent = `${n} caracteres`;
}

function setHint(message, isError = false) {
    if (!inputHint) return;
    inputHint.textContent = message;
    inputHint.classList.toggle('error', !!isError);
}

function updateSubmitState() {
    if (!submitBtn) return;
    const fileMode = isFileMode();
    const hasFile = !!(fileEl && fileEl.files && fileEl.files[0]);
    const text = (emailTextArea && emailTextArea.value || '').trim();
    const ok = fileMode ? hasFile : text.length > 0;
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('ready', ok);
    if (fileMode) {
        setHint(hasFile ? 'Arquivo pronto para processamento.' : 'Escolha ou arraste um arquivo .txt/.pdf.', !hasFile);
    } else {
        setHint(text.length ? 'Pronto para processar.' : 'Cole um e-mail ou selecione um arquivo.', !text.length);
    }
    updateCharCount();
}

function setLoading(on) {
    if (on) {
        if (loading) {
            loading.classList.remove('hidden');
            loading.offsetHeight;
            loading.classList.add('show');
        }
        submitBtn.disabled = true;
        if (result) {
            result.classList.remove('show');
            if (_resultHideTimeout) { clearTimeout(_resultHideTimeout); _resultHideTimeout = null; }
            _resultHideTimeout = setTimeout(()=>{ result.classList.add('hidden'); _resultHideTimeout = null; }, 320);
        }
    } else {
        if (loading) { loading.classList.remove('show'); setTimeout(()=>loading.classList.add('hidden'), 320); }
        updateSubmitState();
    }
}

async function processText(text) {
    const resp = await fetch("/processar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: text })
    });
    if (!resp.ok) throw new Error("Erro ao processar texto");
    return resp.json();
}

async function processFile(file) {
    const fd = new FormData();
    fd.append("email_file", file);
    const resp = await fetch("/processar", {
        method: "POST",
        body: fd
    });
    if (!resp.ok) throw new Error("Erro ao processar arquivo");
    return resp.json();
}

copyBtn.addEventListener("click", function () {
    const text = respostaEl.innerText;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerText = "Copiado!";
        toast('Resposta copiada para a área de transferência.', 'success');
        setTimeout(() => {
            copyBtn.innerText = "Copiar resposta";
        }, 1500);
    });
});

showTextMode();
renderHistory();
updateSubmitState();
initTheme();
renderAnalytics();

// Ctrl+Enter to submit
emailTextArea && emailTextArea.addEventListener('keydown', (e) => {
    const key = e.key || '';
    if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'enter') {
        e.preventDefault();
        submitBtn && submitBtn.click();
    }
});

emailTextArea && emailTextArea.addEventListener('input', updateSubmitState);

async function extractTextFromPDF(file) {
    if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js não carregado');
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str || '').join(' ');
        fullText += strings + '\n\n';
    }
    return fullText.trim();
}

function setPreview(text, filename) {
    if (!filePreview) return;
    const cleaned = (text || '').trim();
    const excerpt = cleaned.length > 420 ? cleaned.slice(0, 420) + '…' : cleaned;
    filePreview.innerHTML = `
        <div class="preview-title">Prévia extraída${filename ? ' • ' + filename : ''}</div>
        <div>${excerpt || '(sem texto detectado)'}</div>
        <div class="preview-meta">${cleaned.length} caracteres extraídos</div>
    `;
    filePreview.classList.toggle('hidden', false);
}

async function handleSelectedFile(f) {
    if (!f) return;
    if (fileInfo) fileInfo.innerText = f.name;
    const ext = f.name.split('.').pop().toLowerCase();
    try {
        setLoading(true);
        let text = '';
        if (ext === 'txt') {
            text = await f.text();
        } else if (ext === 'pdf') {
            text = await extractTextFromPDF(f);
        } else {
            toast('Formato não suportado. Use .txt ou .pdf.', 'error');
            return;
        }
        emailTextArea.value = (text || '').trim();
        setPreview(text, f.name);
        toast('Arquivo carregado com sucesso.', 'success');
    } catch (err) {
        console.error(err);
        toast('Erro ao ler o arquivo.', 'error', null);
    } finally {
        setLoading(false);
        updateSubmitState();
    }
}

fileEl && fileEl.addEventListener('change', async function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
        fileInfo.innerText = 'Nenhum arquivo';
        if (filePreview) filePreview.classList.add('hidden');
        updateSubmitState();
        return;
    }
    await handleSelectedFile(f);
});

if (dropZone) {
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, prevent);
    });
    dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', async (e) => {
        dropZone.classList.remove('dragover');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        try {
            const dt = new DataTransfer();
            dt.items.add(f);
            if (fileEl) fileEl.files = dt.files;
        } catch (err) {}
        await handleSelectedFile(f);
    });
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileEl && fileEl.click();
        }
    });
}

function showResult(data, opts = {}){
    const saveHistoryEntry = opts.saveHistory !== false;
    const track = opts.trackAnalytics !== false;
    badge.innerText = data.categoria || '';
    badge.className = 'badge';
    if (data.categoria === 'Produtivo') badge.classList.add('prod');
    else badge.classList.add('improd');
    respostaEl.innerText = data.resposta || '';

    if (result) {
        if (_resultHideTimeout) { clearTimeout(_resultHideTimeout); _resultHideTimeout = null; }
        result.classList.remove('hidden');
        result.offsetHeight;
        result.classList.add('show');
    }

    try{ respostaEl.setAttribute('tabindex','-1'); respostaEl.focus({preventScroll:true}); } catch(e){}

    try { emailTextArea.readOnly = true; } catch(e){}
    if (fileEl) fileEl.disabled = true;
    if (btnText) btnText.disabled = true;
    if (btnFile) btnFile.disabled = true;
    if (submitBtn) submitBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.remove('hidden');

    if (track) {
        try { trackAnalytics(data.categoria || ''); } catch (e) {}
    }

    if (saveHistoryEntry) {
        try {
            const items = loadHistory();
            const excerpt = (emailTextArea.value || '').trim().slice(0, 70);
            items.unshift({
                when: nowLabel(),
                categoria: data.categoria || '',
                resposta: data.resposta || '',
                excerpt: excerpt ? (excerpt.length >= 70 ? excerpt + '…' : excerpt) : '(sem texto)'
            });
            saveHistory(items.slice(0, 5));
            renderHistory();
        } catch (e) {}
    }

    try { navigator.vibrate && navigator.vibrate(25); } catch(e) {}
}

const formEl = document.querySelector('form') || null;
if (formEl) {
    formEl.addEventListener('submit', async function(e){
        e.preventDefault();
        setLoading(true);
        try {

            if (!fileInput.classList.contains('hidden') && fileEl && fileEl.files && fileEl.files[0]) {
                const data = await processFile(fileEl.files[0]);
                showResult(data);
            } else {
                const text = emailTextArea.value.trim();
                if (!text) throw new Error('Texto vazio');
                const data = await processText(text);
                showResult(data);
            }
        } catch(err){
            toast(err.message || 'Erro ao processar o e-mail', 'error');
        } finally { setLoading(false); }
    });
}

if (!formEl) {
    submitBtn && submitBtn.addEventListener('click', async function(e){
        e.preventDefault();
        setLoading(true);
        try{
            if (isFileMode() && fileEl && fileEl.files && fileEl.files[0]) {
                const data = await processFile(fileEl.files[0]);
                showResult(data);
            } else {
                const text = emailTextArea.value.trim();
                if (!text) throw new Error('Texto vazio');
                const data = await processText(text);
                showResult(data);
            }
        }catch(err){
            toast(err.message || 'Erro ao processar o e-mail', 'error');
        }finally{setLoading(false)}
    });
}

restartBtn && restartBtn.addEventListener('click', function(e){
    e.preventDefault();
    if (result) { result.classList.remove('show'); setTimeout(()=>result.classList.add('hidden'), 320); }
    respostaEl.innerText = '';
    badge.innerText = '';
    try { emailTextArea.readOnly = false; } catch(e){}
    emailTextArea.value = '';
    if (fileEl) { fileEl.value = ''; fileEl.disabled = false; }
    if (fileInfo) fileInfo.innerText = 'Nenhum arquivo';
    if (btnText) { btnText.disabled = false; btnText.classList.add('active'); }
    if (btnFile) btnFile.disabled = false;
    showTextMode();
    if (submitBtn) submitBtn.classList.remove('hidden');
    if (restartBtn) restartBtn.classList.add('hidden');
    if (filePreview) filePreview.classList.add('hidden');
    emailTextArea.focus();
    updateSubmitState();
});
