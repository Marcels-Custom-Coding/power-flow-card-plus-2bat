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

/* How the battery lines reach the two batteries:
   group – the lines meet on top of a frame around both batteries, like with a single battery
   bus   – the lines end on a short bar, two branches leave it towards the batteries
   node  – the lines run into a small ring, two branches leave it towards the batteries */
export type BatterySplitStyle = "group" | "bus" | "node";

export const getBatterySplitStyle = (style: string | undefined): BatterySplitStyle =>
  style === "bus" || style === "node" ? style : "group";

const FORK_WIDTH = 176;
const FORK_HEIGHT: Record<BatterySplitStyle, number> = { group: 20, bus: 36, node: 36 };
const JUNCTION_Y = 14;
const NODE_RADIUS = 7;
const CIRCLE_CENTERS = { battery: 40, battery2: FORK_WIDTH - 40 };
/* when the slot right of the batteries is taken, both circles move left by half a circle distance */
const BATTERY_SPLIT_SHIFT = (CIRCLE_CENTERS.battery2 - CIRCLE_CENTERS.battery) / 2;

/** where a battery line stops being visible, in fork coordinates */
export type LineEnd = { id: string; x: number; y: number; stroke: string; opacity: string };

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

const sCurve = (x1: number, y1: number, x2: number, y2: number) => {
  const middle = (y1 + y2) / 2;
  return `M${x1},${y1} C${x1},${middle} ${x2},${middle} ${x2},${y2}`;
};

/* the solar line comes straight down the middle, so it marks where the lines meet best */
const meetingX = (ends: LineEnd[], shiftLeft: boolean) => {
  const solar = ends.find((end) => end.id === "battery-solar");
  if (solar) return solar.x;
  if (ends.length) return ends.reduce((sum, end) => sum + end.x, 0) / ends.length;
  return FORK_WIDTH / 2 + (shiftLeft ? BATTERY_SPLIT_SHIFT : 0);
};

/* the frame is a pill: its top is only straight between its rounded ends (radius 56px, 8px
   padding and 1.5px border outside the 176px wide circle row), so the lines have to meet there */
const groupJunctionX = (x: number) => Math.min(Math.max(x, 48), FORK_WIDTH - 48);

const lineToHub = (style: BatterySplitStyle, end: LineEnd, x: number) => {
  if (style === "bus") return `M${end.x},${end.y} V${JUNCTION_Y}`;
  if (style === "node") {
    const angle = Math.atan2(end.y - JUNCTION_Y, end.x - x);
    return sCurve(
      end.x,
      end.y,
      x + NODE_RADIUS * Math.cos(angle),
      JUNCTION_Y + NODE_RADIUS * Math.sin(angle)
    );
  }
  return sCurve(end.x, end.y, groupJunctionX(x), FORK_HEIGHT.group);
};

const hub = (style: BatterySplitStyle, ends: LineEnd[], x: number, units: [any, any]) => {
  if (style === "bus") {
    const xs = ends.map((end) => end.x);
    const left = Math.min(x - 16, ...xs) - 6;
    const right = Math.max(x + 16, ...xs) + 6;
    return svg`<line
        class="battery-hub"
        x1="${left}"
        y1="${JUNCTION_Y}"
        x2="${right}"
        y2="${JUNCTION_Y}"
      ></line>`;
  }
  if (style === "node") {
    const toBattery = units.reduce((sum, unit) => sum + (unit.state.toBattery ?? 0), 0);
    const fromBattery = units.reduce((sum, unit) => sum + (unit.state.fromBattery ?? 0), 0);
    const direction = toBattery === fromBattery ? "idle" : toBattery > fromBattery ? "in" : "out";
    return svg`<circle class="battery-hub" cx="${x}" cy="${JUNCTION_Y}" r="${NODE_RADIUS}"></circle>
      <circle class="battery-hub-dot ${direction}" cx="${x}" cy="${JUNCTION_Y}" r="3"></circle>`;
  }
  return nothing;
};

const branchStart = (style: BatterySplitStyle, field: "battery" | "battery2", x: number) => {
  const side = field === "battery" ? -1 : 1;
  if (style === "node") return { x: x + side * 4, y: JUNCTION_Y + NODE_RADIUS - 1 };
  return { x: x + side * 12, y: JUNCTION_Y + 2 };
};

const branch = (
  config: FlowCardPlusConfig,
  style: BatterySplitStyle,
  unit: any,
  field: "battery" | "battery2",
  x: number
) => {
  const power = Math.max(unit.state.toBattery ?? 0, unit.state.fromBattery ?? 0);
  if (!showLine(config, power)) return nothing;
  const charging = (unit.state.toBattery ?? 0) > (unit.state.fromBattery ?? 0);
  const direction = charging ? "battery-fork-in" : "battery-fork-out";
  const start = branchStart(style, field, x);
  const end = CIRCLE_CENTERS[field];
  return svg`<path
      id="battery-fork-${field}"
      class="${direction} ${styleLine(power, config)}"
      d="${sCurve(start.x, start.y, end, FORK_HEIGHT[style])}"
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
    style = "group",
    shiftLeft = false,
    lineEnds = [],
  }: {
    units: [any, any];
    entities: ConfigEntities;
    style?: BatterySplitStyle;
    shiftLeft?: boolean;
    lineEnds?: LineEnd[];
  }
) => {
  const x = meetingX(lineEnds, shiftLeft);
  const circles = html`<div class="battery-split-circles">
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
  </div>`;
  return html`<div class="battery-split battery-split-${style} ${shiftLeft ? "shift-left" : ""}">
    <svg
      class="battery-fork"
      width=${FORK_WIDTH}
      height=${FORK_HEIGHT[style]}
      viewBox="0 0 ${FORK_WIDTH} ${FORK_HEIGHT[style]}"
    >
      ${lineEnds.map(
        (end) => svg`<path
            class="battery-fork-link"
            d="${lineToHub(style, end, x)}"
            style="stroke: ${end.stroke}; opacity: ${end.opacity}"
          ></path>`
      )}
      ${hub(style, lineEnds, x, units)}
      ${style === "group"
        ? nothing
        : svg`${branch(config, style, units[0], "battery", x)}
            ${branch(config, style, units[1], "battery2", x)}`}
    </svg>
    ${style === "group" ? html`<div class="battery-group-frame">${circles}</div>` : circles}
  </div>`;
};
