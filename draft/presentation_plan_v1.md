# Presentation plan v1

Source content pool: `draft/draft_v8.md` at commit `1c9b30297f54e2962fbb3b2997a26b1b8a45d50c`.

This plan changes the mode of work. `draft_v8.md` remains the additive source of truth; the presentation may be selective, but substantial material should normally move to **optional** or **backup** rather than disappear.

## Goal and timing

London Scala slot: approximately 40 minutes.

Target planned speaking time for the main route: **32–34 minutes**.

Reserve:

- ~3–5 minutes for natural pauses, transitions, projector/code-reading latency, or audience reaction;
- any remaining time for questions;
- optional slides can be inserted when pace is faster than expected.

The main audience should leave with four ideas:

1. Scala 3 already has macro annotations; the missing property for this talk is **ordinary user-source visibility of newly generated API**.
2. That property motivates a transformation **after parser and before typer**.
3. Current Macro-Paradise can implement that as a Scala 3 `StandardPlugin` because it completes a bounded `untpd` transformation before ordinary semantic typing begins.
4. Scala 3 tree/quotation boundaries make source-like authoring harder than Scala 2, which motivates the Quasiquotes / Scalameta / exact-`untpd` work and is exercised by AUXify.

## Status labels

- **MAIN** — part of the normal 32–34 minute route.
- **OPTIONAL** — prepared and placed in the deck near its natural point; show when useful or when ahead of time.
- **BACKUP** — after the conclusion / Q&A divider; available for questions or deeper discussion.
- **NOTES** — speaker knowledge / source material; no need for a dedicated visible slide unless later promoted.

Nothing below implies deleting the corresponding material from `draft_v8.md`.

# Main deck

## Opening — about 2 minutes

### M01 — Title
**Status:** MAIN  
**Time:** 0:20–0:30

- London Scala User Group emblem.
- Dmytro Mitin.
- **Can Scala 3 Have Macro Annotations Again? Rebuilding Macro Paradise**.
- 9 September 2026.

Do not add technical content here.

### M02 — Who I am / where the material lives
**Status:** MAIN  
**Time:** ~1:00

Use a compact version of:

- Scala + Haskell developer and mathematician;
- metaprogramming / compilers / type systems;
- Stack Overflow / teaching / OSS as one-line credibility context;
- talk repository + QR code.

Keep the fuller biography/statistics as O01/B01 rather than deleting them.

### O01 — More about me
**Status:** OPTIONAL, immediately after M02

Preserve from v8:

- mathematical interests and competitions;
- detailed Stack Overflow rankings;
- courses/trainings;
- industries;
- Spark PR and Scala 3 PR.

### O02 — Scala semantic harness announcement
**Status:** OPTIONAL, opening or closing

Very short announcement only if useful for this audience. Keep the install command, `skills/semantic-scala/SKILL.md`, onboarding and feedback links in backup.

---

# Part I — What problem are we solving? — about 5 minutes

### M03 — The question of the talk
**Status:** MAIN  
**Time:** ~1:20

Start with the concrete requirement:

```scala
@addFoo
class A

A.foo(10)
```

Ask explicitly:

> Should ordinary Scala name resolution and typing see `A.foo`?

Then show the conceptual expansion to `object A { def foo ... }`.

This is the central running example. Return to it later.

### M04 — Generated code vs generated API
**Status:** MAIN  
**Time:** ~1:20

Key distinction:

```text
Can an annotation generate definitions?          yes
Can new definitions become ordinary source API?  different question
```

State early that Scala 3 has `scala.annotation.MacroAnnotation` and can generate code. The talk is about the stronger Paradise-style visibility requirement.

### M05 — Three times
**Status:** MAIN  
**Time:** ~0:50

Compress `Different times` into one diagram:

```text
compile macro/handler implementation
          -> compile client / execute expansion
          -> run generated program
```

Purpose: prevent later ambiguity around “runtime of macros”.

