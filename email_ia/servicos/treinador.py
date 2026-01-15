import os
import csv
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


def _data_path():
    return os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'data', 'training_examples.csv'))


def load_data():
    path = _data_path()
    texts, labels = [], []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            texts.append(row['text'])
            labels.append(row['label'])
    return texts, labels


def train(save=True):
    X, y = load_data()
    vect = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    Xv = vect.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        Xv, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = LogisticRegression(max_iter=1000)
    clf.fit(X_train, y_train)

    preds = clf.predict(X_test)
    print(classification_report(y_test, preds))
    print('Accuracy:', accuracy_score(y_test, preds))

    if save:
        model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
        vec_path = os.path.join(os.path.dirname(__file__), 'vectorizer.joblib')
        joblib.dump(clf, model_path)
        joblib.dump(vect, vec_path)
        print('Saved model to', model_path)

    return clf, vect


if __name__ == '__main__':
    train()
