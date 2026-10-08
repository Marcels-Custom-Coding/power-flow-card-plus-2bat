import {
  type BaseConfigEntity,
  type ComboEntity,
  type GridPowerOutage,
  type IndividualDeviceType,
  type LovelaceCardConfig,
  type SecondaryInfoType,
} from "./type";

export type DisplayZeroLinesMode = "show" | "grey_out" | "transparency" | "hide" | "custom";

interface mainConfigOptions {
  dashboard_link?: string;
  dashboard_link_label?: string;
  second_dashboard_link?: string;
  second_dashboard_link_label?: string;
  min_flow_rate: number;
  max_flow_rate: number;
  clickable_entities: boolean;
  max_expected_power: number;
  min_expected_power: number;
  use_new_flow_rate_model?: boolean;
  base_decimals: number;
  kilo_decimals: number;
  kilo_threshold: number;
  mega_decimals: number;
  mega_threshold: number;
  full_size?: boolean;
  style_ha_card?: any;
  style_card_content?: any;
  disable_dots?: boolean;
  no_labels?: boolean;
  display_zero_lines?: {
    mode?: DisplayZeroLinesMode;
    transparency?: number;
    grey_color?: string | number[];
  };
  sort_individual_devices?: boolean;
  allow_layout_break?: boolean;
  /* LEGACY - JUST TO AVOID ERRORS */
  w_threshold?: number;
  w_decimals?: number;
  kw_decimals?: number;
  wh_threshold?: number;
  wh_kwh_threshold?: number;
  wh_decimals?: number;
  kwh_decimals?: number;
  mwh_decimals?: number;
}

export interface FlowCardPlusConfig extends LovelaceCardConfig, mainConfigOptions {
  entities: ConfigEntities;
}

export interface PowerFlowCardPlusConfig extends LovelaceCardConfig, mainConfigOptions {
  entities: ConfigEntities;
}

export interface EnergyFlowCardPlusConfig extends LovelaceCardConfig, mainConfigOptions {
  entities: ConfigEntities;
  collection_key?: string;
}

export type IndividualField = IndividualDeviceType[];

interface Battery extends BaseConfigEntity {
  state_of_charge?: string;
  state_of_charge_unit?: string;
  state_of_charge_unit_white_space?: boolean;
  state_of_charge_decimals?: number;
  show_state_of_charge?: boolean;
  display_zero?: boolean;
  color_state_of_charge_value?: "no_color" | "color_dynamically" | "production" | "consumption";
  color_circle: "color_dynamically" | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
}

interface SecondBattery extends Battery {
  /** separate: own circle next to the first battery, combined: both batteries share one circle */
  mode?: "separate" | "combined";
  /** only for mode separate: how the lines reach both batteries */
  split_style?: "group" | "bus" | "node";
  /** only for split_style group: state of charge of both batteries together, shown on the frame */
  group_state_of_charge?: string;
  /** only for split_style group: power of both batteries together, positive while discharging */
  group_power?: string;
  /** only for split_style group: group_power is positive while charging */
  group_invert_power?: boolean;
  /** only for mode combined: show both values or their average */
  combined_state_of_charge?: "both" | "average";
  /** only for mode combined: label below the shared circle */
  combined_name?: string;
}

interface Grid extends BaseConfigEntity {
  power_outage: GridPowerOutage;
  secondary_info?: SecondaryInfoType;
  display_zero?: boolean;
  color_circle: "color_dynamically" | "production" | "consumption";
  color_value?: boolean;
  color?: ComboEntity;
}

interface Solar extends BaseConfigEntity {
  entity: string;
  color?: any;
  color_icon?: boolean;
  color_value?: boolean;
  color_label?: boolean;
  secondary_info?: SecondaryInfoType & {
    sum_total?: boolean;
  };
  display_zero?: boolean;
  display_zero_state?: boolean;
}

interface Home extends BaseConfigEntity {
  entity: string;
  override_state?: boolean;
  color_icon?: boolean | "solar" | "grid" | "battery";
  color_value?: boolean | "solar" | "grid" | "battery";
  subtract_individual?: boolean;
  secondary_info?: SecondaryInfoType;
  circle_animation?: boolean;
  hide?: boolean;
}

interface FossilFuelPercentage extends BaseConfigEntity {
  entity: string;
  color?: string;
  state_type?: "percentage" | "power";
  color_icon?: boolean;
  display_zero?: boolean;
  display_zero_state?: boolean;
  display_zero_tolerance?: number;
  color_value?: boolean;
  color_label?: boolean;
  unit_white_space?: boolean;
  calculate_flow_rate?: boolean | number;
  secondary_info: SecondaryInfoType;
}

export type ConfigEntities = {
  battery?: Battery;
  battery2?: SecondBattery;
  grid?: Grid;
  solar?: Solar;
  home?: Home;
  fossil_fuel_percentage?: FossilFuelPercentage;
  individual?: IndividualField;
  individual1?: IndividualField;
  individual2?: IndividualField;
};

export type ConfigEntity =
  | Battery
  | SecondBattery
  | Grid
  | Solar
  | Home
  | FossilFuelPercentage
  | IndividualDeviceType;