### M06 — Ordinary method → inline → macro
**Status:** MAIN  
**Time:** ~1:10

One progression slide, preferably side-by-side rather than three independent slides:

- ordinary method;
- Scala 3 `inline`;
- macro implementation executed while the client is compiled.

Scala 2 `@inline` nuance can be a small note, not the visual focus.

### M07 — Macro annotations and use cases
**Status:** MAIN  
**Time:** ~0:50

Use the `@addFoo` shape plus a compact list:

- generated members / companions / siblings;
- derivation / boilerplate;
- validation / instrumentation;
- transformations;
- type-class helpers / syntax.

---

# Part II — Why quasiquotes mattered in Scala 2 — about 4 minutes

### M08 — Manual trees → parser → quasiquotes
**Status:** MAIN  
**Time:** ~1:30

Use the progression from v8:

```scala
Apply(Select(left, "+"), List(right))
```

then parsing:

```scala
c.parse(s"$left + $right")
```

then:

```scala
q"$left + $right"
```

Core explanation:

- parser: strings → trees, holes still require string/tree conversion;
- quasiquotes: splice trees structurally into tree templates;
- construction and matching are both important.

Keep the exact Dotty/Scalameta hybrid parser implementation details in B03.

### M09 — Scala 2 def macros: why tree quasiquotes were useful
**Status:** MAIN  
**Time:** ~1:00

Use only enough of `reify/splice` and `make[A]` to motivate why arbitrary tree construction was useful.

Do not spend time teaching all of Scala 2 macros.

### M10 — Scala 2 Macro Paradise
**Status:** MAIN  
**Time:** ~1:30

Show:

```text
parser
  -> macroparadise / analyzer integration
  -> namer
  -> typer
```

Then the essential result:

> generated definitions participate in the ordinary downstream compiler pipeline.

Mention that actual Scala 2 Paradise used analyzer/macro plugin hooks; defer hook names and implementation detail to B04.

---

# Part III — Scala 3's design point — about 6 minutes

### M11 — Scala 3 quotations / quoted reflection
**Status:** MAIN  
**Time:** ~1:10

Show the modern typed quotation model and one short reflection-construction example.

Message:

> Scala 3 gives us a much safer typed staged world, but this is not the same thing as Scala 2 arbitrary compiler-tree quasiquotes.

The long `make[A]` reflection constructor stays in B05.

### M12 — Native Scala 3 `MacroAnnotation`
**Status:** MAIN  
**Time:** ~1:20

State accurately:

- it is a real macro-annotation API;
- it can transform and generate definitions;
- generated definitions have deliberately limited visibility outside expansion.

Use a small conceptual or abbreviated code sample. Put the full `Symbol.newModule` implementation in B06.

### M13 — Two design points
**Status:** MAIN  
**Time:** ~0:50

A clean contrast slide:

```text
Scala 3 MacroAnnotation
  typed macro-expansion world
  generated definitions: limited external visibility

Paradise-style experiment
  pre-typer source transformation
  generated definitions: ordinary typer input
```

Neither is presented as universally better.

### M14 — StandardPlugin vs ResearchPlugin
**Status:** MAIN  
**Time:** ~0:55

Very compact taxonomy:

```text
StandardPlugin -> contributes PluginPhase(s)
ResearchPlugin -> may replace/rearrange whole pipeline; nightly/snapshot
```

Then:

> Macro-Paradise is a research/experimental project implemented as a Scala 3 `StandardPlugin`.

### M15 — Why a StandardPlugin is enough
**Status:** MAIN  
**Time:** ~1:30

Use the narrow contract:

```text
parse
 -> bounded untpd rewrite
 -> ordinary typer once, on final program
```

Contrast with Scala 2 Paradise:

```text
Scala 2 Paradise
  expansion integrated while analyzer entered symbols

current Scala 3 Macro-Paradise
  transform before semantic work becomes authoritative
```

