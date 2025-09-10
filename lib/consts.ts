export const MODELS_FOLDER = 'models';
export const GCODE_FOLDER = 'gcode';
export const TRACKING_CODE_LENGTH = 6;
export const TRACKING_CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
export const ITEMS_PER_PAGE = 6;

export const FAIL_REASONS = [
    { value: "warping", label: "Warping" },
    { value: "under_extrusion", label: "Under-extrusion" },
    { value: "layer_shift", label: "Layer shift" },
    { value: "nozzle_clog", label: "Nozzle clog" },
    { value: "bed_adhesion", label: "Bed adhesion failure" },
    { value: "power_loss", label: "Power loss" },
    { value: "mechanical_failure", label: "Mechanical failure" },
    { value: "filament_runout", label: "Filament runout" },
    { value: "overheating", label: "Overheating" },
    { value: "design_fail", label: "Design Fail" },
    { value: "customer_cancel", label: "Cancelled by customer" },
    { value: "other", label: "Other" },
];

export const FILAMENT_TYPES = [
    {
        name: "pla",
        label: "PLA"
    },
    {
        name: "petg",
        label: "PET-G"
    },
    {
        name: "tpu",
        label: "TPU"
    },
];

export const CONFIGURATION_VARIABLE_DATA_TYPES = [
    {
        name: "number",
        label: "number"
    },
    {
        name: "text",
        label: "text"
    },
    {
        name: "boolean",
        label: "boolean"
    }
];
