from collections import defaultdict


class Name:
  def __init__(self, name: str):
    self.name = defaultdict(str, '')
    self.name['en'] = name

  def set_name(self, lang: str, name: str):
    self.name[lang] = name