Key trade:

- no full semantic resolution before expansion;
- precompiled handlers by default;
- bounded syntactic/import-aware annotation identity.

Detailed analyzer hook names go to B04; same-module/same-file consequences go to B19/B20.

### M16 — Where Macro-Paradise runs
**Status:** MAIN  
**Time:** ~0:55

Canonical phase slide:

```text
source
 -> parser
 -> Macro-Paradise
    discovery / expansion / validation / composition
 -> typer
 -> later phases
```

This should be one of the visually strongest slides in the deck.

---

# Part IV — Walk down the Scala 3 tree stack — about 5 minutes

### M17 — The walk map: Levels 0–4
**Status:** MAIN  
**Time:** ~0:50

Preserve the exact conceptual walk:

```text
Level 1   Level 2               Level 3     Level 4
Expr   -> (A) ExprImpl       -> tpd.Tree -> untpd.Tree
       -> (B) q.reflect.Term ->
```

Add Level 0: ordinary values / call site.

Explicitly say arrows are the **direction of our walk**, not compiler-phase flow.

### M18 — Levels 0–2: public typed macro world
**Status:** MAIN  
**Time:** ~1:00

Combine:

- `Expr`;
- branch A: `ExprImpl`;
- branch B: `quotes.reflect.Term`;
- typed `qr"..."` at the Term layer.

Use one short code fragment per branch, not every v8 implementation.

### M19 — Levels 3–4: `tpd` and `untpd`
**Status:** MAIN  
**Time:** ~1:00

Show:

```text
tpd.Tree -> untpd.Tree   // our walk
```

beside:

```text
parser -> untpd -> typer -> tpd   // compiler direction
```

Then the important landing point:

> Macro-Paradise operates at Level 4, before ordinary typer.

Detailed `tpd.applyOverloaded`, `TypedSplice`, `new Typer().typedExpr` examples can live in B07.

### M20 — Why typed `qr` / `dqr` cannot just be inserted
**Status:** MAIN  
**Time:** ~0:55

One contrast:

```text
qr/dqr -> Quotes / typed reflection
Macro-Paradise -> untpd / pre-typer
```

This should directly answer a likely Scala 3 expert question.

### M21 — Three representation worlds
**Status:** MAIN  
**Time:** ~1:10

Distinguish clearly:

```text
Scalameta source AST
!= neutral project semantic model
!= exact Dotty untpd
```

Then show the practical lowering direction:

```text
Scalameta definition/quasiquote
 -> Quasiquotes exact lowering
 -> positioned untpd
 -> Macro-Paradise placement
 -> typer
```

### M22 — Generating syntax is not enough
**Status:** MAIN  
**Time:** ~0:45

One concise checklist:

```text
AST shape
+ provenance / positions
+ ownership
+ exact compiler representation
+ correct phase
```

This justifies the lowering bridge without overexplaining implementation.

### O03 — Q / N / U-D / U-U / C glossary
**Status:** OPTIONAL, after M21 or in backup

Keep the full glossary from v8:

- Q = Quotes-aware typed frontend;
- N = neutral compiler-free semantics;
- U-D = fresh exact untyped lowering;
- U-U = existing `untpd` → `untpd` structural rewrite;
- C = cross-layer composition/integration/API policy.

For the main route, the three-world slide is enough. Show this glossary if the audience is following the architecture comfortably.

---

# Part V — Macro-Paradise as an actual compiler architecture — about 7 minutes

### M23 — End-to-end architecture
**Status:** MAIN  
**Time:** ~1:20

Use one pipeline:

```text
marker annotation
 -> handler discovery
 -> precompiled ExpansionHandler
 -> ExpansionInput
 -> authored/lowered untpd changes
 -> validation + transactional composition
 -> replace staged package stats
 -> ordinary typer
```

Mention related repositories only here or at the end:

- Macro-Paradise;
- Quasiquotes;
- AUXify.

