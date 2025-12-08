# Default Values Configuration Guide

## Overview
The "Details of the Equipment" and "Required Value" fields are pre-populated with default values and set to readonly. Users only need to fill in:
- Name/Number
- Date of Commissioning
- Observed Value
- Remarks
- Images

## How to Update Default Values

Edit the `DEFAULT_VALUES` object in `station_create.js` file (around line 30-50).

### Current Configuration Structure:

```javascript
const DEFAULT_VALUES = {
  quarterly_check: [
    { details: "Signalling and Interlocking Plan ", required_value: "There shall not be any change in the SIP No. " },
    { details: "Equipment 2 Details", required_value: "Required Value 2" },
    // ... up to 8 rows
  ],
  daily_monthly: [
    // ... similar structure
  ],
  quarterly_half: [
    // ... similar structure
  ]
};
```

### Example: Update Quarterly Check Defaults

```javascript
const DEFAULT_VALUES = {
  quarterly_check: [
    { details: "Transformer Oil Level", required_value: "Above minimum mark" },
    { details: "Battery Voltage", required_value: "12.5V - 13.8V" },
    { details: "Cooling Fan Operation", required_value: "Normal operation" },
    { details: "Temperature Reading", required_value: "Below 40°C" },
    { details: "Pressure Gauge", required_value: "Within normal range" },
    { details: "Circuit Breaker Status", required_value: "Closed position" },
    { details: "Ground Resistance", required_value: "Less than 5 ohms" },
    { details: "Insulation Resistance", required_value: "Greater than 1 MΩ" }
  ],
  // ... other modules
};
```

## Notes:
- Each module can have up to 8 rows
- The `details` field is for "Details of the Equipment"
- The `required_value` field is for "Required Value"
- These fields are automatically set to readonly
- Users cannot modify these default values
- When loading saved data, defaults are preserved if no saved value exists

