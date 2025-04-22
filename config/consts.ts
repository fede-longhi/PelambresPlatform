export const TRACKING_CODE_LENGTH = 6;
export const TRACKING_CODE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

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