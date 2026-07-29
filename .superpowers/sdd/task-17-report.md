# Task 17 Report: Solicitud Form Business Day Validation

## What was implemented
Replaced calendar-day diff with `diasHabilesEntre` from `business-days.ts` in the `excedeLimite` computed signal. Added `diasDesdeParcial` computed signal and exposed `Supletorio` namespace (with `DIAS_LIMITE = 5`) to the template. Updated the warning message to show the exact business-day count.

## Build verification
Production build passes — only pre-existing budget warning (558.76 kB vs 500 kB limit). No compilation errors.

## Files changed
- `frontend/src/app/models/supletorio.model.ts` — Added `Supletorio` namespace with `DIAS_LIMITE = 5`
- `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.ts` — Added imports for `Supletorio` and `diasHabilesEntre`; replaced `excedeLimite` to use business days; added `diasDesdeParcial`; removed old `diasLimite` property
- `frontend/src/app/features/estudiante/solicitud-supletorio/solicitud-supletorio.component.html` — Updated warning to show business-day count and use `Supletorio.DIAS_LIMITE`

## Self-review findings
- The `fechaActual` signal is now unused in `excedeLimite` (which uses `new Date()` directly). Left in place since it may be used by other logic in the future, but could be cleaned up.
- The component references `Supletorio` as `readonly Supletorio = Supletorio` to make the namespace accessible from the template — standard Angular pattern for exposing static constants.

## Issues or concerns
None.
