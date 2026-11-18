# Telemetry metrics: ATO and inlet state

reef-pi emits module metrics through the telemetry subsystem (`controller/telemetry`). Every metric
is sent to each enabled sink: Prometheus (`/x/metrics`), Adafruit IO and MQTT.

## Naming

A metric has a *module* and a *name*. The sinks derive their identifiers from them:

| Sink | Identifier | Example for module `inlet`, name `Float Switch-state` |
|---|---|---|
| MQTT topic | `<prefix>/` + lower-case `<module>_<name>` with every character outside `[a-zA-Z0-9_]` replaced by `_` | `reef-pi/inlet_float_switch_state` |
| Prometheus gauge | the same sanitized `<module>_<name>` | `inlet_float_switch_state` |
| Adafruit IO feed | `<feed prefix><module>-<name>`, lower-cased, spaces to `-`, other characters stripped | `inlet-float-switch-state` |

The MQTT payload is the value formatted as a float (`%f`), for example `1.000000`. The MQTT prefix
(default `reef-pi`), QoS and retained flag come from Configuration > Telemetry.

## Inlet state (standalone and ATO-attached)

Both kinds of inlet publish a `0`/`1` state value, so downstream consumers (for example the Home
Assistant integration) get real-time updates without polling the API:

| Source | Module | Name | MQTT topic (default prefix) |
|---|---|---|---|
| ATO sensor (`controller/modules/ato`) | `ato` | `<ATO name>-state` | `reef-pi/ato_<ato_name>_state` |
| Standalone inlet (`controller/device_manager`) | `inlet` | `<inlet name>-state` | `reef-pi/inlet_<inlet_name>_state` |

Details of the standalone inlet publisher:

- Every inlet configured under Configuration > Connectors is read once per second.
- A state is published only when it **changes** (and once after startup), so a steady inlet produces
  no traffic; consumers that need the current value should subscribe with the retained flag enabled.
- If an MQTT publish fails, that inlet is retried every 5 seconds until the broker accepts the state;
  other inlets are unaffected, and the failure is also recorded in Configuration > Errors.
- An ATO's own inlet also appears as a standalone inlet, so it publishes under both `ato_..._state`
  (ATO semantics, per ATO check period) and `inlet_..._state` (raw sensor state).

ATO modules additionally publish `ato_<name>_usage`: the pump usage of the most recent hourly bucket, reported on each ATO check.

## Other module metrics

Temperature controllers publish `<tc name>_reading`, `_heater` and `_cooler`; pH probes publish
`ph_<probe name>`. They follow the same naming rules above.
