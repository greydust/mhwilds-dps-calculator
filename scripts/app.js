document.addEventListener("DOMContentLoaded", () => {
  const weaponTypeSelect = document.getElementById("weapon-type");
  const weaponSelect = document.getElementById("weapon");
  const baseAttack = document.getElementById("base-attack");
  const affinity = document.getElementById("affinity");
  const ammoTypeSelect = document.getElementById("ammo-type");
  const enhancement1 = document.getElementById("enhancement-1");
  const enhancement2 = document.getElementById("enhancement-2");
  const languageSelector = document.getElementById("language-selector");

  let currentLanguage = getLanguageFromURL() || navigator.language.startsWith("zh") ? "zh" : "en";
  let weapons = [];
  let translation = {};

  const hunter = {
    baseAttack: 0,
    affinity: 0,
    ammo: [],
    skills: {}
  };

  // Fetch translations from the JSON file
  fetch("assets/data/translation.json")
    .then((response) => response.json())
    .then((data) => {
      translation = data;
      updatePageLanguage(); // Update page content initially
    })
    .catch((error) => console.error("Error loading translation:", error));

  // Fetch weapon data from the JSON file
  fetch("assets/data/hbg.json")
    .then((response) => response.json())
    .then((data) => {
      weapons = data;
      populateWeaponDropdown();
      updateWeaponStats(); // Ensure stats are updated for the first weapon after dropdown is populated
    })
    .catch((error) => console.error("Error loading weapon data:", error));

  // Populate weapon dropdown
  function populateWeaponDropdown() {
    weaponSelect.innerHTML = "";
    Object.keys(weapons).forEach((weaponKey) => {
      const weapon = weapons[weaponKey];
      const option = document.createElement("option");
      option.value = weaponKey; // Use the key as the value
      option.textContent = weapon.name[currentLanguage]; // Use the current language
      weaponSelect.appendChild(option);
    });
    updateWeaponStats(); // Update stats for the first weapon
  }

  // Update weapon stats when a weapon is selected
  weaponSelect.addEventListener("change", updateWeaponStats);

  function assignAmmoToHunter(weapon, ammoType) {
    if (weapon && weapon.ammo[ammoType]) {
      const ammoDetails = weapon.ammo[ammoType];
      hunter.ammo = {
        type: ammoType,
        level: ammoDetails.level,
        ammo: ammoDetails.ammo,
      };
    }
  }

  function updateWeaponStats() {
    const selectedWeaponKey = weaponSelect.value;
    const weapon = weapons[selectedWeaponKey];
    if (weapon) {
      hunter.baseAttack = weapon.baseAttack;
      hunter.affinity = weapon.affinity;

      // Update index.html fields
      baseAttack.textContent = hunter.baseAttack;
      affinity.textContent = `${hunter.affinity}%`;

      // Populate ammoTypeSelect with translations
      ammoTypeSelect.innerHTML = "";
      Object.entries(weapon.ammo).forEach(([type, details]) => {
        const option = document.createElement("option");
        option.value = type;
        const translatedType = translation[currentLanguage]?.ammo?.[type] || type; // Use translation or fallback to type
        option.textContent = `${translatedType} Lv${details.level}`;
        ammoTypeSelect.appendChild(option);
      });

      // Assign the first ammo type to hunter.ammo
      const firstAmmoType = Object.keys(weapon.ammo)[0];
      if (firstAmmoType) {
        assignAmmoToHunter(weapon, firstAmmoType);
      }

      enhancement1.innerHTML = "";
      enhancement2.innerHTML = "";
      if (weapon.enhancements) {
        weapon.enhancements.forEach((enh) => {
          const option1 = document.createElement("option");
          option1.value = enh;
          option1.textContent = enh;
          enhancement1.appendChild(option1);

          const option2 = document.createElement("option");
          option2.value = enh;
          option2.textContent = enh;
          enhancement2.appendChild(option2);
        });
      }
    } else {
      hunter.baseAttack = 0;
      hunter.affinity = 0;
      hunter.ammo = {};

      // Reset index.html fields
      baseAttack.textContent = "-";
      affinity.textContent = "-";

      ammoTypeSelect.innerHTML = "";
      enhancement1.innerHTML = "";
      enhancement2.innerHTML = "";
    }
  }

  // Update hunter.ammo when ammo type is selected
  ammoTypeSelect.addEventListener("change", () => {
    const selectedAmmoType = ammoTypeSelect.value;
    const selectedWeaponKey = weaponSelect.value;
    const weapon = weapons[selectedWeaponKey];
    assignAmmoToHunter(weapon, selectedAmmoType);
  });

  // Update the language when the selector changes
  languageSelector.addEventListener("change", () => {
    currentLanguage = languageSelector.value; // Update the current language
    updateURLWithLanguage(currentLanguage); // Update the URL
    updatePageLanguage(); // Update page content
    populateWeaponDropdown(); // Re-populate the weapon dropdown with the new language
  });

  // Update the page content based on the selected language
  function updatePageLanguage() {
    document.querySelectorAll("[data-lang]").forEach((element) => {
      const key = element.getAttribute("data-lang");
      if (translation[currentLanguage] && translation[currentLanguage][key]) {
        element.textContent = translation[currentLanguage][key];
      }
    });
    languageSelector.value = currentLanguage; // Update the language selector

    // Update weapon type selector dynamically
    const weaponTypeOption = document.querySelector("#weapon-type option[value='heavy-bowgun']");
    if (weaponTypeOption) {
      weaponTypeOption.textContent =
        translation[currentLanguage]?.["heavy-bowgun"] || "Heavy Bowgun";
    }
  }

  // Get the language from the URL
  function getLanguageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("lang");
  }

  // Update the URL with the selected language
  function updateURLWithLanguage(lang) {
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  // Set the default language based on the URL or browser settings
  currentLanguage = getLanguageFromURL() || defaultLang;
  languageSelector.value = currentLanguage;
  updatePageLanguage(); // Update page content initially
  populateWeaponDropdown();
});
