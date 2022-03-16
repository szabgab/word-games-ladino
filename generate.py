#!/usr/bin/env python
import json
import sys
import os
import yaml

sys.path.append('../word-games-code/')
from tidy_json import tidy

def load_words(filename):
    with open(filename) as fh:
        skill = yaml.load(fh, Loader=yaml.Loader)
    words = [list(pair.values())[0] for pair in skill['Two-way-dictionary']]
    return words

def main():
    categories = {}
    lili_path = '../../LibreLingo/LibreLingo-Judeo-Spanish-from-English/'
    with open(os.path.join(lili_path, 'course', 'verbs', 'module.yaml')) as fh:
        verbs_module = yaml.load(fh, Loader=yaml.Loader)
    categories['verbos'] = [filename[0:-5] for filename in verbs_module['Skills']]
    categories['ropa']= load_words(os.path.join(lili_path, 'course', 'words', 'skills', 'clothes.yaml'))
    categories['partes de kuerpo']  = load_words(os.path.join(lili_path, 'course', 'words', 'skills', 'body.yaml'))
    categories['kolores']  = load_words(os.path.join(lili_path, 'course', 'words', 'skills', 'colors.yaml'))
    categories['animales'] = load_words(os.path.join(lili_path, 'course', 'words', 'skills', 'animals.yaml'))

    cat_file = 'categories.json'
    with open(cat_file, 'w') as fh:
        json.dump(categories, fh)
    tidy(cat_file)

if __name__ == '__main__':
    main()

