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
  const ignitionRecoveryLevel = document.getElementById("ignition-recovery-level");
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
  const logBox = document.getElementById("log-box");
  const resultDPS = document.getElementById("result-dps");
  const resultDPH = document.getElementById("result-dph");
  const resultIgnitionDPS = document.getElementById("result-ignition-dps");
  const resultIgnitionDPA = document.getElementById("result-ignition-dpa");
  const resultAverageAttack = document.getElementById("result-average-attack");
  const resultAverageAffinity = document.getElementById("result-average-affinity");
  const resultPhysicalPercentage = document.getElementById("result-physical-percentage");
  const resultElementalPercentage = document.getElementById("result-elemental-percentage");
  const resultIgnitionPercentage = document.getElementById("result-ignition-percentage");
  const resultIntervalDamagePercentage = document.getElementById("result-interval-damage-percentage");
  const resultAverageElementalMultiplier = document.getElementById("result-average-elemental-multiplier");
  const resultAverageElementalAdditive = document.getElementById("result-average-elemental-additive");
  const elementalHitZoneValue = document.getElementById("elemental-hitzone-value");
  const useIgnition = document.getElementById("use-ignition");
  const ignitionType = document.getElementById("ignition-type");
  const miscellaneous = document.getElementById("miscellaneous");
  const intervalDamageGap = document.getElementById("interval-damage-gap");
  const fastReload = document.getElementById("fast-reload");

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
  const ignitionLevelRecoveryMultiplier = [
    0.9,
    1,
    1.1
  ];

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

    populateFieldsFromURL();

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
      ignitionRecoveryLevel.textContent = "Lv1";
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
    updateIgnitionRecoveryLevel(weapon);
    updateEnhanceType(weapon);
  }

  function updateAmmoData(weapon, ammo) {
    hunter.ammo.type = ammo;
    updateAmmoLevel(weapon, ammo);
    updateAmmoCount(weapon, ammo);
    updateAmmoElemental(ammo);
    hunter.ammo.damage = data.action.hbg.ammo[ammo].damage[hunter.ammo.level - 1];
    hunter.ammo.ignitionRecovery = data.action.hbg.ammo[ammo].ignitionRecovery;

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
    if (weapon.artian) {
      for (let i = 1; i <= 5; i++) {
        const element = document.getElementById(`artian-reinforcement-${i}`);
        if (element.value == "ammo") {
          magazineMods += 1;
        }
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

  function updateIgnitionRecoveryLevel(weapon) {
    const ignitionMods = Array.from(mod2.options).filter(option => option.selected && option.value === "ignition-mod").length;
    const totalIgnitionLevel = weapon.ignitionRecovery + ignitionMods;
    ignitionRecoveryLevel.textContent = `Lv${totalIgnitionLevel}`;
    hunter.ignitionRecoveryLevel = totalIgnitionLevel;
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

  function populateFieldsFromURL() {
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value === "true";
        } else {
          element.value = value;
        }

        // Dispatch a change event with bubbles: true
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }
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
        } else if (level > 0) {
          hunter.trigger.push({ key: triggerKey, level: level });
          if (!triggerElement) {
            triggerRow.classList.remove("hidden"); // Show the row when adding elements
            createTriggerElement(triggerRow, triggerKey, `skill-${triggerKey}`, triggerKey, skill.triggerLevel, skill.defaultCoverage);
          }
        }
      }

      if (level > 0) {
        const effect = skill.effect[level - 1];
        applyEffect(effect);
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
        hunter.trigger.push({ key: triggerKey, level: option });

        if (triggerElement && previousOption == option) return;

        if (triggerElement) {
          removeTriggerElement(triggerElement, triggerRow);
        }

        triggerRow.classList.remove("hidden"); // Show the row when adding elements
        createTriggerElement(triggerRow, triggerKey, `buff-${key}-${option}`, `${key}-${option}`, buffOption.triggerLevel, buffOption.defaultCoverage);
      }

      applyEffect(buffOption.effect);
    });

    calculateHunterFinalStats();
    finalAttack.textContent = Number(hunter.finalAttack.toFixed(3));
    finalAffinity.textContent = `${Number((hunter.finalAffinity * 100).toFixed(3))}%`;
    if (hunter.ammo.baseElemental > 0) {
      elementalType.textContent = data.translation[currentLanguage]?.[`elemental-${hunter.ammo.elementalType}`] || hunter.ammo.elementalType;
      elementalType.setAttribute("data-lang", `elemental-${hunter.ammo.elementalType}`);
      elementalAttack.textContent = Number(hunter.ammo.baseElemental.toFixed(3));
    } else {
      elementalType.textContent = "";
      elementalType.setAttribute("data-lang", "");
      elementalAttack.textContent = "-";
    }

    calculateCycleTime();

    if (hunter.intervalDamage.length > 0) {
      miscellaneous.classList.remove("hidden");
    } else {
      miscellaneous.classList.add("hidden");
    }
  }

  function calculateHunterFinalStats() {
    hunter.finalAttack = hunter.baseAttack * hunter.attackMultiplier + hunter.attack;
    hunter.finalAffinity = Math.max(-1, Math.min(1, hunter.baseAffinity + hunter.affinity));
    hunter.elementalCriticalDamage = hunter[`elementalCriticalDamage-${weaponTypeSelect.value}`];

    hunter.finalDamageMultiplier = 1;
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
      input.id = `trigger-${key}-coverage-${i}`;
      input.min = 0;
      input.max = 100;
      input.value = defaultCoverage[i] * 100 || 0;
      input.addEventListener("input", (event) => {
        const min = i < triggerLevel - 1 ? document.getElementById(`trigger-${key}-coverage-${i + 1}`).value : 0;
        const max = i > 0 ? document.getElementById(`trigger-${key}-coverage-${i - 1}`).value : 100;
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
        const min = i < triggerLevel - 1 ? document.getElementById(`trigger-${key}-coverage-${i + 1}`).value : 0;
        const max = i > 0 ? document.getElementById(`trigger-${key}-coverage-${i - 1}`).value : 100;
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

  function applyEffect(effect) {
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
        case "affinityRecovered":
          hunter.affinityRecovered += value;
          break;
        case "criticalDamage":
          hunter.criticalDamage += value;
          break;
        case "elementalCriticalDamage-hbg":
          hunter["elementalCriticalDamage-hbg"] += value;
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
        case "attackTetrad":
          hunter.attackTetrad += value;
          break;
        case "affinityTetrad":
          hunter.affinityTetrad += value;
          break;
        case "elementalMultiplierTetrad":
          hunter.elementalMultiplierTetrad *= value;
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
        case "ignitionNatureRecoveryMultiplier":
          hunter.ignitionNatureRecoveryMultiplier *= value;
          break;
        case "status":
          hunter.status[value] = true;
          break;
        case "intervalDamage":
          hunter.intervalDamage.push(value);
          break;
        default:
          console.error(`Unknown effect key: ${key}`);
          break;
      }
    });
  }

  function removeEffect(effect) {
    Object.entries(effect).forEach(([key, value]) => {
      switch (key) {
        case "attack":
          hunter.attack -= value;
          break;
        case "attackMultiplier":
          hunter.attackMultiplier /= value;
          break;
        case "affinity":
          hunter.affinity -= value;
          break;
        case "affinityRecovered":
          hunter.affinityRecovered -= value;
          break;
        case "criticalDamage":
          hunter.criticalDamage -= value;
          break;
        case "elementalCriticalDamage-hbg":
          hunter["elementalCriticalDamage-hbg"] -= value;
          break;
        case "fire":
          hunter.fire -= value;
          break;
        case "fireMultiplier":
          hunter.fireMultiplier /= value;
          break;
        case "water":
          hunter.water -= value;
          break;
        case "waterMultiplier":
          hunter.waterMultiplier /= value;
          break;
        case "thunder":
          hunter.thunder -= value;
          break;
        case "thunderMultiplier":
          hunter.thunderMultiplier /= value;
          break;
        case "ice":
          hunter.ice -= value;
          break;
        case "iceMultiplier":
          hunter.iceMultiplier /= value;
          break;
        case "dragon":
          hunter.dragon -= value;
          break;
        case "dragonMultiplier":
          hunter.dragonMultiplier /= value;
          break;
        case "elementalMultiplier":
          hunter.elementalMultiplier /= value;
          break;
        case "attackOpening":
          hunter.attackOpening -= value;
          break;
        case "elementalMultiplierOpening":
          hunter.elementalMultiplierOpening /= value;
          break;
        case "attackTetrad":
          hunter.attackTetrad -= value;
          break;
        case "affinityTetrad":
          hunter.affinityTetrad -= value;
          break;
        case "elementalMultiplierTetrad":
          hunter.elementalMultiplierTetrad /= value;
          break;
        case "reload":
          hunter.ammo.reload = "reload";
          break;
        case "normalDamageMultiplier":
          hunter.normalDamageMultiplier /= value;
          break;
        case "pierceDamageMultiplier":
          hunter.pierceDamageMultiplier /= value;
          break;
        case "spreadDamageMultiplier":
          hunter.spreadDamageMultiplier /= value;
          break;
        case "specialAmmoDamageMultiplier":
          hunter.specialAmmoDamageMultiplier /= value;
          break;
        case "ignitionNatureRecoveryMultiplier":
          hunter.ignitionNatureRecoveryMultiplier /= value;
          break;
        case "status":
          delete hunter.status[value];
          break;
        case "intervalDamage":
          hunter.intervalDamage = hunter.intervalDamage.filter((item) => item.name !== value.name);
          break;
        default:
          console.error(`Unknown effect key: ${key}`);
          break;
      }
    });
  }

  function resetHunterStat() {
    hunter.attack = 0;
    hunter.attackMultiplier = 1;
    hunter.affinity = 0;
    hunter.affinityRecovered = 0;
    hunter.criticalDamage = 1.25;
    hunter.elementalCriticalDamage = 1;
    hunter["elementalCriticalDamage-hbg"] = 1;
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
    hunter.attackTetrad = 0;
    hunter.affinityTetrad = 0;
    hunter.elementalMultiplierTetrad = 1;
    hunter.ammo.reload = "reload";
    hunter.normalDamageMultiplier = 1;
    hunter.pierceDamageMultiplier = 1;
    hunter.spreadDamageMultiplier = 1;
    hunter.specialAmmoDamageMultiplier = 1;
    hunter.ignitionNatureRecoveryMultiplier = 1;
    hunter.ignitionGauge = 100;
    hunter.ignitionNatureRecovery = 1.9;
    hunter.trigger = [];
    hunter.status = {};
    hunter.intervalDamage = [];
  }

  function calculateCycleTime() {
    const ammo = data.action["hbg"]["ammo"][hunter.ammo.type];
    hunter.ammo.shootSpeed = ammo.shoot;
    if (fastReload.checked) {
      hunter.ammo.reloadSpeed = Math.max(0, ammo[hunter.ammo.reload] - hunter.ammo.shootSpeed + 0.1);
    } else {
      hunter.ammo.reloadSpeed = ammo[hunter.ammo.reload];
    }
    hunter.cycleTime = hunter.ammo.shootSpeed * hunter.ammo.ammo + hunter.ammo.reloadSpeed;
    hunter.shotsPerSecond = hunter.ammo.ammo / hunter.cycleTime;

    shootSpeed.textContent = hunter.ammo.shootSpeed;
    reloadSpeed.textContent = Number(hunter.ammo.reloadSpeed.toFixed(3));
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

  mod1.addEventListener("change", () => {
    const ammo = ammoTypeSelect.value;
    if (hunter.weapon && ammo) {
      updateWeapondata(hunter.weapon);
      updateAmmoData(hunter.weapon, ammo);
    }
  });

  mod2.addEventListener("change", () => {
    const ammo = ammoTypeSelect.value;
    if (hunter.weapon && ammo) {
      updateWeapondata(hunter.weapon);
      updateAmmoData(hunter.weapon, ammo);
    }
  });

  fastReload.addEventListener("change", () => {
    const ammo = ammoTypeSelect.value;
    if (hunter.weapon && ammo) {
      updateAmmoData(hunter.weapon, ammo);
    }
  });

  document.getElementById("calculate-button").addEventListener("click", calculate);
  document.getElementById("reset-button").addEventListener("click", reset);

  function calculate() {
    const params = new URLSearchParams();

    // Include the current language in the URL
    params.set("lang", currentLanguage);

    document.querySelectorAll("input, select").forEach((element) => {
      if (element.id) {
        if (element.type === "checkbox") {
          params.set(element.id, element.checked ? "true" : "false");
        } else {
          params.set(element.id, element.value);
        }
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    hunter.averageAttack = 0;
    hunter.averageAffinity = 0;
    hunter.dps = 0;
    hunter.dph = 0;
    hunter.ignitionDPS = 0;
    hunter.ignitionDPA = 0;
    hunter.physicalPercentage = 0;
    hunter.elementalPercentage = 0;
    hunter.ignitionPercentage = 0;
    hunter.intervalDamagePercentage = 0;
    hunter.averageElementalMultiplier = 0;
    hunter.averageElementalAdditive = 0;
    logBox.innerHTML = "";
    goThroughTrigger(0, 1);

    resultDPS.textContent = Number(hunter.dps.toFixed(3));
    resultDPH.textContent = Number(hunter.dph.toFixed(3));
    resultIgnitionDPS.textContent = Number(hunter.ignitionDPS.toFixed(3));
    resultIgnitionDPA.textContent = Number(hunter.ignitionDPA.toFixed(3));
    resultAverageAttack.textContent = Number(hunter.averageAttack.toFixed(3));
    resultAverageAffinity.textContent = `${Number((hunter.averageAffinity * 100).toFixed(3))}%`;
    resultPhysicalPercentage.textContent = `${Number((hunter.physicalPercentage * 100).toFixed(3))}%`;
    resultElementalPercentage.textContent = `${Number((hunter.elementalPercentage * 100).toFixed(3))}%`;
    resultIgnitionPercentage.textContent = `${Number((hunter.ignitionPercentage * 100).toFixed(3))}%`;
    resultIntervalDamagePercentage.textContent = `${Number((hunter.intervalDamagePercentage * 100).toFixed(3))}%`;
    resultAverageElementalMultiplier.textContent = Number(hunter.averageElementalMultiplier.toFixed(3));
    resultAverageElementalAdditive.textContent = Number(hunter.averageElementalAdditive.toFixed(3));
  }

  function goThroughTrigger(index, percentage) {
    if (index == hunter.trigger.length) {
      logBox.innerHTML += " ".repeat(hunter.trigger.length) + `Calculating DPS. Coverage: ${percentage}\n`;

      const {
        dps: dps,
        dph: dph,
        ignitionDPS: ignitionDPS,
        ignitionDPA: ignitionDPA,
        physicalPercentage: physicalPercentage,
        elementalPercentage: elementalPercentage,
        ignitionPercentage: ignitionPercentage,
        intervalDamagePercentage: intervalDamagePercentage,
        averageAttack: averageAttack,
        averageAffinity: averageAffinity,
        averageElementalMultiplier: averageElementalMultiplier,
        averageElementalAdditive: averageElementalAdditive,
      } = calculateDPS();
      hunter.dps += dps * percentage;
      hunter.dph += dph * percentage;
      hunter.ignitionDPS += ignitionDPS * percentage;
      hunter.ignitionDPA += ignitionDPA * percentage;
      hunter.physicalPercentage += physicalPercentage * percentage;
      hunter.elementalPercentage += elementalPercentage * percentage;
      hunter.ignitionPercentage += ignitionPercentage * percentage;
      hunter.intervalDamagePercentage += intervalDamagePercentage * percentage;
      hunter.averageAttack += averageAttack * percentage;
      hunter.averageAffinity += averageAffinity * percentage;
      hunter.averageElementalMultiplier += averageElementalMultiplier * percentage;
      hunter.averageElementalAdditive += averageElementalAdditive * percentage;

      return;
    }

    let skill = null;
    let triggerEffects = null;
    const triggerKey = hunter.trigger[index].key;
    const level = hunter.trigger[index].level;
    const [category, key] = triggerKey.split("-");
    if (category == "buff") {
      skill = data.buff[key].options[level - 1];
      triggerEffects = data.buff[key].options[level - 1].triggerEffect;
    } else {
      skill = data.skill[category][key];
      triggerEffects = data.skill[category][key].triggerEffect[level - 1]
    }

    if (!skill) {
      console.error(`Skill not found: ${hunter.trigger[index].key}`);
      return;
    }

    let totalCoverage = 0;
    for (let i = skill.triggerLevel; i > 0; i--) {
      const coverage = document.getElementById(`trigger-${triggerKey}-coverage-${i - 1}`).value / 100.0;
      const realCoverage = coverage - totalCoverage;
      totalCoverage = coverage;
      logBox.innerHTML += " ".repeat(index) + `Trigger ${hunter.trigger[index].key} - ${i}, level/option ${level}: ${realCoverage * 100}%\n`;
      const triggerEffect = triggerEffects[i - 1];
      applyEffect(triggerEffect);

      goThroughTrigger(index + 1, realCoverage * percentage);

      removeEffect(triggerEffect);
    }

    logBox.innerHTML += " ".repeat(index) + `Trigger ${hunter.trigger[index].key} - 0, level/option ${level}: ${(1 - totalCoverage) * 100}%\n`;
    goThroughTrigger(index + 1, (1 - totalCoverage) * percentage);
  }

  function calculateDPS() {
    calculateHunterFinalStats();
    logBox.innerHTML += " ".repeat(hunter.trigger.length + 1) + `Attack: ${hunter.finalAttack}, Elemental attack: ${hunter.ammo.baseElemental}, Affinity: ${hunter.finalAffinity}\n`;

    const ignition = data.action.hbg[ignitionType.value]

    let totalDamage = 0;
    let totalPhysicalDamage = 0;
    let totalElementalDamage = 0;
    let totalIgnitionDamage = 0;
    let averageAttack = 0;
    let averageAffinity = 0;
    let averageElementalMultiplier = 0;
    let averageElementalAdditive = 0;
    let cycleTime = hunter.cycleTime;
    let intervalDamageEffectiveTime = hunter.cycleTime;
    for (let bullet = 1; bullet <= hunter.ammo.ammo; bullet++) {
      const physicalAttack =
        hunter.finalAttack +
        (bullet == 1 ? hunter.attackOpening : 0) +
        ((bullet == 4 || bullet == 6) ? hunter.attackTetrad : 0);
      averageAttack += physicalAttack;

      const affinity = Math.min(1,
        hunter.finalAffinity +
        (hunter.status.recovered ? 0.15 + hunter.affinityRecovered : 0) +
        (bullet >= 4 ? hunter.affinityTetrad : 0)
      );
      averageAffinity += affinity;

      let physicalAffinityMultipler = 1;
      if (affinity > 0) {
        physicalAffinityMultipler = 1 + affinity * (hunter.criticalDamage - 1);
      } else if (affinity < 0) {
        physicalAffinityMultipler = (1 + -affinity * (0.75 - 1))
      }
      let elementalAffinityMultipler = 1;
      if (affinity > 0) {
        elementalAffinityMultipler = 1 + affinity * (hunter.elementalCriticalDamage - 1);
      }

      let physicalFinalDamageMultiplier = hunter.finalDamageMultiplier;
      if (["normal", "pierce", "spread"].includes(hunter.ammo.type)) {
        physicalFinalDamageMultiplier *= hunter[`${hunter.ammo.type}DamageMultiplier`];
        if (hunter.ammo.enhancement.type == "standard") {
          physicalFinalDamageMultiplier *= hunter.ammo.enhancement.level * 0.1 + 1;
        }
      }

      const elementalFinalDamageMultiplier = hunter.finalDamageMultiplier;
      const elementalMultiplier =
        hunter.elementalMultiplier *
        hunter[`${hunter.ammo.elementalType}Multiplier`] *
        (bullet == 1 ? hunter.elementalMultiplierOpening : 1) *
        (bullet == 4 || bullet == 6 ? hunter.elementalMultiplierTetrad : 1);
      averageElementalMultiplier += elementalMultiplier;

      const elementalAdditive = hunter[`${hunter.ammo.elementalType}`];
      averageElementalAdditive += elementalAdditive;

      let physicalDamage = 0;
      let elementalDamage = 0;

      for (let hit = 0; hit < hunter.ammo.damage.length; hit++) {
        const damageInfo = hunter.ammo.damage[hit];

        physicalDamage += (
          damageInfo.value / 100 * physicalAttack * document.getElementById(`${damageInfo.type}-hitzone-value`).value / 100 *
          physicalAffinityMultipler *
          physicalFinalDamageMultiplier
        ).toFixed(2) * damageInfo.hit;

        if (hunter.ammo.elementalType != "") {
          elementalDamage += (
            (hunter.finalAttack / 100 * hunter.ammo.baseElemental / 10 * elementalMultiplier + elementalAdditive) * elementalHitZoneValue.value / 100 *
            elementalAffinityMultipler *
            elementalFinalDamageMultiplier
          ).toFixed(2) * damageInfo.hit;
        }
      }

      totalDamage += physicalDamage + elementalDamage;
      totalPhysicalDamage += physicalDamage;
      totalElementalDamage += elementalDamage;
    }

    const damagePerHit = totalDamage / hunter.ammo.ammo;

    if (useIgnition.checked) {
      const totalBulletHits = hunter.ammo.damage.reduce((acc, damageInfo) => acc + damageInfo.hit, 0);
      const ignitionRecoveryFromBulletsPerSecond = hunter.ammo.ammo * hunter.ammo.ignitionRecovery * totalBulletHits / hunter.cycleTime;
      const ignitionRecoverTime = hunter.ignitionGauge / ((ignitionRecoveryFromBulletsPerSecond + hunter.ignitionNatureRecovery * hunter.ignitionNatureRecoveryMultiplier) * ignitionLevelRecoveryMultiplier[hunter.ignitionRecoveryLevel - 1]);
      totalDamage = totalDamage / cycleTime * ignitionRecoverTime;
      totalPhysicalDamage = totalPhysicalDamage / cycleTime * ignitionRecoverTime;
      totalElementalDamage = totalElementalDamage / cycleTime * ignitionRecoverTime;
      cycleTime = ignitionRecoverTime + ignition.time;
      intervalDamageEffectiveTime = ignitionRecoverTime;

      let affinityMultipler = 1;
      if (hunter.finalAffinity > 0) {
        affinityMultipler = 1 + hunter.finalAffinity * (hunter.criticalDamage - 1);
      } else if (hunter.finalAffinity < 0) {
        affinityMultipler = (1 + -hunter.finalAffinity * (0.75 - 1))
      }

      let ignitionDamageMultiplier = hunter.finalDamageMultiplier * hunter.specialAmmoDamageMultiplier;
      if (hunter.ammo.enhancement.type == "ignition") {
        ignitionDamageMultiplier *= hunter.ammo.enhancement.level * 0.1 + 1;
      }

      for (let hit = 0; hit < ignition.damage.length; hit++) {
        const damageInfo = ignition.damage[hit];

        const ignitionDamage = (
          damageInfo.value / 100 * hunter.finalAttack * document.getElementById(`${damageInfo.type}-hitzone-value`).value / 100 *
          affinityMultipler *
          ignitionDamageMultiplier
        ).toFixed(2) * damageInfo.hit;

        totalDamage += ignitionDamage;
        totalPhysicalDamage += ignitionDamage;
        totalIgnitionDamage += ignitionDamage;
      }
    }

    let totalIntervalDamage = 0;
    for (let i = 0; i < hunter.intervalDamage.length; i++) {
      for (let hit = 0; hit < hunter.intervalDamage[i].damage.length; hit++) {
        const damageInfo = hunter.intervalDamage[i].damage[hit];

        if (damageInfo.type === "fixed") {
          totalIntervalDamage += damageInfo.value * damageInfo.hit;
        }
      }
    }
    totalIntervalDamage = totalIntervalDamage / intervalDamageGap.value * intervalDamageEffectiveTime;
    totalDamage += totalIntervalDamage;

    const dps = totalDamage / cycleTime;
    const ignitionDPS = totalIgnitionDamage / ignition.time;
    logBox.innerHTML += " ".repeat(hunter.trigger.length + 1) + `DPS: ${dps}\n`;
    return {
      dps: dps,
      dph: damagePerHit,
      ignitionDPS: ignitionDPS,
      ignitionDPA: totalIgnitionDamage,
      physicalPercentage: totalPhysicalDamage / totalDamage,
      elementalPercentage: totalElementalDamage / totalDamage,
      ignitionPercentage: totalIgnitionDamage / totalDamage,
      intervalDamagePercentage: totalIntervalDamage / totalDamage,
      averageAttack: averageAttack / hunter.ammo.ammo,
      averageAffinity: averageAffinity / hunter.ammo.ammo,
      averageElementalMultiplier: averageElementalMultiplier / hunter.ammo.ammo,
      averageElementalAdditive: averageElementalAdditive / hunter.ammo.ammo,
    };
  }


  function reset() {
    const params = new URLSearchParams();

    // Only include the current language in the URL
    params.set("lang", currentLanguage);

    // Update the URL
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    // Reload the page to reset all fields
    window.location.reload();
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

const hightlightExceptionList = [
  "weapon-type",
  "weapon",
  "ammo-type",
  "mod-1",
  "mod-2",
  "ignition-type",
  "artian-element-type-1",
  "artian-element-type-2",
  "artian-element-type-3",
  "artian-bonus-1",
  "artian-bonus-2",
  "artian-bonus-3",
  "artian-reinforcement-1",
  "artian-reinforcement-2",
  "artian-reinforcement-3",
  "artian-reinforcement-4",
  "artian-reinforcement-5",
]
document.body.addEventListener("change", (event) => {
  if (event.target.tagName === "SELECT" || event.target.type === "checkbox") {
    if (hightlightExceptionList.includes(event.target.id)) return;

    const group = event.target.closest(".group") || event.target.closest(".stat-group");
    if (group) {
      if ((event.target.tagName === "SELECT" && event.target.selectedIndex !== 0) ||
        (event.target.type === "checkbox" && event.target.checked)) {
        group.classList.add("highlight");
      } else {
        group.classList.remove("highlight");
      }
    }
  }
});
