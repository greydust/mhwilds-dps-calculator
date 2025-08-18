from typing import Dict

from part import Part
from name import Name


class Monster:
  def __init__(self, name: str):
    self.name: Name = Name(name)
    self.parts: Dict[str, Part] = {}

  def set_name(self, lang: str, name: str):
    self.name.set_name(lang, name)

  def rename_states(self):
    match self.name.name['en']:
      case "Ajarakan":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Heated')
              state.set_name('zh', '高溫狀態')
              part['Heated'] = state
              del part.states['State_1']
      case "Arkveld" | "Guardian Arkveld":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Powered')
              state.set_name('zh', '充能狀態')
              part['Powered'] = state
              del part.states['State_1']
      case "Chatacabra":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Covered')
              state.set_name('zh', '覆蓋狀態')
              part['Covered'] = state
              del part.states['State_1']
            elif state_name == 'State_2':
              del part.states['State_2']
            elif state_name == 'State_3':
              del part.states['State_3']
      case "Gore Magala":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Frenzy')
              state.set_name('zh', '發狂狀態')
              part['Frenzy'] = state
              del part.states['State_1']
      case "Guardian Fulgur Anjanath":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Charged')
              state.set_name('zh', '帶電狀態')
              part['Charged'] = state
              del part.states['State_1']
            elif state_name == 'State_2':
              del part.states['State_2']
      case "Mizutsune":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Angered')
              state.set_name('zh', '發怒狀態')
              part['Angered'] = state
              del part.states['State_1']
      case "Nu Udra":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Oil-covered')
              state.set_name('zh', '油脂包覆狀態')
              part['Oil-covered'] = state
              del part.states['State_1']
            elif state_name == 'State_2':
              state.set_name('en', 'Inflamed')
              state.set_name('zh', '燃燒狀態')
              part['Inflamed'] = state
              del part.states['State_2']
      case "Rompopolo":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Withered')
              state.set_name('zh', '萎縮狀態')
              part['Withered'] = state
              del part.states['State_1']
      case "Zoh Shia":
        for _, part in self.parts.items():
          for state_name, state in part.states.items():
            if state_name == 'State_1':
              state.set_name('en', 'Fallen')
              state.set_name('zh', '擊倒後')
              part['Fallen'] = state
              del part.states['State_1']

  def to_dict(self):
    return {
      "name": self.name.name,
      "parts": {part_name: part.to_dict() for part_name, part in self.parts.items()}
    }
