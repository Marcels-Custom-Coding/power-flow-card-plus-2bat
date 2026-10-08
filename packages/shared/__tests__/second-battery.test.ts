import { describe, expect, test } from "vitest";

import {
  averageStateOfCharge,
  combineBatteryFlows,
  computeBatteryIcon,
  computeBatteryUnitStyle,
  getBatteryMode,
} from "../src/utils/compute-second-battery";

describe("second battery", () => {
  test("both batteries charging add up", () => {
    expect(
      combineBatteryFlows({ toBattery: 1000, fromBattery: 0 }, { toBattery: 800, fromBattery: 0 })
    ).toEqual({ toBattery: 1800, fromBattery: 0, batteryToBattery: 0 });
  });

  test("both batteries discharging add up", () => {
    expect(
      combineBatteryFlows({ toBattery: 0, fromBattery: 700 }, { toBattery: 0, fromBattery: 400 })
    ).toEqual({ toBattery: 0, fromBattery: 1100, batteryToBattery: 0 });
  });

  test("power moving from one battery into the other is not counted twice", () => {
    expect(
      combineBatteryFlows({ toBattery: 0, fromBattery: 1500 }, { toBattery: 1000, fromBattery: 0 })
    ).toEqual({ toBattery: 0, fromBattery: 500, batteryToBattery: 1000 });
    expect(
      combineBatteryFlows({ toBattery: 1200, fromBattery: 0 }, { toBattery: 0, fromBattery: 300 })
    ).toEqual({ toBattery: 900, fromBattery: 0, batteryToBattery: 300 });
  });

  test("mode defaults to separate", () => {
    expect(getBatteryMode(undefined)).toBe("separate");
    expect(getBatteryMode("something")).toBe("separate");
    expect(getBatteryMode("combined")).toBe("combined");
  });

  test("average state of charge ignores missing values", () => {
    expect(averageStateOfCharge([70, 40])).toBe(55);
    expect(averageStateOfCharge([null, 40])).toBe(40);
    expect(averageStateOfCharge([null, null])).toBeNull();
  });

  test("battery icon follows state of charge like the single battery", () => {
    expect(computeBatteryIcon(null)).toBe("mdi:battery");
    expect(computeBatteryIcon(90)).toBe("mdi:battery-high");
    expect(computeBatteryIcon(72)).toBe("mdi:battery-medium");
    expect(computeBatteryIcon(44)).toBe("mdi:battery-low");
    expect(computeBatteryIcon(16)).toBe("mdi:battery-outline");
  });

  test("each separate circle is colored by its own direction", () => {
    const charging = computeBatteryUnitStyle(undefined, { toBattery: 500, fromBattery: 0 });
    const discharging = computeBatteryUnitStyle(undefined, { toBattery: 0, fromBattery: 500 });
    expect(charging).toContain("--circle-battery-color: var(--energy-battery-in-color)");
    expect(discharging).toContain("--circle-battery-color: var(--energy-battery-out-color)");
    expect(
      computeBatteryUnitStyle({ color_circle: "no_color" } as any, {
        toBattery: 0,
        fromBattery: 500,
      })
    ).toContain("--circle-battery-color: var(--energy-battery-in-color)");
  });
});
