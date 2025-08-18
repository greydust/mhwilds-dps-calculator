import json

from bs4 import BeautifulSoup
from requests import get
from monster import Monster
from part import Part
from state import State
from hitzone_value import HitzoneValue


KIRANICO_URL = 'https://mhwilds.kiranico.com'
MONSTERS_EN_URL = KIRANICO_URL + '/data/monsters/'
MONSTERS_ZH_URL = KIRANICO_URL + '/zh-Hant/data/monsters/'
LAST_LARGE_MONSTER = 'Zoh Shia'
NORMAL_STATE = {
  "en": "Normal",
  "zh": "普通狀態",
}


def get_monster_links(url: str) -> list[str]:
  data = get(url).content
  soup = BeautifulSoup(data, "html.parser")
  monster_table = soup.find("table").find_all("tr")
  monster_links = [row.find("a")["href"] for row in monster_table]

  return monster_links

def get_monster_data(url: str, lang: str, monster: Monster, part_lookup: list[dict[str, any]]) -> tuple[Monster, list[dict[str, any]]]:
  data: bytes = get(url).content
  soup: BeautifulSoup = BeautifulSoup(data, "html.parser")
  populate_hitzone_value: bool = True

  monster_name = soup.find("h2").text
  if monster is None:
    monster = Monster(monster_name)
  else:
    monster.set_name(lang, monster_name)
    populate_hitzone_value = False
  if part_lookup is None:
    part_lookup: list[dict[str, any]] = []

  tables = soup.find_all("table")
  hitzones_value_table = tables[1]
  parts = hitzones_value_table.find_all("tr")[1:]

  num_part = -1
  num_state = 0
  part: Part = None
  for p in parts:
    part_data = p.find_all("td")
    part_name = part_data[0].text
    if part_name == '':
      continue

    state_name = part_data[1].text
    if state_name == "":
      num_part += 1
      num_state = 0
      state_name = NORMAL_STATE[lang]
      if populate_hitzone_value:
        part = Part(part_name)
        monster.parts[part_name] = part
        part_lookup.append({'part_name': part_name, 'states': []})
      else:
        monster.parts[part_lookup[num_part]['part_name']].set_name(lang, part_name)
    else:
      num_state += 1

    print(f"  Processing {monster_name} - {part_name} - {state_name}")

    if populate_hitzone_value:
      state = State(lang, state_name)
      state.hitzone_value = HitzoneValue(*list(map(lambda x: x.text, part_data[2:10])))
      part.states[state_name] = state

      part_lookup[num_part]['states'].append(state_name)
    else:
      monster.parts[part_lookup[num_part]['part_name']].states[part_lookup[num_part]['states'][num_state]].set_name(lang, state_name)

  return monster, part_lookup

