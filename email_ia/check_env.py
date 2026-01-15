import importlib
import sys

def check_module(name):
    try:
        importlib.import_module(name)
        print(f"{name}: OK")
    except Exception as e:
        print(f"{name}: ERROR: {type(e).__name__}: {e}")

def main():
    print("Running environment checks...\n")
    modules = ['flask', 'pypdf', 'joblib', 'sklearn', 'transformers', 'torch']
    for m in modules:
        check_module(m)

    print('\nChecking classificador model load:')
    try:
        from servicos import classificador
        clf = getattr(classificador, '_clf', None)
        vect = getattr(classificador, '_vect', None)
        print(f"_clf loaded: {bool(clf)}")
        print(f"_vect loaded: {bool(vect)}")
    except Exception as e:
        print(f"classificador import ERROR: {type(e).__name__}: {e}")

    print('\nDone.')

if __name__ == '__main__':
    main()
