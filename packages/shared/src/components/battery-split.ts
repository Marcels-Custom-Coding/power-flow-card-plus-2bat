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

/* The battery lines run into one point a bit below the top of the fork (FORK_JUNCTION_Y), the
   fork splits from there to the top of each battery circle. Both parts are S-curves with vertical
   ends, so the lines flow into each other without a kink. */
const FORK_WIDTH = 176;
const FORK_HEIGHT = 36;
export const FORK_JUNCTION_Y = 14;
const CIRCLE_CENTERS = { battery: 40, battery2: FORK_WIDTH - 40 };
/* when the slot right of the batteries is taken, both circles move left by half a circle distance */
export const BATTERY_SPLIT_SHIFT = (CIRCLE_CENTERS.battery2 - CIRCLE_CENTERS.battery) / 2;

export const forkJunctionX = (shiftLeft: boolean) =>
  FORK_WIDTH / 2 + (shiftLeft ? BATTERY_SPLIT_SHIFT : 0);

/** a line from the visible end of a battery line down to the fork, in fork coordinates */
export type ForkLink = { d: string; stroke: string; opacity: string };

/** lowest point of a path that is still inside its (cropped) svg, in screen coordinates */
export const visibleLineEnd = (path: SVGPathElement): { x: number; y: number } | undefined => {
  const matrix = path.getScreenCTM();
  const box = path.ownerSVGElement?.getBoundingClientRect();
  if (!matrix || !box) return undefined;
  const length = path.getTotalLength();
  let lowest: { x: number; y: number } | undefined;
  for (let step = 0; step <= 200; step++) {
    const point = path.getPointAtLength((length * step) / 200);
    const x = point.x * matrix.a + point.y * matrix.c + matrix.e;
    const y = point.x * matrix.b + point.y * matrix.d + matrix.f;
    if (y > box.bottom + 0.5 || x < box.left - 0.5 || x > box.right + 0.5) continue;
    if (!lowest || y > lowest.y) lowest = { x, y };
  }
  return lowest;
};

const forkPath = (field: "battery" | "battery2", shiftLeft: boolean, offset: number) => {
  const start = forkJunctionX(shiftLeft) + offset;
  const end = CIRCLE_CENTERS[field];
  const middle = (FORK_JUNCTION_Y + FORK_HEIGHT) / 2;
  return `M${start},${FORK_JUNCTION_Y} C${start},${middle} ${end},${middle} ${end},${FORK_HEIGHT}`;
};

const forkBranch = (
  config: FlowCardPlusConfig,
  unit: any,
  field: "battery" | "battery2",
  shiftLeft: boolean,
  offset: number
) => {
  const power = Math.max(unit.state.toBattery ?? 0, unit.state.fromBattery ?? 0);
  if (!showLine(config, power)) return nothing;
  const charging = (unit.state.toBattery ?? 0) > (unit.state.fromBattery ?? 0);
  const direction = charging ? "battery-fork-in" : "battery-fork-out";
  return svg`<path
      id="battery-fork-${field}"
      class="${direction} ${styleLine(power, config)}"
      d="${forkPath(field, shiftLeft, offset)}"
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
    offset = 0,
    links = [],
  }: {
    units: [any, any];
    entities: ConfigEntities;
    shiftLeft?: boolean;
    /** horizontal distance in px between the fork center and the point where the lines meet */
    offset?: number;
    links?: ForkLink[];
  }
) => {
  return html`<div class="battery-split ${shiftLeft ? "shift-left" : ""}">
    <svg
      class="battery-fork"
      width=${FORK_WIDTH}
      height=${FORK_HEIGHT}
      viewBox="0 0 ${FORK_WIDTH} ${FORK_HEIGHT}"
    >
      ${links.map(
        (link) => svg`<path
            class="battery-fork-link"
            d="${link.d}"
            style="stroke: ${link.stroke}; opacity: ${link.opacity}"
          ></path>`
      )}
      ${forkBranch(config, units[0], "battery", shiftLeft, offset)}
      ${forkBranch(config, units[1], "battery2", shiftLeft, offset)}
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
