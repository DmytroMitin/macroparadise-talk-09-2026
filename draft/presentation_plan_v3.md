# Presentation plan v3

Source content pool: `draft/draft_v8.md` at commit `1c9b30297f54e2962fbb3b2997a26b1b8a45d50c`.

Previous plan checkpoints:

- `draft/presentation_plan_v1.md`
- `draft/presentation_plan_v2.md`

This version deliberately changes the planning philosophy.

The talk is for a **technical Scala meetup**, not for a management/generalist audience. The deck should preserve technical depth, real code, compiler representations, build wiring, handler APIs, phase placement, and downstream examples. The goal is **not** to compress `draft_v8.md` into a handful of managerial takeaways.

The default rule is:

> Keep substantial material visible somewhere in the deck. If it cannot fit the normal spoken route, move it to an in-flow optional slide or to backup rather than deleting it.

`draft_v8.md` remains the additive technical source of truth.

---

# 1. Presentation modes

The deck should support three live routes without having three different decks.

## Full technical route

Target: **~38–42 minutes**.

Use when the room is moving quickly and there are few interruptions. This route includes most optional-in-flow technical slides.

## Normal rehearsed route

Target: **~34–37 minutes**.

This is the expected London Scala delivery. Skip selected in-flow optional slides, but do not change the narrative order.

## Short route

Target: **~30–32 minutes**.

Use only if the event is running late or discussion consumes significant time. Skip more optional-in-flow material while preserving the technical spine.

The published deck remains the **full technical deck**. Timing is controlled by what the speaker chooses to skip live, not by deleting material from the artifact.

---

# 2. Slide status labels

Use these planning labels. They do not necessarily need to appear visibly on the slides.

- **MAIN** — normally spoken in every route.
- **OPTIONAL-IN-FLOW** — physically located at the natural point in the main deck; spoken in the full route, usually skipped in the normal/short route.
- **BACKUP** — after the main conclusion/Q&A divider; deeper implementation/reference material.
- **NOTES** — speaker-only details that genuinely do not benefit from a dedicated visible slide.

Important principle:

> Prefer OPTIONAL-IN-FLOW over BACKUP when the material contributes to understanding the narrative but may be too detailed for the normal route.

---

# 3. Global deck character

## Technical level

Assume an audience comfortable with Scala, types, compilers, macros, and code. Explain unfamiliar compiler-internal terms, but do not remove them merely because they are advanced.

The deck should visibly contain:

- Scala 2 macro/quasiquote code;
- Scala 2 Macro Paradise phase/analyzer discussion;
- Scala 3 quotes/reflection;
- native Scala 3 `MacroAnnotation`;
- `StandardPlugin` vs `ResearchPlugin`;
- parser / `untpd` / typer / `tpd` phase placement;
- the Level 0–4 tree walk;
- Q / N / U-D / U-U / C architecture;
- Scalameta quasiquotes and exact lowering/bridge examples;
- real current Macro-Paradise marker/handler syntax;
- `@identity`, `@gen`, `@addFoo` as handler-authoring examples;
- structured edits, scheduler, rollback;
- same-build and published-module `sbt-macroparadise` setup;
- AUXify examples and annotation composition;
- future direct syntax;
- current limitations and exact-version constraints;
- Scala Semantic Harness at both beginning and end.

## Visual style

- dark text on white/light background for projector reliability;
- large code fonts; prefer splitting code across several slides rather than shrinking it;
- one technical idea per slide when practical;
- progressive sequences are encouraged;
- diagrams should be simple and compiler-accurate;
- no management-style slogan slides replacing technical evidence.

## Code density

A code slide is allowed to be dense if the code is genuinely the subject. Prefer 2–3 consecutive code slides over one tiny-font slide.

Speaker notes should mark the 1–4 lines to emphasize live.

---

# 4. Main technical deck

The numbering below is a planning sequence, not a strict final Slidev slide count. Some items may become two slides if code readability requires it.

## Opening

### M01 — Title
**MAIN**

