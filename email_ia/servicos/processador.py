import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer

nltk.download('stopwords', quiet=True)
nltk.download('rslp', quiet=True)


def preprocess_text(text):
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"[^a-zà-ú\s]", "", text)
    stop_words = set(stopwords.words('portuguese'))
    stemmer = RSLPStemmer()
    tokens = text.split()

    processed = [
        stemmer.stem(word)
        for word in tokens
        if word not in stop_words
    ]

    return " ".join(processed)