# Character selection implementation plan
Spec: docs/superpowers/specs/2026-11-15-character-selection.md
Goal: youth character card selection with portraits before newrun, persistent identity, no unapproved numericalbuffs.
- [x] Backend: failing tests, identity/selection methods, legacy and newcheckpoint validation/carry; commit owned files.
- [x] UI: render three imagecards/name/job/specialty/bio, selection/confirm/cancel, desktop/mobile CSS, mock interaction tests; commit owned files.
- [x] Parent: generate teen2male/1female image, asset embedding/fingerprinting, connect real start/restart/Esc/debug/attribute/base/result, adapt existing start fixtures explicitlyselectdefault.
- [x] Verify selection desktop/mobile, actual image decoded, no overflow, cancel no start, mandatorypick, cross-act/reload carry and unchanged arena/game rules; broad review and localV5.7 bundle. No deploy.