- London Scala User Group
- Dmytro Mitin
- **Can Scala 3 Have Macro Annotations Again? Rebuilding Macro Paradise**
- 9 September 2026

### M02 — About me / talk repository
**MAIN**

Keep this concise but technical:

- Scala + Haskell developer and mathematician;
- metaprogramming, compilers, type systems;
- teaching / Stack Overflow / OSS;
- talk repo + QR code.

### O01 — More about me
**OPTIONAL-IN-FLOW**

Preserve the fuller v8 material:

- mathematical interests and competitions;
- Stack Overflow rankings;
- courses/trainings;
- industries;
- Spark PR;
- Scala 3 PR.

### M03 — Scala Semantic Harness
**MAIN — mandatory**

Show the installation command, repository, and `skills/semantic-scala/SKILL.md`.

Message: Scala-aware semantic tooling for coding agents; feedback welcome.

Do not reduce this to a footnote.

---

# Part I — The problem

### M04 — The question of the talk
**MAIN**

```scala
@addFoo
class A

A.foo(10)
```

Show conceptual expansion to `object A` with `foo`.

Ask whether ordinary user code in the same compilation should see the generated API.

### M05 — Generated code vs generated API
**MAIN**

Distinguish:

```text
generate definitions
!=
make newly generated definitions visible to ordinary user-written code
```

State immediately that Scala 3 **does have** macro annotations.

### M06 — Compile-time boundaries
**MAIN**

Preserve the three-time model:

```text
compile macro/handler implementation
-> compile client / execute expansion
-> run generated program
```

### M07 — Ordinary method → inline → macro
**MAIN**

Use real Scala 3 snippets. Scala 2 `@inline` nuance can remain a note.

### M08 — What is a macro annotation?
**MAIN**

Show annotated definition → transformed/generated definitions.

### O02 — Macro-annotation use cases
**OPTIONAL-IN-FLOW**

Keep the fuller list:

- code generation;
- derivation;
- instrumentation;
- validation;
- generated members/companions/siblings;
- type-class helpers;
- transformations.

---

# Part II — Why quasiquotes matter

### M09 — Manual tree construction
**MAIN**

```scala
Apply(Select(left, "+"), List(right))
```

Explain what manual AST construction feels like.

### M10 — Parsing as the middle ground
**MAIN**

Show:

```scala
c.parse(s"$left + $right")
```

Explain strings → trees and why moving between strings/trees is awkward.

Also name the Scala 3 project frontends:

- ordinary frontend: Dotty parser via `Scala3ParserBridge` / tiny parser façades;
- hybrid frontend: Scalameta-primary, with Dotty fallback on Scalameta parse failure.

### M11 — Quasiquotes
**MAIN**

```scala
q"$left + $right"
```

Explain structural holes/splices and construction vs matching.

### M12 — Scala 2 `reify` / `splice`
**MAIN**

Use the typed-expression limitation as motivation.

### M13 — Scala 2 quasiquotes solve a harder construction problem
**MAIN**

Use the `make[A]` example from v8, including sequence splicing.

Do not oversimplify this to a slogan; the audience should see the real code difference.

---

# Part III — Scala 2 Macro Paradise

### M14 — Macro Paradise semantics
**MAIN**

Show the classic/user-visible ordering:

```text
parser
 -> macroparadise / analyzer integration
 -> namer
 -> packageobjects
 -> typer
```

### M15 — How Scala 2 Paradise actually integrated
**MAIN**

Explain that the outer artifact was an ordinary `nsc` plugin, but the implementation used analyzer/macro plugin hooks rather than merely one conventional extra phase.

Show at least:

```text
analyzer.addAnalyzerPlugin(AnalyzerPlugin)
analyzer.addMacroPlugin(MacroPlugin)
```

### O03 — Scala 2 analyzer hook names
**OPTIONAL-IN-FLOW**

Show:

```text
pluginsEnterStats
pluginsEnterSym
pluginsEnsureCompanionObject
pluginsTypedMacroBody
pluginsTypeSig
```