def get_zoh_shia_data(url: str, lang: str, monster: Monster, part_lookup: list[dict[str, any]]) -> tuple[Monster, list[dict[str, any]]]:
  data: bytes = get(url).content
  soup: BeautifulSoup = BeautifulSoup(data, 'html.parser')
  populate_hitzone_value: bool = True

  monster_name = soup.find('h2').text
  if monster is None:
    monster = Monster(monster_name)
  else:
    monster.set_name(lang, monster_name)
    populate_hitzone_value = False
  if part_lookup is None:
    part_lookup: list[dict[str, any]] = []

  tables = soup.find_all('table')
  hitzones_value_table = tables[1]
  parts = hitzones_value_table.find_all('tr')[1:]

  parts_data: list = []
  for p in parts:
    part_data = p.find_all('td')
    part_name = part_data[0].text
    if part_name == '':
      continue
    parts_data.append([
      part_name,
      part_data[1].text,
      HitzoneValue(*list(map(lambda x: x.text, part_data[2:10]))),
    ])

  # Head
  head = None
  if lang == 'en':
    head = Part(parts_data[3][0])
    monster.parts[parts_data[3][0]] = head
    part_lookup.append({'part_name': parts_data[3][0], 'states': []})
  else:
    head = monster.parts[part_lookup[0]['part_name']]
    head.set_name(lang, parts_data[3][0])

  # Head (Normal)
  if lang == 'en':
    head.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    head.states[NORMAL_STATE['en']].hitzone_value = parts_data[3][2]
    part_lookup[0]['states'].append(NORMAL_STATE['en'])
  else:
    head.states[part_lookup[0]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Head (Wounds)
  if lang == 'en':
    head.states[parts_data[4][1]] = State('en', parts_data[4][1])
    head.states[parts_data[4][1]].hitzone_value = parts_data[3][2]
    part_lookup[0]['states'].append(parts_data[4][1])
  else:
    head.states[part_lookup[0]['states'][1]].set_name(lang, parts_data[4][1])

  # Head (Crystallized)
  if lang == 'en':
    head.states['Crystallized'] = State('en', 'Crystallized')
    head.states['Crystallized'].hitzone_value = parts_data[0][2]
    part_lookup[0]['states'].append('Crystallized')
  else:
    head.states[part_lookup[0]['states'][2]].set_name(lang, '白纏晶')

  # Head (Darkened)
  if lang == 'en':
    head.states['Darkened'] = State('en', 'Darkened')
    head.states['Darkened'].hitzone_value = parts_data[11][2]
    part_lookup[0]['states'].append('Darkened')
  else:
    head.states[part_lookup[0]['states'][3]].set_name(lang, '黑化狀態')

  # Head (Darkened Wounds)
  if lang == 'en':
    head.states['Darkened Wounds'] = State('en', 'Darkened Wounds')
    head.states['Darkened Wounds'].hitzone_value = parts_data[12][2]
    part_lookup[0]['states'].append('Darkened Wounds')
  else:
    head.states[part_lookup[0]['states'][4]].set_name(lang, '黑化狀態傷口')

  # Left Wingarm
  left_wingarm = None
  if lang == 'en':
    left_wingarm = Part(parts_data[5][0])
    monster.parts[parts_data[5][0]] = left_wingarm
    part_lookup.append({'part_name': parts_data[5][0], 'states': []})
  else:
    left_wingarm = monster.parts[part_lookup[1]['part_name']]
    left_wingarm.set_name(lang, parts_data[5][0])

  # Left Wingarm (Normal)
  if lang == 'en':
    left_wingarm.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    left_wingarm.states[NORMAL_STATE['en']].hitzone_value = parts_data[5][2]
    part_lookup[1]['states'].append(NORMAL_STATE['en'])
  else:
    left_wingarm.states[part_lookup[1]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Left Wingarm (Fallen)
  if lang == 'en':
    left_wingarm.states['Fallen'] = State('en', 'Fallen')
    left_wingarm.states['Fallen'].hitzone_value = parts_data[6][2]
    part_lookup[1]['states'].append('Fallen')
  else:
    left_wingarm.states[part_lookup[1]['states'][1]].set_name(lang, '擊倒後')

  # Left Wingarm (Wounds)
  if lang == 'en':
    left_wingarm.states[parts_data[7][1]] = State('en', parts_data[7][1])
    left_wingarm.states[parts_data[7][1]].hitzone_value = parts_data[7][2]
    part_lookup[1]['states'].append(parts_data[7][1])
  else:
    left_wingarm.states[part_lookup[1]['states'][2]].set_name(lang, parts_data[7][1])

  # Left Wingarm (Crystallized)
  if lang == 'en':
    left_wingarm.states['Crystallized'] = State('en', 'Crystallized')
    left_wingarm.states['Crystallized'].hitzone_value = parts_data[1][2]
    part_lookup[1]['states'].append('Crystallized')
  else:
    left_wingarm.states[part_lookup[1]['states'][3]].set_name(lang, '白纏晶')

  # Left Wingarm (Crystal Removed)
  if lang == 'en':
    left_wingarm.states['Crystal Removed'] = State('en', 'Crystal Removed')
    left_wingarm.states['Crystal Removed'].hitzone_value = parts_data[13][2]
    part_lookup[1]['states'].append('Crystal Removed')
  else:
    left_wingarm.states[part_lookup[1]['states'][4]].set_name(lang, '結晶移除')

  # Left Wingarm (Crystal Removed Fallen)
  if lang == 'en':
    left_wingarm.states['Crystal Removed Fallen'] = State('en', 'Crystal Removed Fallen')
    left_wingarm.states['Crystal Removed Fallen'].hitzone_value = parts_data[14][2]
    part_lookup[1]['states'].append('Crystal Removed Fallen')
  else:
    left_wingarm.states[part_lookup[1]['states'][5]].set_name(lang, '結晶移除擊倒後')

  # Left Wingarm (Crystal Removed Wounds)
  if lang == 'en':
    left_wingarm.states['Crystal Removed Wounds'] = State('en', 'Crystal Removed Wounds')
    left_wingarm.states['Crystal Removed Wounds'].hitzone_value = parts_data[15][2]
    part_lookup[1]['states'].append('Crystal Removed Wounds')
  else:
    left_wingarm.states[part_lookup[1]['states'][6]].set_name(lang, '結晶移除傷口')

  # Left Wingarm (Crystal Removed Weak Point)
  if lang == 'en':
    left_wingarm.states['Crystal Removed Weak Point'] = State('en', parts_data[16][1])
    left_wingarm.states['Crystal Removed Weak Point'].hitzone_value = parts_data[16][2]
    part_lookup[1]['states'].append('Crystal Removed Weak Point')
  else:
    left_wingarm.states[part_lookup[1]['states'][7]].set_name(lang, '結晶移除弱點')

  # Right Wingarm
  right_wingarm = None
  if lang == 'en':
    right_wingarm = Part(parts_data[8][0])
    monster.parts[parts_data[8][0]] = right_wingarm
    part_lookup.append({'part_name': parts_data[8][0], 'states': []})
  else:
    right_wingarm = monster.parts[part_lookup[2]['part_name']]
    right_wingarm.set_name(lang, parts_data[8][0])

  # Right Wingarm (Normal)
  if lang == 'en':
    right_wingarm.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    right_wingarm.states[NORMAL_STATE['en']].hitzone_value = parts_data[8][2]
    part_lookup[2]['states'].append(NORMAL_STATE['en'])
  else:
    right_wingarm.states[part_lookup[2]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Right Wingarm (Fallen)
  if lang == 'en':
    right_wingarm.states['Fallen'] = State('en', 'Fallen')
    right_wingarm.states['Fallen'].hitzone_value = parts_data[9][2]
    part_lookup[2]['states'].append('Fallen')
  else:
    right_wingarm.states[part_lookup[2]['states'][1]].set_name(lang, '擊倒後')

  # Right Wingarm (Wounds)
  if lang == 'en':
    right_wingarm.states[parts_data[10][1]] = State('en', parts_data[10][1])
    right_wingarm.states[parts_data[10][1]].hitzone_value = parts_data[10][2]
    part_lookup[2]['states'].append(parts_data[10][1])
  else:
    right_wingarm.states[part_lookup[2]['states'][2]].set_name(lang, parts_data[10][1])

  # Right Wingarm (Crystallized)
  if lang == 'en':
    right_wingarm.states['Crystallized'] = State('en', 'Crystallized')
    right_wingarm.states['Crystallized'].hitzone_value = parts_data[2][2]
    part_lookup[2]['states'].append('Crystallized')
  else:
    right_wingarm.states[part_lookup[2]['states'][3]].set_name(lang, '結晶化')

  # Right Wingarm (Crystal Removed)
  if lang == 'en':
    right_wingarm.states['Crystal Removed'] = State('en', 'Crystal Removed')
    right_wingarm.states['Crystal Removed'].hitzone_value = parts_data[17][2]
    part_lookup[2]['states'].append('Crystal Removed')
  else:
    right_wingarm.states[part_lookup[2]['states'][4]].set_name(lang, '結晶移除')

  # Right Wingarm (Crystal Removed Fallen)
  if lang == 'en':
    right_wingarm.states['Crystal Removed Fallen'] = State('en', 'Crystal Removed Fallen')
    right_wingarm.states['Crystal Removed Fallen'].hitzone_value = parts_data[18][2]
    part_lookup[2]['states'].append('Crystal Removed Fallen')
  else:
    right_wingarm.states[part_lookup[2]['states'][5]].set_name(lang, '結晶移除擊倒後')

  # Right Wingarm (Crystal Removed Wounds)
  if lang == 'en':
    right_wingarm.states['Crystal Removed Wounds'] = State('en', 'Crystal Removed Wounds')
    right_wingarm.states['Crystal Removed Wounds'].hitzone_value = parts_data[19][2]
    part_lookup[2]['states'].append('Crystal Removed Wounds')
  else:
    right_wingarm.states[part_lookup[2]['states'][6]].set_name(lang, '結晶移除傷口')

  # Right Wingarm (Crystal Removed Weak Point)
  if lang == 'en':
    right_wingarm.states['Crystal Removed Weak Point'] = State('en', parts_data[20][1])
    right_wingarm.states['Crystal Removed Weak Point'].hitzone_value = parts_data[20][2]
    part_lookup[2]['states'].append('Crystal Removed Weak Point')
  else:
    right_wingarm.states[part_lookup[2]['states'][7]].set_name(lang, '結晶移除弱點')

  # Left Foreleg
  left_foreleg = None
  if lang == 'en':
    left_foreleg = Part(parts_data[21][0])
    monster.parts[parts_data[21][0]] = left_foreleg
    part_lookup.append({'part_name': parts_data[21][0], 'states': []})
  else:
    left_foreleg = monster.parts[part_lookup[3]['part_name']]
    left_foreleg.set_name(lang, parts_data[21][0])

  # Left Foreleg (Normal)
  if lang == 'en':
    left_foreleg.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    left_foreleg.states[NORMAL_STATE['en']].hitzone_value = parts_data[21][2]
    part_lookup[3]['states'].append(NORMAL_STATE['en'])
  else:
    left_foreleg.states[part_lookup[3]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Left Foreleg (Fallen)
  if lang == 'en':
    left_foreleg.states['Fallen'] = State('en', 'Fallen')
    left_foreleg.states['Fallen'].hitzone_value = parts_data[22][2]
    part_lookup[3]['states'].append('Fallen')
  else:
    left_foreleg.states[part_lookup[3]['states'][1]].set_name(lang, '擊倒後')

  # Left Foreleg (Wounds)
  if lang == 'en':
    left_foreleg.states[parts_data[23][1]] = State('en', parts_data[23][1])
    left_foreleg.states[parts_data[23][1]].hitzone_value = parts_data[23][2]
    part_lookup[3]['states'].append(parts_data[23][1])
  else:
    left_foreleg.states[part_lookup[3]['states'][2]].set_name(lang, parts_data[23][1])

  # Right Foreleg
  right_foreleg = None
  if lang == 'en':
    right_foreleg = Part(parts_data[24][0])
    monster.parts[parts_data[24][0]] = right_foreleg
    part_lookup.append({'part_name': parts_data[24][0], 'states': []})
  else:
    right_foreleg = monster.parts[part_lookup[4]['part_name']]
    right_foreleg.set_name(lang, parts_data[24][0])

  # Right Foreleg (Normal)
  if lang == 'en':
    right_foreleg.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    right_foreleg.states[NORMAL_STATE['en']].hitzone_value = parts_data[24][2]
    part_lookup[4]['states'].append(NORMAL_STATE['en'])
  else:
    right_foreleg.states[part_lookup[4]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Right Foreleg (Fallen)
  if lang == 'en':
    right_foreleg.states['Fallen'] = State('en', 'Fallen')
    right_foreleg.states['Fallen'].hitzone_value = parts_data[25][2]
    part_lookup[4]['states'].append('Fallen')
  else:
    right_foreleg.states[part_lookup[4]['states'][1]].set_name(lang, '擊倒後')

  # Right Foreleg (Wounds)
  if lang == 'en':
    right_foreleg.states[parts_data[26][1]] = State('en', parts_data[26][1])
    right_foreleg.states[parts_data[26][1]].hitzone_value = parts_data[26][2]
    part_lookup[4]['states'].append(parts_data[26][1])
  else:
    right_foreleg.states[part_lookup[4]['states'][2]].set_name(lang, parts_data[26][1])

  # Neck
  neck = None
  if lang == 'en':
    neck = Part(parts_data[27][0])
    monster.parts[parts_data[27][0]] = neck
    part_lookup.append({'part_name': parts_data[27][0], 'states': []})
  else:
    neck = monster.parts[part_lookup[5]['part_name']]
    neck.set_name(lang, parts_data[27][0])

  # Neck (Normal)
  if lang == 'en':
    neck.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    neck.states[NORMAL_STATE['en']].hitzone_value = parts_data[27][2]
    part_lookup[5]['states'].append(NORMAL_STATE['en'])
  else:
    neck.states[part_lookup[5]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Neck (Fallen)
  if lang == 'en':
    neck.states['Fallen'] = State('en', 'Fallen')
    neck.states['Fallen'].hitzone_value = parts_data[28][2]
    part_lookup[5]['states'].append('Fallen')
  else:
    neck.states[part_lookup[5]['states'][1]].set_name(lang, '擊倒後')

  # Neck (Wounds)
  if lang == 'en':
    neck.states[parts_data[29][1]] = State('en', parts_data[29][1])
    neck.states[parts_data[29][1]].hitzone_value = parts_data[29][2]
    part_lookup[5]['states'].append(parts_data[29][1])
  else:
    neck.states[part_lookup[5]['states'][2]].set_name(lang, parts_data[29][1])

  # Torso
  torso = None
  if lang == 'en':
    torso = Part(parts_data[30][0])
    monster.parts[parts_data[30][0]] = torso
    part_lookup.append({'part_name': parts_data[30][0], 'states': []})
  else:
    torso = monster.parts[part_lookup[6]['part_name']]
    torso.set_name(lang, parts_data[30][0])

  # Torso (Normal)
  if lang == 'en':
    torso.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    torso.states[NORMAL_STATE['en']].hitzone_value = parts_data[30][2]
    part_lookup[6]['states'].append(NORMAL_STATE['en'])
  else:
    torso.states[part_lookup[6]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Torso (Fallen)
  if lang == 'en':
    torso.states['Fallen'] = State('en', 'Fallen')
    torso.states['Fallen'].hitzone_value = parts_data[31][2]
    part_lookup[6]['states'].append('Fallen')
  else:
    torso.states[part_lookup[6]['states'][1]].set_name(lang, '擊倒後')

  # Torso (Wounds)
  if lang == 'en':
    torso.states[parts_data[32][1]] = State('en', parts_data[32][1])
    torso.states[parts_data[32][1]].hitzone_value = parts_data[32][2]
    part_lookup[6]['states'].append(parts_data[32][1])
  else:
    torso.states[part_lookup[6]['states'][2]].set_name(lang, parts_data[32][1])

  # Tail
  tail = None
  if lang == 'en':
    tail = Part(parts_data[33][0])
    monster.parts[parts_data[33][0]] = tail
    part_lookup.append({'part_name': parts_data[33][0], 'states': []})
  else:
    tail = monster.parts[part_lookup[7]['part_name']]
    tail.set_name(lang, parts_data[33][0])

  # Tail (Normal)
  if lang == 'en':
    tail.states[NORMAL_STATE['en']] = State('en', NORMAL_STATE['en'])
    tail.states[NORMAL_STATE['en']].hitzone_value = parts_data[33][2]
    part_lookup[7]['states'].append(NORMAL_STATE['en'])
  else:
    tail.states[part_lookup[7]['states'][0]].set_name(lang, NORMAL_STATE[lang])

  # Tail (Fallen)
  if lang == 'en':
    tail.states['Fallen'] = State('en', 'Fallen')
    tail.states['Fallen'].hitzone_value = parts_data[34][2]
    part_lookup[7]['states'].append('Fallen')
  else:
    tail.states[part_lookup[7]['states'][1]].set_name(lang, '擊倒後')

  # Tail (Wounds)
  if lang == 'en':
    tail.states[parts_data[35][1]] = State('en', parts_data[35][1])
    tail.states[parts_data[35][1]].hitzone_value = parts_data[35][2]
    part_lookup[7]['states'].append(parts_data[35][1])
  else:
    tail.states[part_lookup[7]['states'][2]].set_name(lang, parts_data[35][1])

  return monster, part_lookup

def main():
  en_links: list[str] = get_monster_links(MONSTERS_EN_URL)
  zh_links: list[str] = get_monster_links(MONSTERS_ZH_URL)
  monsters: dict[str, Monster] = {}
  for i in range(len(en_links)):
    print(f"Processing {i + 1}/{len(en_links)}: {en_links[i]}")
    if en_links[i] == "/data/monsters/zoh-shia":
      (monster, part_lookup) = get_zoh_shia_data(KIRANICO_URL + en_links[i], 'en', None, None)
      (monster, _) = get_zoh_shia_data(KIRANICO_URL + zh_links[i], 'zh', monster, part_lookup)
    else:
      (monster, part_lookup) = get_monster_data(KIRANICO_URL + en_links[i], 'en', None, None)
      (monster, _) = get_monster_data(KIRANICO_URL + zh_links[i], 'zh', monster, part_lookup)
    monsters[monster.name.name['en']] = monster

  with open("monster_data.json", "w", encoding="utf-8") as f:
    f.write(json.dumps({key: monster.to_dict() for key, monster in monsters.items()}, indent=4, ensure_ascii=False))


if __name__ == '__main__':
  main()