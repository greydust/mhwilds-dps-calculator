from typing import Dict

from name import Name
from state import State


class Part:
  def __init__(self, part_name: str):
    self.name: Name = Name(part_name)
    self.states: Dict[str, State] = {}

  def set_name(self, lang: str, name: str):
    self.name.set_name(lang, name)

  def to_dict(self):
    return {
      "name": self.name.name,
      "states": {state_name: state.to_dict() for state_name, state in self.states.items()}
    }
