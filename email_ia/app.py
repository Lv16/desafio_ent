from flask import Flask, render_template, request, jsonify
from servicos.classificador import classificar_email
from servicos.responder import generate_response

from pypdf import PdfReader
from io import BytesIO


app = Flask(__name__)


def _extract_text_from_pdf(file_stream):
    try:
        reader = PdfReader(file_stream)
        texts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                texts.append(t)
        return "\n".join(texts)
    except Exception:
        return ""


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/processar', methods=['POST'])
def processar_email():
    # Accept either JSON (text) or multipart/form-data with a file
    email_text = ''

    # File upload handling
    if 'email_file' in request.files:
        f = request.files.get('email_file')
        if f and f.filename:
            filename = f.filename.lower()
            if filename.endswith('.txt'):
                try:
                    raw = f.read()
                    email_text = raw.decode('utf-8', errors='ignore')
                except Exception:
                    email_text = ''
            elif filename.endswith('.pdf'):
                # Rewind file stream for pypdf
                try:
                    stream = BytesIO(f.read())
                    email_text = _extract_text_from_pdf(stream)
                except Exception:
                    email_text = ''

    # Fallback to JSON body with `email_text`
    if not email_text:
        data = None
        try:
            data = request.get_json(silent=True)
        except Exception:
            data = None
        if data:
            email_text = data.get('email_text', '')

    categoria = classificar_email(email_text)
    resposta = generate_response(categoria)
    return jsonify({
        'categoria': categoria,
        'resposta': resposta
    })


if __name__ == '__main__':
    app.run(debug=True)