Explain why those hooks were needed by the Scala 2 Paradise protocol.

### M16 — Scala 2 `macroTransform` example
**MAIN**

Show a real compact `@addFoo`-style Scala 2 Macro Paradise implementation with quasiquotes.

This is important historical grounding, not backup trivia.

---

# Part IV — Scala 3: typed macros and native MacroAnnotation

### M17 — Scala 3 quotes and splices
**MAIN**

Show `Expr`, quotes, and splices.

### M18 — Scala 3 quoted reflection
**MAIN**

Show a short manual reflection construction example.

### O04 — Full `make[A]` reflection construction
**OPTIONAL-IN-FLOW**

Keep one of the longer v8 reflection implementations visible for the full route.

### M19 — Native Scala 3 `MacroAnnotation`
**MAIN**

State accurately:

- real experimental API;
- typed world;
- can transform and generate definitions;
- new generated definitions have limited ordinary-source visibility outside expansion.

### M20 — Native `@addFoo` implementation
**MAIN**

Show enough of the `Symbol.newModule` / `ClassDef.module` implementation that the audience sees this is real code generation, not a hypothetical limitation slide.

If necessary, split this into two slides rather than shrinking it.

### M21 — Two design points
**MAIN**

```text
Scala 3 MacroAnnotation
  typed macro-expansion world

Macro-Paradise experiment
  pre-typer source transformation
```

Focus on visibility semantics, not “old vs new”.

---

# Part V — Why our plugin can be StandardPlugin

### M22 — StandardPlugin vs ResearchPlugin
**MAIN**

Technical taxonomy, concise but explicit.

### M23 — Why StandardPlugin is sufficient
**MAIN**

```text
parse
 -> bounded untpd transformation
 -> ordinary typer on final program
```

Emphasize that we are deliberately not replacing parser/typer semantics.

### M24 — Why Scala 2 Paradise needed deeper analyzer integration
**MAIN**

Explain protocol difference:

- Scala 2 expansion integrated while symbols were being entered;
- current Scala 3 design moves discovery/executable-handler prerequisites before ordinary typer;
- stock Dotty performs semantic work once on the transformed program.

### O05 — Price of avoiding analyzer integration
**OPTIONAL-IN-FLOW**

Keep the v8 caveats visible:

- bounded syntactic/import-aware annotation identity;
- precompiled handlers by default;
- no general same-file source handlers;
- raw `untpd`, not general typed symbols;
- semantic transformations needing types require a different strategy.

### M25 — Where Macro-Paradise runs
**MAIN**

Make this a strong diagram:

```text
source
 -> parser
 -> Macro-Paradise
 -> typer
 -> later phases
```

Include discovery, expansion, validation, composition under Macro-Paradise.

---

# Part VI — Walk through Scala tree representations

Do not compress this into two manager-style overview slides. Make it a real walk.

### M26 — Walk map: Level 0–4
**MAIN**

Preserve:

```text
Level 1   Level 2               Level 3     Level 4
Expr   -> (A) ExprImpl       -> tpd.Tree -> untpd.Tree
       -> (B) q.reflect.Term ->
```

Add Level 0 ordinary values/call site.

State that arrows mean our walk, not compiler phase order.

### M27 — Level 0 → Level 1: call site → Expr
**MAIN**

Show the real code.

### M28 — Level 2A: ExprImpl
**MAIN**

Show the cast/internal path and explain why it is compiler-internal.

### M29 — Level 2B: quotes.reflect.Term
**MAIN**

Show manual `Select.overloaded` and typed quasiquote `qr"$left + $right"` side by side.

### M30 — Level 3: tpd.Tree
**MAIN**

Show `tpd.applyOverloaded`.

### O06 — Typing an untpd tree manually
**OPTIONAL-IN-FLOW**

Show `TypedSplice` / `new Typer().typedExpr` path from v8.

### M31 — Level 4: untpd.Tree
**MAIN**

Show manual `untpd.Apply` / `untpd.Select`.

### M32 — Our walk vs compiler direction
**MAIN**

