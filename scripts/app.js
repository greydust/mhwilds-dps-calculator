document.addEventListener("DOMContentLoaded", () => {
  const weaponTypeSelect = document.getElementById("weapon-type");
  const weaponSelect = document.getElementById("weapon");
  const baseAttack = document.getElementById("base-attack");
  const affinity = document.getElementById("affinity");
  const ammoTypeSelect = document.getElementById("ammo-type");
  const ammoLevel = document.getElementById("ammo-level");
  const ammoCount = document.getElementById("ammo-count");
  const mod1 = document.getElementById("mod-1");
  const mod2 = document.getElementById("mod-2");
  const buffRow = document.getElementById("buff");
  const languageSelector = document.getElementById("language-selector");
  const ignitionGauge = document.getElementById("ignition-gauge");
  const enhancementType = document.getElementById("enhancement-type");
  const finalAttack = document.getElementById("final-attack");
  const finalAffinity = document.getElementById("final-affinity");
  const elementalType = document.getElementById("elemental-type");
  const elementalAttack = document.getElementById("elemental-attack");
  const shootSpeed = document.getElementById("shoot-speed");
  const reloadSpeed = document.getElementById("reload-speed");
  const cycleTime = document.getElementById("cycle-time");
  const shotsPerSecond = document.getElementById("shots-per-second");
  const artian = document.getElementById("artian");

  const files = [
    "assets/data/action.json",
    "assets/data/buff.json",
    "assets/data/skill/weapon.json",
    "assets/data/skill/armor.json",
    "assets/data/skill/group.json",
    "assets/data/skill/set.json",
    "assets/data/translation.json",
    "assets/data/weapon/artian/hbg.json",
    "assets/data/weapon/hbg.json"
  ];
  const ammoTypeToModAmmoType = {
    normal: "normal",
    pierce: "pierce",
    spread: "spread",
    flaming: "elemental",
    water: "elemental",
    freeze: "elemental",
    thunder: "elemental"
  };

  let data = {};
  let currentLanguage = "en";

  let fetched = 0;
  files.forEach((file) => {
    fetch(file)
      .then((response) => response.json())
      .then((fileData) => {
        const pathParts = file.replace("assets/data/", "").replace(".json", "").split("/");
        let current = data;

        pathParts.forEach((part, index) => {
          if (!current[part]) {
            current[part] = index === pathParts.length - 1 ? fileData : {};
          }
          current = current[part];
        });

        fetched++;
        if (fetched === files.length) {
          initialize();
        }
      })
      .catch((error) => console.error(`Error loading ${file}:`, error));
  });

  function initialize() {
    currentLanguage = getSupportedLanguage();
    languageSelector.value = currentLanguage; // Set the language selector to match the URL language
    updatePageLanguage();
    populateWeaponTranslation();
    populateWeaponDropdown();
    Object.entries(data.skill).forEach(([skill, skillData]) => {
      populateSkill(skillData, skill, document.getElementById(`${skill}-skill`));
    });
    populateBuff();

    updateFinalStats();
  }

  function getSupportedLanguage() {
    const rawLanguage = getLanguageFromURL() || navigator.language;
    if (data.translation[rawLanguage]) {
      return rawLanguage;
    }

    const [language, region] = rawLanguage.split("-")
    if (data.translation[language]) {
      return language;
    }

    return currentLanguage;
  }

  function getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("lang");
  }

  function updatePageLanguage() {
    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");
      if (data.translation[currentLanguage] && data.translation[currentLanguage][key]) {
        element.textContent = data.translation[currentLanguage][key];
      }
    });
  }

  function populateWeaponTranslation() {
    Object.entries(data.weapon["hbg"]).map(([key, weapon]) => {
      Object.entries(weapon.name).map(([language, name]) => {
        data.translation[language][`hbg-${key}`] = name;
      })
    });
  }

  function populateWeaponDropdown() {
    weaponSelect.innerHTML = "";
    Object.entries(data.weapon["hbg"]).forEach(([key, weapon]) => {
      const option = document.createElement("option");
      option.value = key;
      option.setAttribute("data-lang", `hbg-${key}`);
      option.textContent = weapon.name[currentLanguage];
      weaponSelect.appendChild(option);
    });

    populateWeaponData();
  }

  function populateWeaponData() {
    const selectedWeaponType = weaponTypeSelect.value;
    const selectedWeaponKey = weaponSelect.value;
    hunter.weapon = structuredClone(data.weapon[selectedWeaponType][selectedWeaponKey]);
    if (hunter.weapon) {
      if (hunter.weapon.artian) {
        artian.classList.remove("hidden");
        updateArtianType();
      } else {
        artian.classList.add("hidden");
      }

      updateWeaponBaseAttributes(hunter.weapon);

      updateAmmoTypeSelector(hunter.weapon);
      updateModSelector(hunter.weapon);

      updateWeapondata(hunter.weapon);
      updateFinalStats();
    } else {
      resetHunterStat();

      baseAttack.textContent = "-";
      affinity.textContent = "-";
      ammoTypeSelect.innerHTML = "";
      mod1.innerHTML = "";
      mod2.innerHTML = "";
      ignitionGauge.textContent = "Lv1";
      enhancementType.textContent = "-";
      ammoCount.textContent = "-";
    }
  }

  function updateWeaponBaseAttributes(weapon) {
    hunter.baseAttack = weapon.baseAttack;
    hunter.baseAffinity = weapon.affinity;
    if (weapon.artian) {
      for (let i = 1; i <= 3; i++) {
        const element = document.getElementById(`artian-bonus-${i}`);
        if (element.value == "attack") {
          hunter.baseAttack += 5;
        } else if (element.value == "affinity") {
          hunter.baseAffinity += 0.05
        }
      }
      for (let i = 1; i <= 5; i++) {
        const element = document.getElementById(`artian-reinforcement-${i}`);
        if (element.value == "attack") {
          hunter.baseAttack += 5;
        } else if (element.value == "affinity") {
          hunter.baseAffinity += 0.05
        }
      }
    }

    baseAttack.textContent = hunter.baseAttack;
    affinity.textContent = `${Number((hunter.baseAffinity * 100).toFixed(3))}%`;
  }

  function updateArtianType() {
    const { type: type, level: level } = calculateArtianType();

    const ammo = data.weapon.artian.hbg[type].ammo[level - 2];
    Object.entries(ammo).forEach(([key, value]) => {
      hunter.weapon.ammo[key] = value;
    });

    const reinceforcement = data.weapon.artian.hbg[type].reinceforcement;
    for (let i = 1; i <= 5; i++) {
      const element = document.getElementById(`artian-reinforcement-${i}`);
      element.replaceChildren();
      reinceforcement.forEach((r) => {
        const option = document.createElement("option");
        option.value = r.type;
        option.setAttribute("data-lang", `artian-reinceforcement-${r.type}`);
        option.textContent = data.translation[currentLanguage][`artian-reinceforcement-${r.type}`];
        element.appendChild(option);
      });

      // Remove existing event listeners by cloning the element
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);

      newElement.addEventListener("change", () => {
        // Count the occurrences of each type across all selectors
        const typeCounts = {};
        for (let j = 1; j <= 5; j++) {
          const selectedValue = document.getElementById(`artian-reinforcement-${j}`).value;
          if (selectedValue) {
            typeCounts[selectedValue] = (typeCounts[selectedValue] || 0) + 1;
          }
        }

        // Update the disabled state of options in all selectors
        for (let j = 1; j <= 5; j++) {
          const selector = document.getElementById(`artian-reinforcement-${j}`);
          const options = selector.options;
          for (let k = 0; k < options.length; k++) {
            const option = options[k];
            const type = option.value;
            const maxCount = reinceforcement[k]?.maximum || Infinity;
            option.disabled = typeCounts[type] >= maxCount;
          }
        }

        updateWeaponBaseAttributes(hunter.weapon);
        updateAmmoData(hunter.weapon, ammoTypeSelect.value);
        updateFinalStats();
      });
    }
  }

  function calculateArtianType() {
    const count = {};
    const result = {
      type: "None",
      level: 1,
    }
    for (let i = 1; i <= 3; i++) {
      const artianType = document.getElementById(`artian-element-type-${i}`).value;
      if (count[artianType]) {
        count[artianType]++;
      }
      else {
        count[artianType] = 1;
      }
      if (count[artianType] > 1) {
        result.type = artianType;
        result.level = count[artianType];
      }
    }
    return result;
  }

  function updateAmmoTypeSelector(weapon) {
    ammoTypeSelect.innerHTML = "";
    Object.keys(weapon.ammo).forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.setAttribute("data-lang", `ammo-${type}`);
      option.textContent = data.translation[currentLanguage]?.[`ammo-${type}`] || type;
      ammoTypeSelect.appendChild(option);
    });

    updateAmmoData(weapon, ammoTypeSelect.value);
  }

  function updateModSelector(weapon) {
    // Populate Mod 1 and Mod 2 based on modType
    mod1.innerHTML = "";
    mod2.innerHTML = "";

    if (weapon.modType[0] == "magazine") {
      ["normal-magazine", "pierce-magazine", "spread-magazine", "elemental-magazine"].forEach((mod) => {
        appendMod(mod, mod1);
      });
    }

    if (weapon.modType[0] == "powder") {
      ["normal-powder", "pierce-powder", "spread-powder", "elemental-powder"].forEach((mod) => {
        appendMod(mod, mod1);
      });
    }

    if (weapon.modType[1] == "normal") {
      ["normal-magazine", "pierce-magazine", "spread-magazine"].forEach((mod) => {
        appendMod(mod, mod2);
      });
    } else if (weapon.modType[1] == "elemental") {
      appendMod("elemental-magazine", mod2);
    }

    if (weapon.modType[2] == "standard") {
      appendMod("standard", mod2);
    } else if (weapon.modType[2] == "ignition") {
      appendMod("ignition", mod2);
    }
    appendMod("ignition-mod", mod2);
  }

  function appendMod(mod, selector) {
    const option = document.createElement("option");
    option.value = mod;
    option["data-lang"] = `mod-${mod}`;
    option.textContent = data.translation[currentLanguage]?.[`mod-${mod}`] || mod;
    selector.appendChild(option);
  }

  function updateWeapondata(weapon) {
    updateIgnitionGauge(weapon);
    updateEnhanceType(weapon);
  }

  function updateAmmoData(weapon, ammo) {
    hunter.ammo.type = ammo;
    updateAmmoLevel(weapon, ammo);
    updateAmmoCount(weapon, ammo);
    updateAmmoElemental(ammo);
    updateFinalStats();
  }

  function updateAmmoLevel(weapon, ammo) {
    const modType = ammoTypeToModAmmoType[ammo] || "";
    const powderMods =
      Array.from(mod1.options).filter(option => option.selected && option.value.includes(`${modType}-powder`)).length +
      Array.from(mod2.options).filter(option => option.selected && option.value.includes(`${modType}-powder`)).length;

    const calculatedLevel = weapon.ammo[ammo].level + powderMods;
    hunter.ammo.level = calculatedLevel;
    ammoLevel.textContent = `Lv${calculatedLevel}`;
  }

  function updateAmmoCount(weapon, ammo) {
    const modType = ammoTypeToModAmmoType[ammo] || "";
    let magazineMods =
      Array.from(mod1.options).filter(option => option.selected && option.value.includes(`${modType}-magazine`)).length +
      Array.from(mod2.options).filter(option => option.selected && option.value.includes(`${modType}-magazine`)).length;
    for (let i = 1; i <= 5; i++) {
      const element = document.getElementById(`artian-reinforcement-${i}`);
      if (element.value == "ammo") {
        magazineMods += 1;
      }
    }

    const calculatedAmmo = weapon.ammo[ammo].ammo + magazineMods;
    ammoCount.textContent = calculatedAmmo;
    hunter.ammo.ammo = calculatedAmmo;
  }

  function updateAmmoElemental(ammo) {
    const elementalAmmo = data.action.hbg.ammo[ammo].elemental;
    if (elementalAmmo) {
      hunter.ammo.elementalType = elementalAmmo[hunter.ammo.level - 1].type;
      hunter.ammo.baseElemental = elementalAmmo[hunter.ammo.level - 1].value;
    } else {
      hunter.ammo.baseElemental = 0;
      hunter.ammo.elementalType = "";
    }
  }

  function updateIgnitionGauge(weapon) {
    const ignitionMods = Array.from(mod2.options).filter(option => option.selected && option.value === "ignition-mod").length;
    const totalIgnitionLevel = weapon.ignitionRecovery + ignitionMods;
    ignitionGauge.textContent = `Lv${totalIgnitionLevel}`;
    hunter.ammo.ignitionGauge = totalIgnitionLevel;
  }

  function updateEnhanceType(weapon) {
    const standardMods = Array.from(mod2.options).filter(option => option.selected && option.value === "standard").length;
    const ignitionMods = Array.from(mod2.options).filter(option => option.selected && option.value === "ignition").length;

    if (weapon.mode.type === "ignition" || ignitionMods > 0) {
      hunter.ammo.enhancement.type = "ignition";
      hunter.ammo.enhancement.level = weapon.mode.level + ignitionMods;
    } else if (weapon.mode.type === "standard" || standardMods > 0) {
      hunter.ammo.enhancement.type = "standard";
      hunter.ammo.enhancement.level = weapon.mode.level + standardMods;
    } else {
      hunter.ammo.enhancement.type = "base";
      hunter.ammo.enhancement.level = "";
    }
    enhancementType["data-lang"] = `enhancement-${hunter.ammo.enhancement.type}${hunter.ammo.enhancement.level}`;
    enhancementType.textContent = data.translation[currentLanguage]?.[`enhancement-${hunter.ammo.enhancement.type}${hunter.ammo.enhancement.level}`];
  }

  function populateSkill(skills, type, div) {
    Object.entries(skills).forEach(([key, skill]) => {
      populateSkillTranslation(skill, type, key);

      if (!skill.show) return;

      const group = document.createElement("div");
      group.className = "group";

      if (skill.group) {
        document.getElementById(`${type}-skill-${skill.group}`).appendChild(group);
      } else {
        div.appendChild(group);
      }

      const label = document.createElement("label");
      label.setAttribute("for", `skill-${type}-${key}`);
      label.setAttribute("data-lang", `skill-${type}-${key}`);
      label.textContent = data.translation[currentLanguage][`skill-${type}-${key}`];
      group.appendChild(label);

      const select = document.createElement("select");
      select.id = `skill-${type}-${key}`;
      select.setAttribute("skill-type", type);
      select.setAttribute("skill-key", key);
      select.addEventListener("change", () => {
        updateFinalStats();
      });
      group.appendChild(select);

      for (let i = 0; i <= skill.maxLevel; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
      }
    });
  }

  function populateSkillTranslation(skill, type, key) {
    Object.entries(skill.name).forEach(([language, name]) => {
      data.translation[language][`skill-${type}-${key}`] = name;
    })

    if (skill.triggerName) {
      for (let i = 0; i < skill.triggerLevel; i++) {
        Object.entries(skill.triggerName[i]).forEach(([language, name]) => {
          data.translation[language][`trigger-${type}-${key}-${i}`] = name;
        })
      }
    }
  }

  function populateBuff() {
    Object.entries(data.buff).forEach(([key, buff]) => {
      Object.entries(buff.name).forEach(([language, name]) => {
        data.translation[language][`buff-${key}`] = name;
      });

      const group = document.createElement("div");
      group.className = "group";
      if (buff.group) {
        document.getElementById(`buff-${buff.group}`).appendChild(group);
      } else {
        buffRow.appendChild(group);
      }

      const label = document.createElement("label");
      label.setAttribute("for", `buff-${key}`);
      label.setAttribute("data-lang", `buff-${key}`);
      label.textContent = data.translation[currentLanguage][`buff-${key}`];
      group.appendChild(label);

      const select = document.createElement("select");
      select.id = `buff-${key}`;
      select.setAttribute("buff-key", key);
      select.setAttribute("buff-option", 0);
      select.addEventListener("change", (event) => {
        updateFinalStats();
        select.setAttribute("buff-option", event.target.value);
      });
      group.appendChild(select);

      const option = document.createElement("option");
      option.value = 0;
      option.setAttribute("data-lang", `buff-none`);
      option.textContent = data.translation[currentLanguage][`buff-none`];
      select.appendChild(option);

      for (let i = 0; i < buff.options.length; i++) {
        const item = buff.options[i];
        Object.entries(item.name).forEach(([language, name]) => {
          data.translation[language][`buff-${key}-${i + 1}`] = name;
        });

        if (item.triggerName) {
          for (let j = 0; j < item.triggerLevel; j++) {
            Object.entries(item.triggerName[j]).forEach(([language, name]) => {
              data.translation[language][`trigger-${key}-${i + 1}-${j}`] = name;
            })
          }
        }

        const option = document.createElement("option");
        option.value = i + 1;
        option.setAttribute("data-lang", `buff-${key}-${i + 1}`);
        option.textContent = data.translation[currentLanguage][`buff-${key}-${i + 1}`];
        select.appendChild(option);
      }

      select.value = buff.defaultOption || 0;
    });
  }

  function updateFinalStats() {
    resetHunterStat();

    document.querySelectorAll("[skill-type]").forEach((element) => {
      const type = element.getAttribute("skill-type");
      const key = element.getAttribute("skill-key");
      const level = document.getElementById(`skill-${type}-${key}`).value;
      const skill = data.skill[type][key];

      if (skill.trigger) {
        const triggerKey = `${type}-${key}`;
        const triggerElement = document.getElementById(`trigger-${triggerKey}`);
        const triggerRow = document.getElementById(`trigger-${skill.group || ""}`) || document.getElementById("trigger");

        if (level == 0 && triggerElement) {
          removeTriggerElement(triggerElement, triggerRow);
        } else if (level > 0 && !triggerElement) {
          hunter.trigger.push(triggerKey);

          triggerRow.classList.remove("hidden"); // Show the row when adding elements
          createTriggerElement(triggerRow, triggerKey, `skill-${triggerKey}`, triggerKey, skill.triggerLevel, skill.defaultCoverage);
        }
      } else {
        if (level > 0) {
          const effect = skill.effect[level - 1];
          updateEffect(effect);
        }
      }
    });

    document.querySelectorAll("[buff-key]").forEach((element) => {
      const key = element.getAttribute("buff-key");
      const buff = data.buff[key];
      const select = document.getElementById(`buff-${key}`)
      const option = select.value;
      const previousOption = select.getAttribute("buff-option");
      const triggerKey = `buff-${key}`;
      const triggerElement = document.getElementById(`trigger-${triggerKey}`);
      const triggerRow = document.getElementById(`trigger-${buff.group || ""}`) || document.getElementById("trigger");

      if (option == 0) {
        if (triggerElement) {
          removeTriggerElement(triggerElement, triggerRow);
        }
        return;
      }

      const buffOption = buff.options[option - 1];
      if (buffOption.trigger) {
        hunter.trigger.push(triggerKey);

        if (triggerElement && previousOption == option) return;

        if (triggerElement) {
          removeTriggerElement(triggerElement, triggerRow);
        }

        triggerRow.classList.remove("hidden"); // Show the row when adding elements
        createTriggerElement(triggerRow, triggerKey, `buff-${key}-${option}`, `${key}-${option}`, buffOption.triggerLevel, buffOption.defaultCoverage);
      } else {
        updateEffect(buffOption.effect);
      }
    });

    hunter.finalAttack = hunter.baseAttack * hunter.attackMultiplier + hunter.attack;
    hunter.finalAffinity = Math.max(-1, Math.min(1, hunter.baseAffinity + hunter.affinity));
    finalAttack.textContent = Number(hunter.finalAttack.toFixed(3));
    finalAffinity.textContent = `${Number((hunter.finalAffinity * 100).toFixed(3))}%`;

    if (hunter.ammo.baseElemental > 0) {
      elementalType.textContent = data.translation[currentLanguage]?.[`elemental-${hunter.ammo.elementalType}`] || hunter.ammo.elementalType;
      elementalType.setAttribute("data-lang", `elemental-${hunter.ammo.elementalType}`);

      hunter.ammo.finalElemental = hunter.ammo.baseElemental * hunter.elementalMultiplier * hunter[`${hunter.ammo.elementalType}Multiplier`] + hunter[`${hunter.ammo.elementalType}`];
      elementalAttack.textContent = Number(hunter.ammo.finalElemental.toFixed(3));
    } else {
      elementalType.textContent = "";
      elementalType.setAttribute("data-lang", "");
      elementalAttack.textContent = "-";
    }

    calculateCycleTime();
  }

  function removeTriggerElement(element, row) {
    element.remove();
    if (!row.hasChildNodes()) {
      row.classList.add("hidden"); // Hide the row if empty
    }
  }

  function createTriggerElement(triggerRow, key, labelKey, triggerNameKey, triggerLevel, defaultCoverage) {
    const container = document.createElement("div");
    container.id = `trigger-${key}`;
    container.className = "trigger-container";
    triggerRow.appendChild(container);

    const line1 = document.createElement("div");
    container.appendChild(line1);
    line1.className = "trigger-line";

    const label = document.createElement("label");
    line1.appendChild(label);
    label.setAttribute("for", `trigger-${key}-coverage`);
    label.setAttribute("data-lang", labelKey);
    label.textContent = data.translation[currentLanguage][labelKey];

    const line2 = document.createElement("div");
    container.appendChild(line2);
    line2.className = "trigger-line trigger-group"; // Use the new trigger-group class

    const line3 = document.createElement("div");
    container.appendChild(line3);
    line3.className = "trigger-line trigger-group"; // Use the new trigger-group class

    let inputs = [];
    let percentages = [];
    for (let i = 0; i < triggerLevel; i++) {
      const input = document.createElement("input");
      const percentageDisplay = document.createElement("label");
      const percentageInput = document.createElement("input");

      input.type = "range";
      input.id = `trigger-${key}-coverage${i}`;
      input.min = 0;
      input.max = 100;
      input.value = defaultCoverage[i] * 100 || 0;
      input.addEventListener("input", (event) => {
        const min = i < triggerLevel - 1 ? document.getElementById(`trigger-${key}-coverage${i + 1}`).value : 0;
        const max = i > 0 ? document.getElementById(`trigger-${key}-coverage${i - 1}`).value : 100;
        const value = Math.max(min, Math.min(max, event.target.value));
        event.target.value = value;
        percentageDisplay.textContent = `${value}%`;
        percentageInput.value = value;
      });

      const percentageGroup = document.createElement("div");
      percentageGroup.className = "trigger-group"; // Use the new trigger-group class

      const percentageLabel = document.createElement("label");
      percentageLabel.setAttribute("data-lang", `trigger-${triggerNameKey}-${i}`);
      percentageLabel.textContent = data.translation[currentLanguage][`trigger-${triggerNameKey}-${i}`];
      percentageGroup.appendChild(percentageLabel);

      percentageDisplay.textContent = `${input.value}%`;
      percentageGroup.appendChild(percentageDisplay);
      percentageDisplay.addEventListener("click", () => {
        percentageDisplay.style.display = "none";
        percentageInput.style.display = "inline-block";
        percentageInput.focus();
      });
      percentageGroup.appendChild(input);

      percentageInput.className = "percentage-input";
      percentageInput.type = "number";
      percentageInput.min = 0;
      percentageInput.max = 100;
      percentageInput.value = input.value;
      percentageInput.style.display = "none";
      percentageGroup.appendChild(percentageInput);

      percentageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          validatePercentageInput();
          percentageInput.blur();
        }
      });
      percentageInput.addEventListener("blur", () => {
        validatePercentageInput();
        percentageInput.style.display = "none";
        percentageDisplay.style.display = "inline-block";
      });

      function validatePercentageInput() {
        const min = i < triggerLevel - 1 ? document.getElementById(`trigger-${key}-coverage${i + 1}`).value : 0;
        const max = i > 0 ? document.getElementById(`trigger-${key}-coverage${i - 1}`).value : 100;
        const value = Math.max(min, Math.min(max, percentageInput.value));
        percentageInput.value = value;
        input.value = value;
        percentageDisplay.textContent = `${value}%`;
      }

      percentageGroup.appendChild(percentageInput);

      inputs.push(input);
      percentages.push(percentageGroup);
    }

    for (const input of inputs) {
      line2.appendChild(input);
    }

    for (const percentage of percentages) {
      line3.appendChild(percentage);
    }
  }

  function updateEffect(effect) {
    Object.entries(effect).forEach(([key, value]) => {
      switch (key) {
        case "attack":
          hunter.attack += value;
          break;
        case "attackMultiplier":
          hunter.attackMultiplier *= value;
          break;
        case "affinity":
          hunter.affinity += value;
          break;
        case "criticalDamage":
          hunter.criticalDamage += value;
          break;
        case "elementalCriticalDamageHBG":
          hunter.elementalCriticalDamage += value;
          break;
        case "fire":
          hunter.fire += value;
          break;
        case "fireMultiplier":
          hunter.fireMultiplier *= value;
          break;
        case "water":
          hunter.water += value;
          break;
        case "waterMultiplier":
          hunter.waterMultiplier *= value;
          break;
        case "thunder":
          hunter.thunder += value;
          break;
        case "thunderMultiplier":
          hunter.thunderMultiplier *= value;
          break;
        case "ice":
          hunter.ice += value;
          break;
        case "iceMultiplier":
          hunter.iceMultiplier *= value;
          break;
        case "dragon":
          hunter.dragon += value;
          break;
        case "dragonMultiplier":
          hunter.dragonMultiplier *= value;
          break;
        case "elementalMultiplier":
          hunter.elementalMultiplier *= value;
          break;
        case "attackOpening":
          hunter.attackOpening += value;
          break;
        case "elementalMultiplierOpening":
          hunter.elementalMultiplierOpening *= value;
          break;
        case "reload":
          hunter.ammo.reload = value;
          break;
        case "normalDamageMultiplier":
          hunter.normalDamageMultiplier *= value;
          break;
        case "pierceDamageMultiplier":
          hunter.pierceDamageMultiplier *= value;
          break;
        case "spreadDamageMultiplier":
          hunter.spreadDamageMultiplier *= value;
          break;
        case "specialAmmoDamageMultiplier":
          hunter.specialAmmoDamageMultiplier *= value;
          break;
        case "burstAttack":
          hunter.burstAttack = value;
          break;
      }
    });
  }

  function resetHunterStat() {
    hunter.attack = 0;
    hunter.attackMultiplier = 1;
    hunter.affinity = 0;
    hunter.criticalDamage = 1.25;
    hunter.elementalCriticalDamage = 1;
    hunter.fire = 0;
    hunter.fireMultiplier = 1;
    hunter.water = 0;
    hunter.waterMultiplier = 1;
    hunter.thunder = 0;
    hunter.thunderMultiplier = 1;
    hunter.ice = 0;
    hunter.iceMultiplier = 1;
    hunter.dragon = 0;
    hunter.dragonMultiplier = 1;
    hunter.elementalMultiplier = 1;
    hunter.attackOpening = 0;
    hunter.elementalMultiplierOpening = 1;
    hunter.ammo.reload = "reload";
    hunter.normalDamageMultiplier = 1;
    hunter.pierceDamageMultiplier = 1;
    hunter.spreadDamageMultiplier = 1;
    hunter.specialAmmoDamageMultiplier = 1;
    hunter.burstAttack = 0;
    hunter.trigger = [];
  }

  function calculateCycleTime() {
    const ammo = data.action["hbg"]["ammo"][hunter.ammo.type];
    hunter.ammo.shootSpeed = ammo.shoot;
    hunter.ammo.reloadSpeed = ammo[hunter.ammo.reload];
    hunter.cycleTime = hunter.ammo.shootSpeed * hunter.ammo.ammo + hunter.ammo.reloadSpeed;
    hunter.shotsPerSecond = hunter.ammo.ammo / hunter.cycleTime;

    shootSpeed.textContent = hunter.ammo.shootSpeed;
    reloadSpeed.textContent = hunter.ammo.reloadSpeed;
    cycleTime.textContent = Number(hunter.cycleTime.toFixed(3));
    shotsPerSecond.textContent = Number(hunter.shotsPerSecond.toFixed(3));
  }

  languageSelector.addEventListener("change", () => {
    currentLanguage = languageSelector.value;
    updateURLWithLanguage(currentLanguage);
    updatePageLanguage();
  });

  function updateURLWithLanguage(lang) {
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  weaponSelect.addEventListener("change", populateWeaponData);

  for (let i = 1; i <= 3; i++) {
    const element = document.getElementById(`artian-element-type-${i}`);
    element.addEventListener("change", () => {
      populateWeaponData();
    });
  }

  for (let i = 1; i <= 3; i++) {
    const element = document.getElementById(`artian-bonus-${i}`);
    element.addEventListener("change", () => {
      updateWeaponBaseAttributes(hunter.weapon);
      updateFinalStats();
    });
  }

  ammoTypeSelect.addEventListener("change", (event) => {
    if (hunter.weapon) {
      updateAmmoData(hunter.weapon, event.target.value);
    }
  });

  // Update Ignition Gauge Recovery when mod2 changes
  mod1.addEventListener("change", () => {
    const ammo = ammoTypeSelect.value;
    if (hunter.weapon && ammo) {
      updateWeapondata(hunter.weapon);
      updateAmmoData(hunter.weapon, ammo);
    }
  });

  // Update Ammo Count when mod2 changes
  mod2.addEventListener("change", () => {
    const ammo = ammoTypeSelect.value;
    if (hunter.weapon && ammo) {
      updateWeapondata(hunter.weapon);
      updateAmmoData(hunter.weapon, ammo);
    }
  });

  document.getElementById("calculate-button").addEventListener("click", calculate);

  function calculate() {
  }

  const hunter = {
    baseAttack: 0,
    baseAffinity: 0,
    ammo: {
      enhancement: {},
      reload: "reload",
    },
    skills: {},
    weapon: null
  };
  window.hunter = hunter;
});
