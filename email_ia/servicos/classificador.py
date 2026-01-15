import os
try:
    import joblib
except Exception:
    joblib = None

LABELS = ['Produtivo', 'Improdutivo']

# Try to load a trained scikit-learn model (created by servicos/treinador.py)
_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.joblib')
_VEC_PATH = os.path.join(os.path.dirname(__file__), 'vectorizer.joblib')

_clf = None
_vect = None
try:
    if os.path.exists(_MODEL_PATH) and os.path.exists(_VEC_PATH):
        _clf = joblib.load(_MODEL_PATH)
        _vect = joblib.load(_VEC_PATH)
except Exception:
    _clf = None
    _vect = None


def _heuristic(texto):
    t = (texto or '').lower()
    productive_keywords = (
        'solicit', 'precis', 'urgent', 'urgente', 'requer', 'acao', 'ajuda', 'ajudar',
        'erro', 'problema', 'falha', 'suport', 'ticket', 'incidente', 'atualiz', 'inform',
        'alter', 'favor', 'pode', 'poderia', 'gostaria', 'solicito', 'detalh', 'quando', 'como'
    )
    # Expanded keywords for gratitude/congratulations (common stems, accent-insensitive)
    thanks_keywords = (
        'obrig', 'obrigado', 'obrigada', 'grato', 'grata',
        'parab', 'parabéns', 'felicit', 'felicita', 'felicitações', 'felicidades', 'congrat', 'boa sorte'
    )

    # If message clearly contains felicitations or thanks, mark as Improdutivo (priority)
    if any(w in t for w in thanks_keywords):
        return 'Improdutivo'

    # Question mark or explicit request words indicate Produtivo
    if '?' in t:
        return 'Produtivo'
    if any(w in t for w in productive_keywords):
        return 'Produtivo'

    return 'Produtivo'


def _is_congratulatory(texto):
    t = (texto or '').lower()
    congrats_phrases = (
        'parab', 'parabéns', 'felicit', 'felicita', 'felicitações', 'felicidades',
        'muito bom', 'ótimo trabalho', 'ótimo', 'excelente', 'boa sorte', 'sucesso', 'valeu'
    )
    return any(phrase in t for phrase in congrats_phrases)


def classificar_email(texto):
    if not texto:
        return 'Improdutivo'

    # Prioritize explicit congratulatory/thank-you phrases before model inference
    try:
        if _is_congratulatory(texto):
            return 'Improdutivo'
    except Exception:
        pass

    try:
        if _clf is not None and _vect is not None:
            Xv = _vect.transform([texto])
            pred = _clf.predict(Xv)[0]
            return pred
    except Exception:
        pass

    try:
        from transformers import pipeline

        classificador = pipeline('zero-shot-classification', model='facebook/bart-large-mnli')
        THRESHOLD = 0.6
        resultado = classificador(texto, LABELS)
        top_label = resultado['labels'][0]
        top_score = resultado['scores'][0]
        if top_score >= THRESHOLD:
            return top_label
    except Exception:
        pass

    return _heuristic(texto)