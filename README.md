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
# E-mail IA

Aplicação web em Flask para classificação de mensagens de e-mail e sugestão automática de respostas. O projeto foi desenvolvido com foco em clareza de implementação, facilidade de uso local e extensibilidade para experimen-tação com modelos de NLP.

**Resumo**
- Classifica mensagens como **Produtivo** ou **Improdutivo** e fornece uma resposta em português.
- Permite colar texto ou fazer upload de `.txt`/`.pdf` (pré-visualização no cliente e extração de texto no servidor).
- Mantém histórico e métricas simples no navegador (armazenamento local), sem persistência server-side por padrão.

**Recursos principais**
- Classificação com priorização de sinais explícitos (agradecimento/felicitação).
- Suporte a modelo scikit-learn salvo em disco (`servicos/model.joblib` e `servicos/vectorizer.joblib`).
- Fallback para heurística de palavras-chave e tentativa de zero-shot via HuggingFace quando disponível.

**Requisitos**
- Python 3.10+ (recomendado).
- Dependências básicas em `requirements.txt`. Para ambiente completo com Transformers, usar `requirements-current.txt`.

Instalação (Windows PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Observação: instalar `transformers` e `torch` é opcional e consome recursos adicionais.

**Execução**
1. Ativar a virtualenv.
2. (Opcional) Treinar o classificador com os exemplos em `data/training_examples.csv`:

```powershell
python -m servicos.treinador
```

Isso gera `servicos/model.joblib` e `servicos/vectorizer.joblib` quando o treinamento é executado com `save=True`.

3. Iniciar a aplicação:

```powershell
python app.py
```

4. Abrir no navegador: `http://127.0.0.1:5000/`

**Visão técnica (fluxo resumido)**
- O endpoint `/processar` em `app.py` aceita JSON (`email_text`) ou multipart/form-data (`email_file`).
- `servicos/classificador.py` aplica lógica em camadas: detecção de frases de agradecimento/felicitação → inferência com modelo salva-do (se presente) → tentativa de zero-shot (se bibliotecas instaladas) → heurística de palavras-chave.
- `servicos/treinador.py` treina um `LogisticRegression` com `TfidfVectorizer` usando o CSV em `data/`.
- A experiência do usuário é implementada em `templates/index.html` e `static/js/scripts.js` (PDF preview, histórico, métricas locais, tema, toasts).

**Estrutura (principais arquivos)**
- `app.py` — servidor Flask e endpoints.
- `servicos/classificador.py` — lógica de classificação.
- `servicos/treinador.py` — rotina de treino e serialização do modelo.
- `servicos/processador.py` — pré-processamento de texto (NLTK).
- `servicos/responder.py` — geração de texto de resposta por categoria.
- `data/training_examples.csv` — exemplos de treino (colunas: `text`, `label`).
- `templates/index.html`, `static/js/scripts.js`, `static/css/style.css` — front-end.

**Boas práticas e recomendações**
- Pré-baixar recursos do NLTK (`stopwords`, `rslp`) em ambientes off-line.
- Incluir testes unitários para `classificador.py` e para o pipeline de treino/serialização.
- Proteger endpoints e não expor a aplicação sem autenticação em ambientes de produção.

**Melhorias sugeridas (prioridade alta)**
- Adicionar testes automatizados e pipeline de CI.
- Implementar persistência server-side opcional para histórico e métricas (API segura).
- Aumentar o conjunto de treino e avaliar novos vetorizadores/modelos para melhorar acurácia.

---
Arquivo principal: [app.py](app.py)


