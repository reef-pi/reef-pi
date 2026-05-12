---
title: "Sign-in confidence card (device + version + network)"
labels: ["type: feature", "area: shell", "priority: p2", "estimate: S"]
parent: "[EPIC] Shell + theming — sidebar, dark/actinic, empty states"
---

# Sign-in confidence card

Below the sign-in form, surface a small card that confirms the user is about to sign into the right controller.

## Spec
```
reef-pi
192.168.1.40 · v5.2.0
Raspberry Pi 4 Model B · up 4 days
```
- Fetched from unauthenticated `/api/meta` (name, IP, version, device, uptime).
- Muted type, bordered card, centered under the form.

## Acceptance
- [ ] If the endpoint fails, card hides silently (no error banner).
- [ ] Accessible: `<footer aria-label="Controller info">`.