`allow-experimental` can remain optional/backup unless there is a strong narrative reason to mention it.

### M24 — Current marker / handler syntax
**Status:** MAIN  
**Time:** ~0:55

Show current-main form:

```scala
@expander("...Handler")
class myAnnotation extends StaticAnnotation

class MyAnnotationHandler extends ExpansionHandler:
  def expand(input: ExpansionInput)(using Context): ExpansionOutcome = ...
```

One sentence: `@expander` is runtime-retained marker metadata naming already compiled executable expansion code.

Full Java annotation implementation goes to B10.

### M25 — Structured transformation model
**Status:** MAIN  
**Time:** ~1:15

Prefer a diagram/table over API code:

```text
primary   preserve / merge / replace / delete
companion preserve / merge / replace / create / delete
siblings  sparse create / merge / replace / delete
```

Add:

```text
ExpansionEdit.start
 -> immutable helper pipeline
 -> ExpansionEdit.finish
```

Mention that relationships are recomputed after edits; companion adjacency is not assumed.

Raw `Expanded(trees)` goes to B12 unless needed during questions.

### M26 — Scheduler + transaction
**Status:** MAIN  
**Time:** ~1:00

Combine current-tree rescanning and rollback:

```text
successful stage
 -> validate
 -> rescan current staged tree
```

and:

```text
stage 1 ok
stage 2 ok
stage 3 fails
 -> rollback whole compilation unit
```

Mention default budget 256 as one small note.

### M27 — `@addFoo`, end to end
**Status:** MAIN  
**Time:** ~1:50

Return to the opening example and show the real current-main chain:

```text
Scalameta q"def foo..."
 -> generated-origin exact lowering
 -> untpd.DefDef
 -> ExpansionEdit
 -> create companion + place member
 -> validate
 -> typer sees A.foo
```

Use only the essential lines of current `AddFooHandler`; put the full handler in B14.

This is the main payoff slide.

### M28 — What the build has to arrange
**Status:** MAIN  
**Time:** ~0:45

Do **not** show the long `build.sbt` in the main route.

Show only the conceptual topology:

```text
marker classes on compile classpath
precompiled handler + closure on tool classpath
compiler plugin
exact artifact identity
```

Say `sbt-macroparadise` automates this. This preserves the motivation for the build material while moving actual recipes to backup.

### O04 — Exact compiler / classloader identity
**Status:** OPTIONAL, after M28

Use when the audience asks “why `CrossVersion.full` / exact Scala?”.

Explain:

- raw Dotty trees and `Context` cross the handler boundary;
- plugin and handler must share the same compiler/API class identity;
- therefore exact Scala line and parent-first classloader policy matter.

Full detail remains B11.

---

# Part VI — AUXify: does the architecture support something real? — about 4 minutes

### M29 — AUXify as downstream evidence
**Status:** MAIN  
**Time:** ~0:55

Present AUXify as an integration consumer, not a list of demos:

```text
annotation
 -> Macro-Paradise scheduling / placement
 -> source-shape decoding
 -> Scalameta authoring
 -> Quasiquotes exact lowering
 -> ordinary typer
```

### M30 — Representative generated helpers
**Status:** MAIN  
**Time:** ~1:30

Use a compact 2×2 or progressive slide with conceptual outputs:

- `@apply` — summon/materializer helper;
- `@aux` — `Aux` type alias;
- `@instance` — type-class instance constructor;
- `@delegated` — forwarder.

Do not show every handler implementation in the main route.

Mention status:

- `@self` currently bounded;
- `@syntax` designed but not implemented;
- `@poly` postponed.

Full examples each get backup slides B15–B18.

### M31 — Composition is the stronger test
**Status:** MAIN  
**Time:** ~0:55

Show both source orders of one supported pair, e.g. `@apply + @instance`, and mention `@apply + @aux` / `@apply + @delegated`.

Message:

> the second handler must see the current result of the first, so this tests the scheduler rather than only isolated code generation.

