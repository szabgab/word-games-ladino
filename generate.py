#!/usr/bin/env python
import json
import sys
import os
import yaml
import re

sys.path.append('../word-games-code/')
from tidy_json import tidy

def load_words(filename):
    with open(filename) as fh:
        skill = yaml.load(fh, Loader=yaml.Loader)
    words = []
    for pair in skill['Two-way-dictionary']:
        word = list(pair.values())[0]
        word = re.sub(r' *\([^)]*\) *', '', word)
        words.append(word)
    return sorted(set(words))

def main():
    categories = {}
    lili_path = '../../LibreLingo/LibreLingo-Judeo-Spanish-from-English/'
    with open(os.path.join(lili_path, 'course', 'verbs', 'module.yaml')) as fh:
        verbs_module = yaml.load(fh, Loader=yaml.Loader)
    categories['verbos'] = [filename[0:-5] for filename in verbs_module['Skills']]
    skills = {
        'ropa':             'clothes.yaml',
        'partes de kuerpo': 'body.yaml',
        'kolores':          'colors.yaml',
        'animales':         'animals.yaml',
        'espor':            'sport.yaml',
        'transportasyon':   'transportation.yaml',
        'vedrura':          'vegetables.yaml',
        'fruta':            'frutas.yaml',
        'komida':           'food.yaml',
        'bebida':           'drinks.yaml',
        'naturaleza':       'nature.yaml',
        'kozina':           'kitchen.yaml',
    }
    for cat, filename in skills.items():
        categories[cat]= load_words(os.path.join(lili_path, 'course', 'words', 'skills', filename))

    cat_file = 'categories.json'
    with open(cat_file, 'w') as fh:
        json.dump(categories, fh)
    tidy(cat_file)

if __name__ == '__main__':
    main()

