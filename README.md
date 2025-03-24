# Monster Hunter: World DPS Calculator

This project is a web-based DPS (Damage Per Second) calculator specifically designed for the Heavy Bowgun weapon type in Monster Hunter: World. It allows players to select their weapon and view various weapon statistics to optimize their gameplay.

## Project Structure

The project consists of the following files and directories:

- **src/**: Contains the source code for the web application.
  - **assets/**: Contains static assets such as CSS and JavaScript files.
    - **css/**: Contains styles for the web page.
      - `styles.css`: CSS styles defining the layout, colors, fonts, and other visual elements.
    - **js/**: Contains JavaScript code for the web application.
      - `main.js`: JavaScript logic for the DPS calculator, including functions to update weapon data and manage ammo types and levels.
  - **components/**: Contains HTML components for the application.
    - `weaponSelector.html`: HTML structure for the weapon type selection dropdown for the Heavy Bowgun.
    - `weaponData.html`: HTML structure for displaying weapon data such as base attack, base affinity, ammo type, ammo level, and enhancements.
  - `index.html`: The main entry point of the web application, integrating the weapon selector and weapon data components.

- **package.json**: Configuration file for npm, listing dependencies and scripts for the project.

## How to Set Up

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Open the `index.html` file in your web browser to view the DPS calculator.

## Usage

- Select the Heavy Bowgun from the dropdown menu.
- The weapon data will be displayed, including base attack, base affinity, ammo type, ammo level, and enhancements.
- Use the information to optimize your DPS in Monster Hunter: World.

## Contributing

Contributions are welcome! If you have suggestions for improvements or additional features, feel free to submit a pull request.

## License

This project is open-source and available under the MIT License.