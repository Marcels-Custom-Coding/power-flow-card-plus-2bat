import {
  type CardMainContext,
  type ConfigEntities,
  type FlowCardPlusConfig,
} from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { batteryElement } from "./battery";

/* the fork leaves the point where all battery lines meet and ends on top of each battery circle */
const FORK_WIDTH = 176;
const FORK_HEIGHT = 20;
const CIRCLE_CENTERS = { battery: 40, battery2: FORK_WIDTH - 40 };
/* when the slot right of the batteries is taken, both circles move left by half a circle distance */
export const BATTERY_SPLIT_SHIFT = (CIRCLE_CENTERS.battery2 - CIRCLE_CENTERS.battery) / 2;

const forkPath = (field: "battery" | "battery2", shiftLeft: boolean) => {
  const start = FORK_WIDTH / 2 + (shiftLeft ? BATTERY_SPLIT_SHIFT : 0);
  const end = CIRCLE_CENTERS[field];
  return `M${start},0 C${start},${FORK_HEIGHT * 0.6} ${end},${FORK_HEIGHT * 0.4} ${end},${FORK_HEIGHT}`;
};

const forkBranch = (
  config: FlowCardPlusConfig,
  unit: any,
  field: "battery" | "battery2",
  shiftLeft: boolean
) => {
  const power = Math.max(unit.state.toBattery ?? 0, unit.state.fromBattery ?? 0);
  if (!showLine(config, power)) return nothing;
  const charging = (unit.state.toBattery ?? 0) > (unit.state.fromBattery ?? 0);
  const direction = charging ? "battery-fork-in" : "battery-fork-out";
  return svg`<path
      id="battery-fork-${field}"
      class="${direction} ${styleLine(power, config)}"
      d="${forkPath(field, shiftLeft)}"
    ></path>
    ${checkShouldShowDots(config) && power > 0
      ? svg`<circle r="1.75" class="${direction}">
            <animateMotion
              dur="${unit.dur}s"
              repeatCount="indefinite"
              calcMode="paced"
              keyPoints="${charging ? "0;1" : "1;0"}"
              keyTimes="0;1"
            >
              <mpath href="#battery-fork-${field}" xlink:href="#battery-fork-${field}" />
            </animateMotion>
          </circle>`
      : nothing}`;
};

export const batterySplitElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  {
    units,
    entities,
    shiftLeft = false,
  }: { units: [any, any]; entities: ConfigEntities; shiftLeft?: boolean }
) => {
  return html`<div class="battery-split ${shiftLeft ? "shift-left" : ""}">
    <svg
      class="battery-fork"
      width=${FORK_WIDTH}
      height=${FORK_HEIGHT}
      viewBox="0 0 ${FORK_WIDTH} ${FORK_HEIGHT}"
    >
      ${forkBranch(config, units[0], "battery", shiftLeft)}
      ${forkBranch(config, units[1], "battery2", shiftLeft)}
    </svg>
    <div class="battery-split-circles">
      ${batteryElement(main, config, {
        battery: units[0],
        entities,
        field: "battery",
        style: units[0].style,
      })}
      ${batteryElement(main, config, {
        battery: units[1],
        entities,
        field: "battery2",
        style: units[1].style,
      })}
    </div>
  </div>`;
};