Put both diagrams on one slide:

```text
our walk: Expr -> ... -> tpd -> untpd
compiler:  source -> parser -> untpd -> typer -> tpd
```

### M33 — Why typed `qr` / `dqr` cannot simply be inserted
**MAIN**

Explain typed Quotes world vs pre-typer `untpd` world.

---

# Part VII — Quasiquotes architecture: Q / N / U-D / U-U / C

This is main-deck material because later Scalameta/lowering/bridge examples depend on it.

### M34 — Three representation worlds
**MAIN**

```text
Scalameta source AST
!=
project-owned neutral semantic model
!=
exact Dotty untpd AST
```

### M35 — Q
**MAIN**

Quotes-aware typed quasiquote/frontend world:

- `qr/qq`;
- `tqr/tqq`;
- `dqr/dqq`.

### M36 — N
**MAIN**

Compiler-free bounded semantic model.

Clarify:

```text
N != public n* syntax
```

### M37 — U-D
**MAIN**

Fresh exact untyped lowering.

This is the direction used for generated definitions going into Macro-Paradise.

### M38 — U-U
**MAIN**

Existing `untpd -> untpd` capture/preserve/rewrite/reconstruct direction.

Tie it to future real rewriting such as `@addOption`.

### M39 — C
**MAIN**

Cross-layer composition/integration/API policy; not another tree universe.

### M40 — Practical lowering path
**MAIN**

```text
Scalameta definition/quasiquote
 -> bounded semantic/projection plan where applicable
 -> exact generated-origin lowering
 -> positioned untpd
 -> Macro-Paradise placement
 -> ordinary typer
```

### M41 — Generating syntax is not enough
**MAIN**

Keep the technical checklist:

```text
AST shape
+ provenance
+ spans/positions
+ ownership
+ exact compiler representation
+ phase
```

---

# Part VIII — Macro-Paradise as a usable handler system

### M42 — Project / current versions / exact Scala lines
**MAIN**

Show:

- `0.1.1` released;
- `0.2.0-SNAPSHOT` current main;
- exact Scala 3.3.8 / 3.8.4 / 3.9.0;
- `CrossVersion.full` rationale.

### M43 — Marker + handler architecture
**MAIN**

```text
@myAnnotation
 -> compiled marker metadata
 -> handler discovery/loading
 -> ExpansionHandler.expand
```

### M44 — Current marker syntax / `@expander`
**MAIN**

Show real current syntax.

### M45 — Current `ExpansionHandler` contract
**MAIN**

Show real method signature and `ExpansionInput` / `ExpansionOutcome`.

### M46 — `@identity`
**MAIN**

Show the simplest current handler.

Purpose: teach the basic authoring protocol before generation complexity.

### M47 — Structured edits
**MAIN**

```text
ExpansionEdit.start
 -> helpers
 -> ExpansionEdit.finish
```

Show primary / companion / sibling sparse-change model.

### M48 — `@gen`
**MAIN**

Show a **current-protocol** generated-member example. Do not use historical `ParadiseAnnotationExpander` API in the main deck.

If the current repo does not have a canonical `GenHandler` class by that name, construct the slide from a verified current `ExpansionHandler`/`ExpansionEdit` equivalent and label it as the current-form equivalent of the historical `@gen` example.

### M49 — `@addFoo`: source-like authoring
**MAIN**

Show the Scalameta quasiquote:

```scala
q"def foo(x: Int): String = x.toString"
```

Then the generated-origin bridge.

### M50 — `@addFoo`: explicit companion creation
**MAIN**

Show `MissingCompanionPolicy.Create(...)` and placement helper.

### M51 — `@addFoo`: full end-to-end chain
**MAIN**

Return to the opening:

```scala
@addFoo
class A

A.foo(10)
```

and trace all stages to ordinary typer visibility.

### M52 — Scheduler
**MAIN**

Current staged-tree rescan after each successful expansion; generated handled annotations become work.

### M53 — Transaction / rollback / budget
**MAIN**

Show whole-unit rollback and default 256-success operational guard.

