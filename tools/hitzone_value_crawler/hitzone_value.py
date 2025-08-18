class HitzoneValue:
  def __init__(self,
               sever: int,
               blunt: int,
               shoot: int,
               fire: int,
               water: int,
               thunder: int,
               ice: int,
               dragon: int):
    self.sever: int = sever
    self.blunt: int = blunt
    self.shoot: int = shoot
    self.fire: int = fire
    self.water: int = water
    self.thunder: int = thunder
    self.ice: int  = ice
    self.dragon: int = dragon
  
  def to_dict(self):
    return {
      "sever": self.sever,
      "blunt": self.blunt,
      "shoot": self.shoot,
      "fire": self.fire,
      "water": self.water,
      "thunder": self.thunder,
      "ice": self.ice,
      "dragon": self.dragon
    }
