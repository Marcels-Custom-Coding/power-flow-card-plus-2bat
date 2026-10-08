export type BatteryUnitFlow = {
  toBattery: number;
  fromBattery: number;
};

export type BatteryMode = "separate" | "combined";

export const getBatteryMode = (mode: string | undefined): BatteryMode =>
  mode === "combined" ? "combined" : "separate";

/**
 * Combines two batteries into one virtual battery for the power distribution.
 * Power flowing from one battery straight into the other never reaches home, grid or solar,
 * so it is removed from both directions of the combined battery.
 */
export const combineBatteryFlows = (
  first: BatteryUnitFlow,
  second: BatteryUnitFlow
): BatteryUnitFlow & { batteryToBattery: number } => {
  const batteryToBattery =
    Math.min(first.fromBattery, second.toBattery) + Math.min(second.fromBattery, first.toBattery);

  return {
    toBattery: Math.max(first.toBattery + second.toBattery - batteryToBattery, 0),
    fromBattery: Math.max(first.fromBattery + second.fromBattery - batteryToBattery, 0),
    batteryToBattery,
  };
};

export const computeBatteryIcon = (stateOfCharge: number | null): string => {
  if (stateOfCharge === null) return "mdi:battery";
  if (stateOfCharge > 72) return "mdi:battery-high";
  if (stateOfCharge > 44) return "mdi:battery-medium";
  if (stateOfCharge > 16) return "mdi:battery-low";
  return "mdi:battery-outline";
};

export const averageStateOfCharge = (values: (number | null)[]): number | null => {
  const known = values.filter((value): value is number => value !== null);
  if (known.length === 0) return null;
  return known.reduce((sum, value) => sum + value, 0) / known.length;
};

type ColorChoice = string | boolean | undefined;

const dynamicColor = (choice: ColorChoice, flow: BatteryUnitFlow, fallback: string) => {
  if (choice === "consumption") return "var(--energy-battery-in-color)";
  if (choice === "production") return "var(--energy-battery-out-color)";
  if (choice === "color_dynamically")
    return flow.fromBattery >= flow.toBattery
      ? "var(--energy-battery-out-color)"
      : "var(--energy-battery-in-color)";
  return fallback;
};

/**
 * Per-circle colors for separate batteries, so each circle reacts to its own charging state
 * instead of the combined one. Mirrors the rules of allDynamicStyles.
 */
export const computeBatteryUnitStyle = (
  batteryConfig:
    | {
        color_icon?: ColorChoice;
        color_state_of_charge_value?: ColorChoice;
        color_circle?: ColorChoice;
      }
    | undefined,
  flow: BatteryUnitFlow
): string => {
  const circleChoice = batteryConfig?.color_circle;
  const circle =
    circleChoice === "no_color"
      ? "var(--energy-battery-in-color)"
      : dynamicColor(
          circleChoice === "consumption" || circleChoice === "production"
            ? circleChoice
            : "color_dynamically",
          flow,
          "var(--energy-battery-in-color)"
        );
  const icon = dynamicColor(batteryConfig?.color_icon, flow, "var(--primary-text-color)");
  const stateOfCharge = dynamicColor(
    batteryConfig?.color_state_of_charge_value,
    flow,
    "var(--primary-text-color)"
  );
  return `--circle-battery-color: ${circle}; --icon-battery-color: ${icon}; --text-battery-state-of-charge-color: ${stateOfCharge};`;
};

/* options that only change how a battery is shown, not which sensor it reads */
const INHERITED_DISPLAY_OPTIONS = [
  "display_state",
  "display_zero",
  "display_zero_tolerance",
  "color_value",
  "color_icon",
  "color_circle",
  "color_state_of_charge_value",
  "state_of_charge_unit",
  "state_of_charge_unit_white_space",
  "state_of_charge_decimals",
  "unit_of_measurement",
  "unit_white_space",
  "decimals",
] as const;

/**
 * The second battery looks like the first one unless it is configured differently,
 * e.g. display_state: one_way on the first battery also applies to the second.
 */
export const inheritBatteryDisplayOptions = <T extends Record<string, any>>(
  first: Record<string, any> | undefined,
  second: T
): T => {
  if (!first) return second;
  const inherited: Record<string, unknown> = {};
  INHERITED_DISPLAY_OPTIONS.forEach((option) => {
    if (first[option] !== undefined && second[option] === undefined) {
      inherited[option] = first[option];
    }
  });
  return { ...inherited, ...second } as T;
};