### O07 — Raw exact replacement
**OPTIONAL-IN-FLOW**

Show `ExpansionOutcome.Expanded(trees)` and exact-region replacement semantics.

### O08 — Primary / companion / siblings recomputation
**OPTIONAL-IN-FLOW**

Keep the detailed relationship-recomputation story.

---

# Part IX — How users wire it with sbt

The AutoPlugin setup is main material. Manual translation is backup.

### M54 — Why handlers are normally precompiled
**MAIN**

Explain the staging dependency:

```text
marker
handler implementation
consumer
```

### M55 — Same-build/local marker + handler projects
**MAIN**

Show the real `sbt-macroparadise` setup using:

```scala
MacroParadiseIntegration.precompiledProjects(
  macroAnnotations,
  macroHandlers
)
```

Include the marker API and exact Scala compiler dependency in the relevant projects.

### M56 — Published marker + handler modules
**MAIN**

Show:

```scala
macroParadiseMarkerModules := ...
macroParadiseHandlerModules := ...
```

Keep enough real `build.sbt` to be copyable/recognizable.

### O09 — What the AutoPlugin derives
**OPTIONAL-IN-FLOW**

Conceptual compiler inputs:

```text
-Xplugin-require
handlerClasspath
externalArtifactIdentity
```

### O10 — Exact compiler/classloader identity
**OPTIONAL-IN-FLOW**

Explain why raw Dotty trees / `Context` require one exact compiler/API universe.

---

# Part X — AUXify as downstream evidence

### M57 — AUXify architecture
**MAIN**

Show it as a real downstream consumer of Macro-Paradise + Quasiquotes.

### M58 — `@apply`
**MAIN**

Show conceptual generated helper and, if readable, a compact source-like builder/lowering fragment.

### M59 — `@aux`
**MAIN**

Show conceptual `Aux` alias and compact builder/lowering path.

### M60 — `@instance`
**MAIN**

Show generated instance constructor.

### M61 — `@delegated`
**MAIN**

Show generated forwarder.

### O11 — `@syntax`
**OPTIONAL-IN-FLOW**

Show selected Scala 3 extension-method design and clearly label **designed / not yet implemented**.

### O12 — `@self`
**OPTIONAL-IN-FLOW**

Show broader parity target and current bounded implementation caveat.

### M62 — Composition is the stronger test
**MAIN**

Show both source orders of a supported pair and explain why the second handler must see the current output of the first.

---

# Part XI — Existing-tree rewriting and future work

### M63 — Rewriting, not only generation
**MAIN**

Use:

```scala
@addOption
def foo(x: Int): String = rhs

// ->
def foo(x: Int): Option[String] = Option(rhs)
```

Connect this to U-U.

### M64 — Current limits / what not to claim
**MAIN**

Keep a technically explicit list:

- Class/Trait/Object package-level slice;
- exact Scala lines;
- precompiled handlers broad/default;
- bounded same-module experiment;
- no general same-file source-handler discovery;
- no arbitrary nested/local/method/val/type/given/extension targets;
- typed `dqr` not directly insertable into pre-typer plugin;
- `@syntax` not implemented;
- broad `@self` parity not implemented.

### M65 — Costs of pre-typer approach
**MAIN**

- compiler-internal coupling;
- exact-version dependence;
- positions/provenance responsibility;
- build/classloader complexity;
- IDE/incremental/same-module complexity;
- less help from public typed reflection.

### M66 — Possible future direct syntax
**MAIN**

Show:

```scala
class myAnnotation extends SomeFutureSuperParadiseAnnotationExpander:
  def expand(...) = ...
```

Main message:

> the syntax itself does not force deeper typer integration.

### O13 — Future syntax: precompiled vs same-module vs same-file
**OPTIONAL-IN-FLOW**

Keep the detailed design space from v8:

```text
precompiled -> current StandardPlugin model enough
same module/different file -> suspension/precompilation may be enough
same file -> bootstrap cycle
a full semantic-resolution requirement -> deeper namer/typer integration more relevant
```

