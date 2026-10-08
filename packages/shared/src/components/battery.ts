import {
  type CardMainContext,
  type ConfigEntities,
  type FlowCardPlusConfig,
} from "@flixlix-cards/shared/types";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { html, nothing } from "lit";

export const batteryElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  {
    battery,
    entities,
    field = "battery",
    style,
  }: {
    battery: any;
    entities: ConfigEntities;
    field?: "battery" | "battery2";
    style?: string;
  }
) => {
  const batteryConfig = entities[field];
  const disableEntityClick = config.clickable_entities === false;
  return html`<div
    class="circle-container battery ${field === "battery2" ? "battery2" : ""}"
    style=${style ?? nothing}
  >
    <div
      class="circle ${disableEntityClick ? "pointer-events-none" : ""}"
      @click=${(e: MouseEvent) => {
        const target = batteryConfig?.state_of_charge
          ? batteryConfig?.state_of_charge
          : typeof batteryConfig?.entity === "string"
            ? batteryConfig?.entity
            : batteryConfig?.entity.production;
        main.onEntityClick(e, battery, target);
      }}
      @dblclick=${(e: MouseEvent) => {
        const target = batteryConfig?.state_of_charge
          ? batteryConfig?.state_of_charge
          : typeof batteryConfig?.entity === "string"
            ? batteryConfig?.entity
            : batteryConfig?.entity.production;
        main.onEntityDoubleClick(e, battery, target);
      }}
      @pointerdown=${(e: PointerEvent) => {
        const target = batteryConfig?.state_of_charge
          ? batteryConfig?.state_of_charge
          : typeof batteryConfig?.entity === "string"
            ? batteryConfig?.entity
            : batteryConfig?.entity.production;
        main.onEntityPointerDown(e, battery, target);
      }}
      @pointerup=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @pointercancel=${(e: PointerEvent) => {
        main.onEntityPointerUp(e);
      }}
      @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
        if (e.key === "Enter") {
          const target = batteryConfig?.state_of_charge
            ? batteryConfig?.state_of_charge
            : typeof batteryConfig?.entity === "string"
              ? batteryConfig.entity
              : batteryConfig?.entity.production;
          main.openDetails(e, battery, target, "tap");
        }
      }}
    >
      <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
      ${battery.state_of_charge.state !== null && batteryConfig?.show_state_of_charge !== false
        ? html` <span
            @click=${(e: MouseEvent) => {
              main.onEntityClick(e, battery, batteryConfig?.state_of_charge);
            }}
            @dblclick=${(e: MouseEvent) => {
              main.onEntityDoubleClick(e, battery, batteryConfig?.state_of_charge);
            }}
            @pointerdown=${(e: PointerEvent) => {
              main.onEntityPointerDown(e, battery, batteryConfig?.state_of_charge);
            }}
            @pointerup=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @pointercancel=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                main.openDetails(e, battery, batteryConfig?.state_of_charge, "tap");
              }
            }}
            id="battery-state-of-charge-text"
          >
            ${displayValue(main.hass, config, battery.state_of_charge.state, {
              unit: battery.state_of_charge.unit ?? "%",
              unitWhiteSpace: battery.state_of_charge.unit_white_space,
              decimals: battery.state_of_charge.decimals,
              accept_negative: true,
            })}${battery.state_of_charge.second
              ? html`<span class="battery-soc-separator">·</span>${displayValue(
                    main.hass,
                    config,
                    battery.state_of_charge.second.state,
                    {
                      unit: battery.state_of_charge.second.unit ?? "%",
                      unitWhiteSpace: battery.state_of_charge.second.unit_white_space,
                      decimals: battery.state_of_charge.second.decimals,
                      accept_negative: true,
                    }
                  )}`
              : nothing}
          </span>`
        : nothing}
      ${battery.icon !== " "
        ? html` <ha-icon
            id="battery-icon"
            .icon=${battery.icon}
            @click=${(e: MouseEvent) => {
              main.onEntityClick(e, battery, batteryConfig?.state_of_charge);
            }}
            @dblclick=${(e: MouseEvent) => {
              main.onEntityDoubleClick(e, battery, batteryConfig?.state_of_charge);
            }}
            @pointerdown=${(e: PointerEvent) => {
              main.onEntityPointerDown(e, battery, batteryConfig?.state_of_charge);
            }}
            @pointerup=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @pointercancel=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                main.openDetails(e, battery, batteryConfig?.state_of_charge, "tap");
              }
            }}
          ></ha-icon>`
        : nothing}
      ${batteryConfig?.display_state === "two_way" ||
      batteryConfig?.display_state === undefined ||
      (batteryConfig?.display_state === "one_way_no_zero" && battery.state.toBattery > 0) ||
      (batteryConfig?.display_state === "one_way" && battery.state.toBattery !== 0)
        ? html`<span
            class="battery-in"
            @click=${(e: MouseEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.production!;

              main.onEntityClick(e, batteryConfig, target);
            }}
            @dblclick=${(e: MouseEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.production!;
              main.onEntityDoubleClick(e, batteryConfig, target);
            }}
            @pointerdown=${(e: PointerEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.production!;
              main.onEntityPointerDown(e, batteryConfig, target);
            }}
            @pointerup=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @pointercancel=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target =
                  typeof batteryConfig!.entity === "string"
                    ? batteryConfig!.entity!
                    : batteryConfig!.entity!.production!;

                main.openDetails(e, batteryConfig, target, "tap");
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-down"}></ha-icon>
            ${displayValue(main.hass, config, battery.state.toBattery, {
              unit: battery.unit,
              unitWhiteSpace: battery.unit_white_space,
              decimals: battery.decimals,
            })}</span
          >`
        : nothing}
      ${batteryConfig?.display_state === "two_way" ||
      batteryConfig?.display_state === undefined ||
      (batteryConfig?.display_state === "one_way_no_zero" && battery.state.fromBattery > 0) ||
      (batteryConfig?.display_state === "one_way" &&
        (battery.state.toBattery === 0 || battery.state.fromBattery !== 0))
        ? html`<span
            class="battery-out"
            @click=${(e: MouseEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.consumption!;

              main.onEntityClick(e, batteryConfig, target);
            }}
            @dblclick=${(e: MouseEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.consumption!;
              main.onEntityDoubleClick(e, batteryConfig, target);
            }}
            @pointerdown=${(e: PointerEvent) => {
              const target =
                typeof batteryConfig!.entity === "string"
                  ? batteryConfig!.entity!
                  : batteryConfig!.entity!.consumption!;
              main.onEntityPointerDown(e, batteryConfig, target);
            }}
            @pointerup=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @pointercancel=${(e: PointerEvent) => {
              main.onEntityPointerUp(e);
            }}
            @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
              if (e.key === "Enter") {
                const target =
                  typeof batteryConfig!.entity === "string"
                    ? batteryConfig!.entity!
                    : batteryConfig!.entity!.consumption!;

                main.openDetails(e, batteryConfig, target, "tap");
              }
            }}
          >
            <ha-icon class="small" .icon=${"mdi:arrow-up"}></ha-icon>
            ${displayValue(main.hass, config, battery.state.fromBattery, {
              unit: battery.unit,
              unitWhiteSpace: battery.unit_white_space,
              decimals: battery.decimals,
            })}</span
          >`
        : nothing}
    </div>
    <span class="label">${battery.name}</span>
  </div>`;
};