### O05 — `@self`, `@syntax`, parity/future status
**Status:** OPTIONAL

Preserve the broader parity examples and status caveats. Useful if the audience is especially interested in type-level programming.

---

# Part VII — Limits, trade-offs, future — about 3 minutes

### M32 — Current scope and costs
**Status:** MAIN  
**Time:** ~1:15

Two columns:

**Works today / current main**

- `StandardPlugin` pre-typer phase;
- package-level Class/Trait/Object slice;
- exact Scala 3.3.8 / 3.8.4 / 3.9.0;
- precompiled handlers by default;
- structured edits + raw escape hatch;
- deterministic scheduling + rollback.

**Costs / not general yet**

- compiler-internal coupling;
- exact-version dependence;
- IDE/incremental/same-module complexity;
- bounded annotation identity before typer;
- no general nested/local/arbitrary-target support.

### M33 — Possible future syntax
**Status:** MAIN  
**Time:** ~0:50

Show the attractive direct form:

```scala
class myAnnotation extends SomeFutureSuperParadiseAnnotationExpander:
  def expand(...) = ...
```

Then one sentence:

> syntax itself does not force deeper typer integration; the important question is whether the expander is already compiled and how much semantic resolution we require before expansion.

### O06 — Future syntax: precompiled vs same-module vs same-file
**Status:** OPTIONAL, immediately after M33

Preserve the detailed v8 design-space discussion:

```text
precompiled
 -> current StandardPlugin model enough

different file / same module
 -> suspension + precompilation may be enough

same file
 -> bootstrap cycle; deeper integration becomes attractive

full semantic resolution before expansion
 -> namer/typer integration more relevant
```

This is excellent technical Q&A material but too long for the default route.

### M34 — Conclusion
**Status:** MAIN  
**Time:** ~0:45

Suggested conceptual close:

```text
Scala 3 does have macro annotations.

Macro-Paradise explores a different point in the design space:
transform before ordinary typing when generated API itself must become ordinary compiler input.
```

Then reinforce the three pieces:

```text
pre-typer Macro-Paradise
+ exact/untyped Quasiquotes lowering
+ downstream AUXify experiments
```

### M35 — Links / questions
**Status:** MAIN  
**Time:** ~0:20

- talk repository / QR;
- Macro-Paradise;
- Quasiquotes;
- AUXify;
- contact.

---

# Estimated main-route timing

| Part | Time |
|---|---:|
| Opening | ~1.5–2 min |
| I. Problem / macro concepts | ~5 min |
| II. Scala 2 / quasiquotes / Paradise | ~4 min |
| III. Scala 3 design point / plugin choice | ~6 min |
| IV. Tree walk / Quasiquotes boundary | ~5 min |
| V. Macro-Paradise architecture / `@addFoo` | ~7 min |
| VI. AUXify | ~3.5–4 min |
| VII. Limits / future / conclusion | ~3 min |
| **Planned speaking total** | **~34 min** |

This is deliberately below the nominal 40-minute slot. Code-heavy slides often consume more time live than they do on paper.

# Optional slides in natural positions

1. **O01 More about me** — after M02.
2. **O02 Semantic harness** — opening or closing.
3. **O03 Q/N/U-D/U-U/C glossary** — after M21.
4. **O04 Exact compiler/classloader identity** — after M28.
5. **O05 `@self` / `@syntax` / parity status** — after M30/M31.
6. **O06 Future direct syntax and compiler-integration depth** — after M33.

If rehearsal is comfortably under 32 minutes, one or two of these can be promoted into the normal route without redesigning the deck.

# Backup deck

The backup deck should be substantial. It is the preferred destination for information removed from visible main slides.

## B01 — Full biography / Stack Overflow / courses / OSS
Preserve all detail from `About myself`.

## B02 — Semantic harness details
Coursier install, skill path, onboarding and feedback links.