### O14 — Same-module experiment details
**OPTIONAL-IN-FLOW**

Show bounded Model A and consumer suspension / handler compilation / resume.

---

# Part XII — Close

### M67 — What works today
**MAIN**

Return to the concise end-to-end `@addFoo` story as a summary.

### M68 — Conclusion
**MAIN**

```text
Scala 3 does have macro annotations.

Macro-Paradise explores a different design point:
pre-typer transformation when generated API itself must become ordinary compiler input.
```

Tie together:

- Macro-Paradise;
- Quasiquotes;
- AUXify.

### M69 — Scala Semantic Harness reminder
**MAIN — mandatory**

Second explicit mention, with repository/QR and feedback link.

### M70 — Links / questions
**MAIN**

- talk repo;
- Macro-Paradise;
- Quasiquotes;
- AUXify;
- contact.

---

# 5. Backup deck

The backup section should be substantial. Prefer moving material here over deleting it from the published artifact.

### B01 — Full biography / Stack Overflow / teaching / OSS

### B02 — Semantic Harness full install/onboarding/feedback material

### B03 — Parser implementation details

- `Scala3ParserBridge`;
- tiny parser façades;
- Scalameta-primary hybrid fallback semantics.

### B04 — Scala 2 Paradise analyzer implementation details

- plugin class / `components = Nil`;
- full analyzer/macro hook list;
- historical-version caveat around literal phase listing.

### B05 — Full Scala 2 `macroTransform` implementation

### B06 — Full Scala 3 reflection `make[A]` implementations

### B07 — Full native Scala 3 `MacroAnnotation` `@addFoo`

### B08 — Full Level 0–4 implementation code

### B09 — Full Q/N/U-D/U-U/C glossary and non-equivalences

### B10 — Full Scalameta → exact lowering architecture

### B11 — `@expander` Java annotation source and metadata semantics

### B12 — Exact compiler/classloader identity deep dive

### B13 — Full `ExpansionInput` / `ExpansionChanges` / helper API

### B14 — Raw `Expanded(trees)` semantics

### B15 — Full scheduler / rollback / budget details

### B16 — Full current `@identity`

### B17 — Full current-form `@gen`

### B18 — Full current `@addFoo` handler

### B19 — Full same-build `sbt-macroparadise` setup

### B20 — Full published-module `sbt-macroparadise` setup

### B21 — Manual same-build wiring

Preserve the low-level marker JAR / handler JAR / handler classpath / `ExternalArtifactIdentity` recipe.

### B22 — Manual published-module wiring

Preserve the full documented `Manual published marker and handler modules` `build.sbt`.

### B23 — Exact versions / release coordinates / JDK / sbt requirements

### B24 — Full AUXify `@apply` implementation path

### B25 — Full AUXify `@aux` implementation path

### B26 — Full AUXify `@instance` / `@delegated`

### B27 — `@syntax` design

### B28 — `@self` parity target vs current bounded support

### B29 — Annotation composition matrix / tested combinations

### B30 — Existing-tree U-U rewriting architecture

### B31 — Same-module Model A details / IDE/BSP/JPS qualification boundaries

### B32 — Future direct syntax full bootstrap analysis

### B33 — Historical API evolution

- `ParadiseAnnotationExpander`;
- `StructuredExpansionOutput`;
- old enum sketches;
- historical handler examples.

### B34 — `allow-experimental`

### B35 — Full current limits / “do not claim” checklist

### B36 — Full future-direction lists

### B37 — All links / contacts / mirrors

---

# 6. Route control: what to skip live

The deck is intentionally larger than the spoken route.

## Normal route

Default skip candidates, in this order:

1. O01 fuller biography;
2. O02 use-case expansion;
3. O03 analyzer hook-name detail;
4. O04 long reflection constructor;
5. O05 price-of-no-analyzer detail;
6. O06 manual typing of untpd;
7. O07 raw replacement;
8. O08 relationship recomputation detail;
9. O09 AutoPlugin-derived raw options;
10. O10 classloader deep dive;
11. O11 `@syntax`;
12. O12 `@self`;
13. O13 future-syntax consequences;
14. O14 same-module experiment detail.

