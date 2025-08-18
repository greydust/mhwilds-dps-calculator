from hitzone_value import HitzoneValue
from name import Name

RENAME_STATE = {
    'Breakable': 'Broken',
    '可破壞': '已破壞',
}

class State:
  name: Name
  hitzone_value: HitzoneValue

  def __init__(self, lang: str, name: str):
    self.name = Name(name)
    self.name.set_name(lang, name)
    self.hitzone_value = HitzoneValue(0, 0, 0, 0, 0, 0, 0, 0)

  def set_name(self, lang: str, name: str):
    if name in RENAME_STATE:
      name = RENAME_STATE[name]
    self.name.set_name(lang, name)

  def to_dict(self):
    return {
      "name": self.name.name,
      "hitzone_value": self.hitzone_value.to_dict()
    }