## B03 — Parsing implementation details

- Scala 2 `c.parse`;
- Dotty `Scala3ParserBridge`;
- `TinyTermParser` / `TinyTypeParser`;
- Scalameta-primary hybrid frontend and fallback condition.

## B04 — Scala 2 Paradise analyzer internals

- ordinary `nsc` plugin container;
- `components = Nil`;
- `AnalyzerPlugin` + `MacroPlugin`;
- `pluginsEnterStats`, `pluginsEnterSym`, `pluginsEnsureCompanionObject`, `pluginsTypedMacroBody`, `pluginsTypeSig`;
- caveat that this describes actual Paradise's protocol, not an impossibility theorem about all Scala 2 designs.

## B05 — Full Scala 3 quoted-reflection `make[A]` examples
Both manual reflection-construction versions from v8.

## B06 — Full native Scala 3 `MacroAnnotation` `@addFoo`
Keep the `Symbol.newModule` / `ClassDef.module` implementation.

## B07 — Full Level 0–4 tree-walk code

- `Expr`;
- `ExprImpl`;
- `quotes.reflect.Term`;
- `tpd.applyOverloaded`;
- `TypedSplice` + `Typer.typedExpr`;
- manual `untpd.Apply/Select`.

## B08 — Q / N / U-D / U-U / C architecture
Full glossary plus non-equivalences (`N != n*`, `U != u*`, `C != tree universe`).

## B09 — Scala 2 “one tree world” vs Scala 3 representation split
Keep this as a conceptual deep-dive slide.

## B10 — `@expander` implementation

- Scala marker vs Java runtime annotation;
- full `@Retention(RUNTIME)` / `@Target(...)` source;
- current vs historical handler naming.

## B11 — Exact compiler and classloader identity

- `CrossVersion.full`;
- raw Dotty tree / `Context` runtime identity;
- parent-first compiler/API universe;
- why a child compiler copy breaks the boundary.

## B12 — Raw exact replacement
`ExpansionOutcome.Expanded(trees)`, deletion, ordering, topology validation.

## B13 — Primary / companion / siblings and recomputation

- companion adjacency not required;
- current-revision labels;
- apply changes → discard stale labels → recompute relationships → validate → rescan.

## B14 — Full current-main `@addFoo` handler
Keep the `ExpansionEdit`, Scalameta q, generated-origin lowering, explicit companion creation code.

## B15 — Full `@apply` AUXify example
Conceptual output + historical handler + Scalameta definition builder/lowering.

## B16 — Full `@aux` AUXify example
Conceptual `Aux` + historical handler + type alias builder/lowering.

## B17 — `@instance` / `@delegated`
Full conceptual examples and current bounded status.

## B18 — `@syntax` / `@self` / `@poly`

- selected-but-unimplemented `@syntax`;
- broader `@self` parity example vs current bounded slice;
- postponed `@poly`.

## B19 — Same-module support

- broad/default precompiled architecture;
- bounded different-file Model A;
- consumer suspension / handler compilation / resume;
- qualified vs unqualified IDE/BSP/JPS cases if useful.

## B20 — Future direct syntax and bootstrap cases
Full v8 discussion of precompiled, same-module different-file, same-file, and full semantic resolution.

## B21 — Current target scope
Full list of supported Class/Trait/Object and unsupported nested/local/enum/method/val/type/parameter/given/extension forms.

## B22 — Historical API evolution

- `ParadiseAnnotationExpander`;
- `StructuredExpansionOutput`;
- old `ExpansionOutcome` sketches;
- historical `@identity`, `@gen`, `@addFoo` blocks.

## B23 — Current structured API in detail

- `ExpansionChanges`;
- primary/companion/sibling change variants;
- `ExpansionEdit.start` / helpers / `finish`;
- conflict / missing-companion policies.

## B24 — Scheduler / rollback / budget details

- current-tree rescanning;
- fresh handled annotations become new work;
- identity ledger;
- default 256-success budget;
- whole-unit rollback modes.