These slides stay in their natural deck positions and remain part of the published technical artifact.

## Short route

In addition to the normal skips, compress live explanation of:

- M12/M13 Scala 2 `reify`/`make[A]`;
- M15 analyzer implementation detail;
- M20 native MacroAnnotation implementation;
- M28 ExprImpl;
- M30 `tpd`;
- M35–M39 Q/N/U-D/U-U/C to one sentence each;
- M52/M53 scheduler/rollback;
- M58–M61 AUXify individual annotations.

Do **not** remove the slides from the deck; speak them briefly or skip them in sequence.

## Do not cut first

Even if rehearsal is long, preserve in the normal spoken route:

- both Semantic Harness mentions;
- the opening `@addFoo` question;
- generated code vs generated API;
- Scala 2 Macro Paradise placement;
- native Scala 3 MacroAnnotation;
- StandardPlugin rationale;
- parser → Macro-Paradise → typer;
- Level 0–4 walk;
- Q/N/U-D/U-U/C placement;
- current marker/handler API;
- `@identity`, `@gen`, `@addFoo`;
- same-build and published-module sbt-plugin setup;
- AUXify architecture and at least `@apply`, `@aux`, composition;
- current limits;
- future direct syntax;
- conclusion.

---

# 7. Preservation policy relative to draft_v8

For every substantial section in `draft_v8.md`, deck implementation should record one of:

- **MAIN — visible and normally spoken**;
- **OPTIONAL-IN-FLOW — visible in narrative, skippable live**;
- **BACKUP — visible after Q&A divider**;
- **NOTES — speaker-only**.

Use **NOTES** only when a dedicated visible slide would add little value. Avoid `OMITTED` unless the material is duplicate, obsolete, factually wrong, or superseded by a clearer slide that preserves the same information.

When something from v8 is not represented, the implementation handoff must say exactly why.

---

# 8. Implementation rules for the future Slidev deck

1. Build the deck **fresh in `macroparadise-talk-09-2026`**. Do not treat `macroparadise-london-scala-talk-09-2026` as content authority or as a deck to be revised.
2. The old repo may be inspected only for isolated tooling/visual ideas if useful; do not inherit its content-compression assumptions.
3. `draft/draft_v8.md` is technical content authority.
4. `draft/presentation_plan_v3.md` is presentation-structure authority.
5. Verify current public project state before putting current API/version claims on slides.
6. Prefer current APIs in MAIN slides. Historical APIs belong in backup unless explicitly discussed as history.
7. Keep code projector-readable; split slides instead of shrinking fonts.
8. Keep optional-in-flow slides physically where they belong in the argument.
9. Put backup after a clear Q&A/backup divider.
10. Speaker notes should mark normal/full/short-route behavior.
11. No live demo is required; slides themselves must carry enough evidence.
12. The deck should be useful as a standalone technical reference after the meetup, not only as a live visual aid.

---

# 9. Success criteria

The next deck pass is successful when:

- a Scala developer can follow why generated API visibility motivates pre-typer transformation;
- an experienced Scala developer can see how this differs from native `MacroAnnotation`;
- the StandardPlugin/analyzer-plugin discussion is technically accurate;
- the audience actually sees the relevant tree levels and representations;
- Q/N/U-D/U-U/C makes the Scalameta/lowering story understandable;
- listeners see real current handler code, not only architecture diagrams;
- listeners see how to configure the plugin in sbt for local and published markers/handlers;
- AUXify demonstrates nontrivial downstream use and composition;
- the full technical deck preserves the great majority of `draft_v8.md` either in-flow or in backup;
- the normal spoken route can still fit roughly 34–37 minutes by skipping optional-in-flow slides;
- Semantic Harness is explicitly mentioned near both the beginning and the end.

This is the plan to use for the first fresh Slidev implementation in `macroparadise-talk-09-2026`.
