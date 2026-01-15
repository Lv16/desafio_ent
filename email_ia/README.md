# E-mail IA

Projeto simples em Flask para classificar e-mails como `Produtivo` ou `Improdutivo` e gerar uma resposta sugerida.

**Propósito:** ferramenta local/leve para analisar textos (ou .txt/.pdf) e oferecer uma resposta automática e estatísticas simples armazenadas no navegador.

**Status:** código fornecido pronto para execução em ambiente Python; modelo treinado opcionalmente gerado por `servicos/treinador.py`.

**Principais funcionalidades**
- Classificação de texto via modelo scikit-learn (se presente), fallback com heurística e tentativa opcional de zero-shot com HuggingFace.
- Upload/colagem de e-mails (.txt / .pdf) com extração de texto (pypdf no servidor; pdf.js no cliente).
- Geração de resposta automática baseada na categoria.
- Histórico e analytics simples salvos no `localStorage` do navegador.

**Requisitos mínimos**
- Python 3.10+ recomendado
- Dependências listadas em [requirements.txt](requirements.txt) (versão mínima) ou [requirements-current.txt](requirements-current.txt) para ambiente reproduzível.

Instale numa venv e instale dependências:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
```

Observação: se quiser usar a versão completa com Transformers/torch (zero-shot), instale as dependências de [requirements-current.txt], mas isso exige mais recursos.

**Como executar**
1. Ative a venv.
2. (Opcional) Treine o modelo com exemplos em `data/training_examples.csv` executando:
   ```bash
   python -m servicos.treinador
   ```
   Isso criará `servicos/model.joblib` e `servicos/vectorizer.joblib`.
3. Execute a aplicação:
   ```bash
   python app.py
   ```
4. Abra `http://127.0.0.1:5000/` no navegador.

**Estrutura do projeto**
- `app.py` : aplicação Flask, rota principal `/` e endpoint POST `/processar` que aceita JSON com `email_text` ou multipart com `email_file` (.txt/.pdf). Usa `servicos.classificador.classificar_email` e `servicos.responder.generate_response`.
- `servicos/classificador.py` : lógica de classificação. Tenta, nesta ordem: regras de frase de felicitação/agradecimento, modelo scikit-learn carregado de `servicos/model.joblib` + `vectorizer.joblib`, pipeline zero-shot do HuggingFace (se disponível), e por fim heurística simples.
- `servicos/processador.py` : pré-processamento de texto (nltk: stopwords, RSLP stemmer). Utilizado para treinar modelo; não é chamado diretamente pelo servidor.
- `servicos/treinador.py` : script para treinar um `LogisticRegression` com `TfidfVectorizer` usando `data/training_examples.csv`.
- `servicos/responder.py` : mapeia `Produtivo`/`Improdutivo` para uma resposta em português.
- `servicos/model.joblib`, `servicos/vectorizer.joblib` : modelos serializados (opcionais, já presentes no repositório se incluídos).
- `templates/index.html` : interface web, usa `static/js/scripts.js` e `static/css/style.css`.
- `static/js/scripts.js` : lógica do cliente (envio, extração de PDF com pdf.js, histórico, analytics locais, toasts, tema).
- `static/css/style.css` : estilos do app.

**Treinar o modelo**
- Edite/veja `data/training_examples.csv` (colunas `text` e `label`).
- Execute `python -m servicos.treinador` para treinar e salvar `model.joblib` e `vectorizer.joblib` em `servicos/`.

**Observações de desenvolvimento**
- O classificador tenta carregar arquivos joblib locais; se não existirem, a heurística e/ou Transformers são usados.
- O uso de Transformers (`transformers` + `torch`) é opcional e só é tentado se estiver instalado; se usar, considere restrições de memória/CPU.
- `servicos/processador.preprocess_text` baixa `nltk` (stopwords, rslp) em runtime; para ambientes offline, pré-baixe os recursos.
- A aplicação se baseia em armazenamento local do navegador para histórico e analytics (não há persistência no servidor).

**Segurança & limites**
- Uploads aceitam apenas `.txt` e `.pdf`. PDFs são processados com `pypdf` no servidor e com `pdf.js` no cliente para pré-visualização.
- Este projeto não implementa autenticação; não exponha a instância em produção sem camadas adicionais de segurança.

**Próximos passos sugeridos**
- Adicionar testes automatizados para `classificador` e `treinador`.
- Adicionar uma pequena API para baixar histórico/analytics do navegador para servidor opcional.
- Melhorar mensagens e internacionalização (i18n) se necessário.

---
Arquivo principal: [app.py](app.py)

Se quiser, eu posso:
- Executar a aplicação localmente aqui e verificar o comportamento.
- Gerar um `requirements.txt` completo a partir de `requirements-current.txt`.

README gerado automaticamente pelo assistente.