## B25 — Released `0.1.1`: same-build sbt setup
Preserve full `sbt-macroparadise` / `MacroParadiseIntegration.precompiledProjects` example.

## B26 — Released `0.1.1`: published marker/handler modules
Preserve `macroParadiseMarkerModules` / `macroParadiseHandlerModules` consumer setup.

## B27 — What the sbt plugin hides: local projects
Preserve the lower-level marker JAR / handler JAR / handler classpath / `ExternalArtifactIdentity` wiring.

## B28 — What the sbt plugin hides: published modules (`0.2.0-SNAPSHOT`)
Preserve the complete manual published-module `build.sbt` from `EXTERNAL_HANDLER_AUTHORING.md`.

## B29 — Project structure / versions / how to play

- `sbt new`;
- clone commands;
- released/current versions;
- exact Scala lines;
- JDK/sbt requirements;
- marker/handler/core topology.

## B30 — Rewriting existing definitions
Preserve the `@addOption` example and the U-U existing-tree capture/rewrite architecture.

## B31 — `allow-experimental`
Keep the project's precise current semantics and link as related compiler-plugin work.

## B32 — Full current limits / “do not claim” checklist
Useful as presenter safety/Q&A reference.

## B33 — Future directions
Full Macro-Paradise / Quasiquotes / AUXify future lists from v8.

## B34 — Contacts / all links
Preserve LinkedIn, GitHub, Facebook, X, Instagram, Threads, YouTube, email and public mirrors.

# Mapping v8 sections to presentation disposition

| v8 material | Default disposition |
|---|---|
| First slide | MAIN M01 |
| This presentation | MAIN M02/M35 |
| About myself | MAIN compact M02 + O01/B01 |
| Semantic harness announcement | O02/B02 |
| Disclaimer / versions | compact NOTES/M32 + B29/B32 |
| The question of the talk | MAIN M03 |
| Generated code vs generated API | MAIN M04 |
| Different times | MAIN M05 |
| Ordinary / inline / macro | MAIN M06 |
| Macro annotations / use cases | MAIN M07 |
| What are quasiquotes? | MAIN M08 + B03 |
| Scala 2 reify/splice | MAIN compact M09 |
| Scala 2 quasiquotes | MAIN M08/M09 |
| Scala 2 Macro Paradise | MAIN M10 + B04 |
| Scala 3 def macros / quotations | MAIN M11 |
| Scala 3 manual quoted reflection | MAIN compact M11 + B05 |
| Scala 3 MacroAnnotation | MAIN M12/M13 + B06 |
| Standard vs Research plugin | MAIN M14 |
| Why StandardPlugin is enough | MAIN M15 |
| Why Scala 2 needed analyzer integration | MAIN M15 + B04 |
| Where Macro-Paradise runs | MAIN M16 |
| Our Scala 3 quasiquotes | MAIN M18/M20 |
| Walk Levels 0–4 | MAIN M17–M19 + B07 |
| Why typed qr/dqr not direct | MAIN M20 |
| Three representation worlds | MAIN M21 |
| Neutral / exact lowering path | MAIN M21 |
| Generating syntax is not enough | MAIN M22 |
| Macro-Paradise / related repos | MAIN M23 + B31 |
| How to play / versions | B29 |
| Why handlers precompiled | MAIN M28 concept + B19/B29 |
| Classloader identity | O04/B11 |
| Possible future syntax | MAIN M33 + O06/B20 |
| Current marker / handler syntax | MAIN M24 |
| What is @expander? | MAIN one sentence M24 + B10 |
| Project structure | B29 |
| sbt not published 0.1.1 | B25 |
| sbt published 0.1.1 | B26 |
| current-main sbt note | B29 |
| what sbt plugin does, local | MAIN concept M28 + B27 |
| what sbt plugin does, published | MAIN concept M28 + B28 |
| plugin vs handler ownership | MAIN M23/M25 |
| Current target model | MAIN compact M32 + B21 |
| primary / companion / siblings | MAIN M25 + B13 |
| structured transformation | MAIN M25 + B23 |
| raw replacement | B12 |
| @identity current / historical | B22/B23 |
| @gen | B22 |
| scheduler | MAIN M26 + B24 |
| transaction / rollback | MAIN M26 + B24 |
| current @addFoo | MAIN M27 + B14 |
| historical @addFoo | B22 |
| AUXify architecture | MAIN M29 |
| @apply | MAIN compact M30 + B15 |
| @aux | MAIN compact M30 + B16 |
| @instance | MAIN compact M30 + B17 |
| @delegated | MAIN compact M30 + B17 |
| @syntax | O05/B18 |
| @self | O05/B18 |
| AUXify composition | MAIN M31 |
| rewriting / @addOption | B30 |
| Q/N/U-D/U-U/C | O03/B08 |
| Scala 2 one-tree-world discussion | B09, with one sentence in M20/M21 |
| Current limits / what not to claim | MAIN M32 + B32 |
| What works today end-to-end | MAIN distributed M23–M27; can also become backup summary |
| Native MacroAnnotation comparison | MAIN M13/M34 |
| Costs | MAIN M32 |
| Future directions | MAIN M33 + B33 |
| Semantic harness reminder | O02/B02 |
| Subscribe / contact | MAIN M35 + B34 |

