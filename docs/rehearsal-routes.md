# Rehearsal routes

The deck contains one timed in-flow sequence and a post-Q&A backup section. Route metadata lives in the source comment immediately before each slide. The metadata totals below are calculated from those comments; they are speaking targets, not guarantees about audience interruptions.

## Full route

Target: **40:06** (within the requested ~38–42 minutes).

Run M01–M70 in order and include O01–O14 at their natural positions. Do not enter B00–B37 before Q&A unless a question specifically needs a reference slide.

Full-route optional emphasis:

- O01 — fuller biography
- O02 — macro-annotation use cases
- O03 — Scala 2 analyzer hook names
- O04 — full reflection constructor
- O05 — cost of staying outside the analyzer
- O06 — explicitly typing an `untpd` tree
- O07 — raw exact replacement
- O08 — revision-local relationships and recomputation
- O09 — raw settings derived by the AutoPlugin
- O10 — compiler/classloader identity
- O11 — `@syntax` design
- O12 — bounded `@self` and postponed `@poly`
- O13 — direct-syntax staging topology
- O14 — bounded same-module experiment

## Normal route

Target: **34:58** (within the requested ~34–37 minutes).

Run every MAIN slide M01–M70 in order. Skip exactly these OPTIONAL-IN-FLOW slides:

```text
O01 O02 O03 O04 O05 O06 O07
O08 O09 O10 O11 O12 O13 O14
```

The skip points are narratively safe because each optional slide follows the MAIN slide that establishes its concept and precedes the next MAIN topic. Do not move skipped slides after Q&A; leave them in-flow in the published artifact.

## Short route

Target: **30:18** (within the requested ~30–32 minutes).

Skip exactly the same OPTIONAL-IN-FLOW slides as the normal route:

```text
O01 O02 O03 O04 O05 O06 O07
O08 O09 O10 O11 O12 O13 O14
```

Keep all MAIN slides in sequence, but use their short timing. Apply these compressions:

- M12–M13: state the `reify` limitation and point only to the structural sequence splice.
- M15: point to `components = Nil` and the two analyzer registrations.
- M20: point to `Symbol.newModule` and the returned module definitions.
- M28 and M30: name `ExprImpl` and `tpd.Tree`; do not walk each constructor argument.
- M35–M39: one sentence per Q/N/U-D/U-U/C layer.
- M52–M53: state “rescan current tree” and “whole-unit rollback; budget 256.”
- M58–M61: show the generated signature/result for each AUXify annotation without reading the full boundary text.

These are rapid passes, not first-cut material. In particular, the short route still contains:

- both Scala Semantic Harness slides;
- the opening `@addFoo` question and final answer;
- generated definition versus ordinary-source API visibility;
- Scala 2 Paradise placement and native Scala 3 `MacroAnnotation`;
- `StandardPlugin` rationale and parser-to-typer placement;
- the complete Level 0–4 representation walk;
- Q/N/U-D/U-U/C;
- current marker/handler syntax, `@identity`, `@gen`, and `@addFoo`;
- both same-build and published-module sbt setups;
- representative `@apply`, `@aux`, `@instance`, `@delegated`, and composition evidence;
- rewriting/U-U, limits, future direct syntax, and conclusion.

## Backup use

B00 is the Q&A/reference divider. B01–B37 are not timed. Open them only in response to questions or after the main discussion. The most likely live references are:

- B07 for the full native `MacroAnnotation` construction;
- B12 for runtime class identity;
- B18 for the complete current `@addFoo` handler;
- B19–B22 for copyable sbt/manual wiring;
- B24–B29 for AUXify implementation and composition details;
- B31–B33 for same-module staging, future syntax, and API history;
- B35 for the full “do not claim” checklist.

## Rehearsal checkpoints

1. At M25, full route 14:40; normal 12:50; short 11:10.
2. At M41, full route 22:07; normal 19:33; short 16:49.
3. At M53, full route 28:50; normal 25:52; short 22:20.
4. At M62, full route 34:59; normal 30:31; short 26:23.
5. Finish M70 at full 40:06, normal 34:58, or short 30:18.

If rehearsal exceeds a target, shorten explanations within the stated rapid-pass slides before cutting any mandatory technical spine slide.
