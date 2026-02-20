# Circadian Lighting Feature - Implementation Plan

## Issue Reference
- **Issue:** #2304 - Feature request: Circadian Lighting
- **URL:** https://github.com/reef-pi/reef-pi/issues/2304

## Overview
Add circadian rhythm lighting support to reef-pi that automatically adjusts RGB lights based on time of day and user's geographic location (latitude/longitude), similar to Home Assistant's circadian lighting component.

## Feature Requirements
1. User can enable circadian lighting mode for any light channel
2. User specifies their latitude/longitude coordinates
3. User sets minimum and maximum brightness levels
4. System calculates sun position and adjusts light intensity throughout the day
5. Works alongside existing daylight and lunar cycle modes

## Implementation Plan

### 1. Create PWM Profile (`controller/pwm_profile/circadian.go`)
- New `circadian` struct implementing `Profile` interface
- Uses solar position algorithm (based on NOAA solar calculations)
- Config fields:
  - `Latitude` (float64): User's latitude (-90 to 90)
  - `Longitude` (float64): User's longitude (-180 to 180)
  - `StartHour` (int): When lighting ramp up begins (default: 6)
  - `EndHour` (int): When lighting ramps down (default: 22)
- Returns intensity 0-100% based on time of day

### 2. Register Profile in Factory (`controller/pwm_profile/factory.go`)
- Add `_circadianProfileName = "circadian"` constant
- Add case in `CreateProfile()` switch statement

### 3. Update Frontend (React)
- Add "Circadian" option to light channel profile type dropdown
- Add input fields for latitude/longitude (or use browser geolocation)
- Add start/end hour settings
- Store settings in `ProfileSpec.Config`

## Solar Position Algorithm
Simple approximation (noon = max intensity):
```
hourAngle = (hour - 12) * 15°  // 15° per hour
zenith = acos(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(hourAngle))
intensity = max(0, cos(zenith)) scaled to min/max brightness
```

## File Changes
1. `controller/pwm_profile/circadian.go` (NEW)
2. `controller/pwm_profile/factory.go` (MODIFY)
3. Frontend: Add circadian option to light channel form

## Testing
1. Unit test with known lat/long and times
2. Manual test with real hardware
3. Verify smooth transitions between day/night

## Notes
- Circadian profile can coexist with lunar - user selects which profile to use per channel
- Similar structure to existing `lunar.go` profile
