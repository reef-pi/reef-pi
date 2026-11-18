# Stepper dosing pumps

reef-pi can drive a stepper-motor dosing pump through a **DRV8825**-style stepper driver board. Unlike a
DC pump, a stepper pump is configured by *volume*: you say how many millilitres to dose and reef-pi
works out the number of motor steps. This page describes how the stepper doser is set up and what each
setting does (see `controller/modules/doser/stepper.go` for the implementation).

## Wiring model

reef-pi talks to the driver board only through **outlets** (digital outputs, see Configuration >
Connectors). Create one outlet per control line before adding the pump:

| Driver board pin | reef-pi setting | Required |
|---|---|---|
| STEP | Step Pin | yes |
| DIR | Direction Pin | yes |
| MODE0 / MS1 | MicroStepping Pin A | yes |
| MODE1 / MS2 | MicroStepping Pin B | yes |
| MODE2 / MS3 | MicroStepping Pin C | yes |

The outlets can live on any driver that provides digital outputs (for example the Raspberry Pi GPIO
driver or a PCA9685). Power the motor from its own supply, not from the Pi.

All three microstepping pins are mandatory: the backend rejects a stepper pump whose pin A, B or C is
empty ("micro stepping pin A is not defined"), and on every dose reef-pi writes all three pins. There is
currently no way to omit them. If you hard-wire the mode pins on your board, create three spare outlets
for them, leave those GPIOs unconnected, and set *Microstepping* to match the mode you wired (it also
scales the step count and delay, see below). This workaround is untested; please report back if it
works for you.

## Settings

| Setting | Meaning |
|---|---|
| Volume | Millilitres delivered per scheduled dose (must be at least 1). |
| Steps Per Rotation (SPR) | Full steps per motor revolution (200 for a 1.8 degree motor). Must be positive. |
| Volume Per Rotation (VPR) | Millilitres pumped per revolution, found by calibration. Must be positive. |
| Delay | Pause in **nanoseconds** between the step pin changing state: each step is a high pulse of `delay` followed by a low pulse of `delay`. Must be positive; smaller is faster. |
| Direction | Level written to the direction pin before stepping; flip it if the pump runs backwards. |
| Microstepping | `Full`, `Half`, `1/4`, `1/8`, `1/16` or `1/32` (default if unset). |
| Schedule | The usual cron-style schedule (month, week, day, hour, minute, second); the second field cannot be `*`. |

## Microstepping

Before stepping, reef-pi drives the mode pins (A, B, C) as below, divides `delay` by the step divisor
and multiplies the step count by it, so the dose volume stays the same in every mode:

| Mode | A | B | C | Divisor |
|---|---|---|---|---|
| Full | 0 | 0 | 0 | 1 |
| Half | 1 | 0 | 0 | 2 |
| 1/4 | 0 | 1 | 0 | 4 |
| 1/8 | 1 | 1 | 0 | 8 |
| 1/16 | 0 | 0 | 1 | 16 |
| 1/32 | 1 | 0 | 1 | 32 |

These levels match the DRV8825 datasheet mode table.

## How a dose is computed

```
steps  = (volume / VPR) * SPR * 4
pulses = steps * divisor            # divisor from the microstepping table
```

Each pulse is a high period and a low period of `delay` nanoseconds, so a dose takes about
`2 * pulses * delay / divisor` of wall-clock time. (The constant factor 4 is part of the existing
implementation.)

## Calibrating

For a stepper pump the *Calibrate* action runs one test dose of the volume you enter (it does not save
anything for stepper pumps, unlike DC pumps). Use it to tune Volume Per Rotation:

1. Enter a rough VPR from the pump's datasheet, then press *Calibrate* with a test volume (for example
   10 mL) and collect what the pump delivers in a measuring cup.
2. Compute `new VPR = old VPR * delivered / requested` and save it on the pump.
3. Repeat until the delivered volume matches the requested one.

## Troubleshooting

- **"The settings cannot be saved due to validation errors"**: every stepper field must be filled in:
  both pins, all three microstepping pins, SPR, VPR, delay and a volume of at least 1, plus a complete
  schedule. The invalid fields are highlighted in the form.
- **Runs the wrong way**: toggle *Direction*.
- **Motor stalls or buzzes**: increase *Delay* (a slower step rate), or lower the microstepping divisor.
- **Pump shows as in use / errors on dose**: check Configuration > Errors; an outlet that was deleted or
  reassigned makes the dose fail with the missing pin's id.
