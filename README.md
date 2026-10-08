# Power Flow Card Plus – 2 Batterien

Fork von [flixlix/flixlix-cards](https://github.com/flixlix/flixlix-cards). Einziger Unterschied zum Original: Die **Power Flow Card Plus** kann eine zweite Batterie anzeigen (`entities.battery2`). Die Karte heißt im Dashboard „Power Flow Card Plus – 2 Batterien“ und hat den eigenen Typ `custom:power-flow-card-plus-2bat`, sie läuft also neben dem Original.

- `mode: separate` – eigener Kreis neben der ersten Batterie, beide über eine kleine Gabel angebunden. Jede Batterie zeigt ihren eigenen Ladestand und ihre eigene Leistung.
- `mode: combined` – beide Batterien in einem gemeinsamen Kreis, Leistung addiert, Ladestände nebeneinander (oder als Mittelwert mit `combined_state_of_charge: average`).

Lädt eine Batterie die andere, zählt das nicht als Fluss zum Haus oder Netz; im getrennten Modus sieht man es an der Gabel.

```yaml
type: custom:power-flow-card-plus-2bat
entities:
  grid:
    entity: sensor.netz_leistung
  solar:
    entity: sensor.pv_leistung
  battery:
    name: BYD
    entity: sensor.byd_leistung
    state_of_charge: sensor.byd_ladestand
  battery2:
    name: Marstek
    mode: separate
    entity: sensor.marstek_leistung
    state_of_charge: sensor.marstek_ladestand
```

### Im Editor

Dashboard bearbeiten → Karte hinzufügen → „Power Flow Card Plus – 2 Batterien“. Im Karten-Editor steht direkt unter „Batterie“ der Punkt **„Zweite Batterie“**: Modus wählen (eigener Kreis oder gemeinsamer Kreis), Leistungs-Entität und Ladezustand eintragen, fertig. Die Optionen für den gemeinsamen Kreis erscheinen erst, wenn dieser Modus gewählt ist.

Eine bestehende Karte des Originals übernimmst du, indem du im YAML-Editor `type: custom:power-flow-card-plus` in `type: custom:power-flow-card-plus-2bat` änderst.

Alle Optionen: [Second Battery Configuration](packages/flixlix-cards/power-flow-card-plus/README.md#second-battery-configuration).

### Installation

**HACS:** HACS → Benutzerdefinierte Repositories → `https://github.com/Marcels-Custom-Coding/power-flow-card-plus-2bat`, Typ „Dashboard“. Das Original darf installiert bleiben.

**Ohne HACS:** [`dist/power-flow-card-plus-2bat.js`](dist/power-flow-card-plus-2bat.js) nach `/config/www/` kopieren und als Dashboard-Ressource `/local/power-flow-card-plus-2bat.js` (JavaScript-Modul) eintragen.

### Selbst bauen

```bash
corepack pnpm install --filter power-flow-card-plus...
cd packages/flixlix-cards/power-flow-card-plus && corepack pnpm exec rollup -c
cp dist/power-flow-card-plus.js ../../../dist/power-flow-card-plus-2bat.js
```

---

# Flixlix Cards

This is a monorepo for all my Home Assistant cards, including their source code, release management, and documentation.

> [!TIP]
> 📖 **Full documentation lives at [cards.flixlix.com](https://cards.flixlix.com)** — installation, configuration reference, an interactive configurator, and copy-pasteable examples for every card.

## Cards

- **Power Flow Card Plus** — [docs](https://cards.flixlix.com/power-flow-card-plus) · [README](packages/flixlix-cards/power-flow-card-plus/README.md)
- **Energy Flow Card Plus** — [docs](https://cards.flixlix.com/energy-flow-card-plus) · [README](packages/flixlix-cards/energy-flow-card-plus/README.md)
- **Energy Breakdown Card** — [docs](https://cards.flixlix.com/energy-breakdown-card) · [README](packages/flixlix-cards/energy-breakdown-card/README.md)

![demo_power_flow_card_plus](https://user-images.githubusercontent.com/61006057/227771568-78497ecc-e863-46f2-b29e-e15c7c20a154.gif)
![demo_energy_flow_card_plus](https://github.com/flixlix/energy-flow-card-plus/assets/61006057/d3650e8a-1c82-4993-9951-18c04fbdf4d6)
![demo_breakdown_card](https://github.com/user-attachments/assets/c8fe8f63-9680-4507-bccd-8e792322c165)

## Issues and Feature Requests

Have feedback, feature ideas, or encountered a problem? We encourage you to open an issue in this repository. 
When submitting, simply select the relevant card so I can assist you more efficiently.
[Open an issue](https://github.com/flixlix/flixlix-cards/issues/new/choose)

## Contributing

Contributions are welcome! Check out the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information, or read the [How to contribute](https://cards.flixlix.com/contributing) guide on the docs site.

## License

This project is released under the [MIT License](LICENSE). You are free to use, fork, modify, and redistribute the cards, including through HACS.
