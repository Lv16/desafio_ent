const emailTextArea = document.getElementById("email_text");
const respostaEl = document.getElementById("resposta");

const btnText = document.getElementById("btnText");
const btnFile = document.getElementById("btnFile");
const textInput = document.getElementById("textInput");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
let _resultHideTimeout = null;
const badge = document.getElementById("badge");
const copyBtn = document.getElementById("copyBtn");
const fileEl = document.getElementById("email_file");
const fileInfo = document.getElementById("fileInfo");
const restartBtn = document.getElementById("restartBtn");

function showTextMode() {
    btnText.classList.add("active");
    btnFile.classList.remove("active");
    textInput.classList.remove("hidden");
    fileInput.classList.add("hidden");
}

function showFileMode() {
    btnFile.classList.add("active");
    btnText.classList.remove("active");
    fileInput.classList.remove("hidden");
    textInput.classList.add("hidden");
}

btnText.addEventListener("click", showTextMode);
btnFile.addEventListener("click", showFileMode);

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
        submitBtn.disabled = false;
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
        setTimeout(() => {
            copyBtn.innerText = "Copiar resposta";
        }, 1500);
    });
});

showTextMode();

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

fileEl && fileEl.addEventListener('change', async function (e) {
    const f = e.target.files && e.target.files[0];
    if (!f) {
        fileInfo.innerText = 'Nenhum arquivo';
        return;
    }
    fileInfo.innerText = f.name;
    try {
        setLoading(true);
        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'txt') {
            const text = await f.text();
            emailTextArea.value = text.trim();
            showTextMode();
        } else if (ext === 'pdf') {
            const text = await extractTextFromPDF(f);
            emailTextArea.value = text;
            showTextMode();
        } else {
            alert('Formato de arquivo não suportado');
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao ler o arquivo: ' + (err.message || err));
    } finally {
        setLoading(false);
    }
});

function showResult(data){
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
            alert(err.message || 'Erro ao processar o e-mail');
        } finally { setLoading(false); }
    });
}

submitBtn && submitBtn.addEventListener('click', async function(e){
    e.preventDefault();
    setLoading(true);
    try{
        if (!fileInput.classList.contains('hidden') && fileEl && fileEl.files && fileEl.files[0]) {
            const data = await processFile(fileEl.files[0]);
            showResult(data);
        } else {
            const text = emailTextArea.value.trim();
            if (!text) throw new Error('Texto vazio');
            const data = await processText(text);
            showResult(data);
        }
    }catch(err){
        alert(err.message || 'Erro ao processar o e-mail');
    }finally{setLoading(false)}
});

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
    emailTextArea.focus();
});