# Rehearsal rules

## First rehearsal

Run the **MAIN-only route**. Do not show optional slides even if there is time.

Record:

- total time;
- where explanations naturally expand;
- slides that require more than ~90 seconds because code must be read;
- audience-assumption gaps you notice while speaking aloud.

## If MAIN-only is >35 minutes

Do not delete source material. First compress visible slides by moving detail to backup:

1. M06 macro progression — reduce code;
2. M09 Scala 2 def-macro motivation — shorten;
3. M18/M19 tree-walk code — keep map, reduce implementations;
4. M30 AUXify — conceptual outputs only;
5. M28 build topology — diagram only.

## If MAIN-only is <30 minutes

Promote optional slides in this order:

1. O03 Q/N/U-D/U-U/C if the tree/Quasiquotes story benefits from it;
2. O04 exact compiler/classloader identity for a compiler-heavy audience;
3. O06 future syntax / same-module design space;
4. O05 AUXify `@self`/`@syntax` if type-level programming gets strong interest;
5. O02 semantic harness only if it fits the room/context.

# Production guidance for the actual slides

- Keep the projector-safe **dark text on light background** direction.
- One conceptual claim per slide whenever possible.
- For code, prefer progressive reveal / highlighted 5–12 line excerpts over full implementations.
- Whenever main-slide code is abbreviated, put the complete version in the immediately related backup slide.
- Reuse visual anchors throughout:
  - `@addFoo class A` / `A.foo(10)`;
  - parser → Macro-Paradise → typer;
  - Level 0–4 tree walk;
  - Scalameta → exact lowering → `untpd` → typer.
- Clearly label examples as `0.1.1 released` or `0.2.0-SNAPSHOT / current main` when the API/build distinction matters.
- Backup slides should be fully navigable from the deck; they are not throwaway material.

# Next implementation step

Use this plan to produce the next slide-deck revision. The slide-generation prompt should explicitly require:

1. preserve the existing visual assets where useful;
2. rebuild the narrative around M01–M35 rather than mechanically translating every v8 heading;
3. create O01–O06 in their natural positions but mark them optional in source/metadata if the slide system supports it;
4. create a Q&A / backup divider followed by B01–B34 as needed;
5. move detail to backup instead of silently dropping it;
6. keep full code versions in backup when main slides use shortened excerpts;
7. target ~34 minutes MAIN-only before optional slides;
8. keep `draft/draft_v8.md` unchanged as the content source of truth.
