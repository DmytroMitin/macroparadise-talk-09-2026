# Presentation plan v2

Source content pool: `draft/draft_v8.md` at commit `1c9b30297f54e2962fbb3b2997a26b1b8a45d50c`.

Previous plan checkpoint: `draft/presentation_plan_v1.md`.

This revision incorporates the following presentation decisions:

- **Scala Semantic Harness is mandatory twice**: once near the beginning and once as a reminder near the end;
- **Q / N / U-D / U-U / C is part of the main explanatory spine**, because the Scalameta + lowering/bridge examples are otherwise hard to place conceptually;
- **sbt plugin setup is main-deck material** for both same-build/local marker+handler projects and published marker+handler modules;
- the corresponding **manual low-level sbt wiring stays in backup**;
- listeners should see how Macro-Paradise handlers are written, so **`@identity`, `@gen`, and current `@addFoo` are main-deck examples**;
- **possible future direct annotation/expander syntax stays in main**;
- the detailed consequences of precompiled vs same-module vs same-file expanders stay optional/backup;
- historical APIs remain backup material.

As before, `draft_v8.md` remains the additive source of truth. Material should normally move to **optional** or **backup**, not disappear.

## Goal and timing

London Scala slot: approximately 40 minutes.

Target planned speaking time for the normal route: **33–35 minutes**.

This route contains more visible code than v1, so timing should be validated by rehearsal rather than inferred only from slide count.

Reserve:

- ~3–4 minutes for pauses, transitions, projector/code-reading latency, or audience reaction;
- remaining time for questions;
- optional slides can be inserted when pace is faster than expected.

The audience should leave with these ideas:

1. Scala 3 already has macro annotations; the missing property here is **ordinary user-source visibility of newly generated API**.
2. That property motivates a transformation **after parser and before typer**.
3. Current Macro-Paradise can implement this as a Scala 3 `StandardPlugin` because it completes a bounded `untpd` transformation before ordinary semantic typing begins.
4. Scala 3 has multiple relevant representation worlds; the Quasiquotes project therefore separates Q / N / U-D / U-U / C concerns rather than pretending one tree representation solves every phase.
5. Source-like Scalameta authoring plus exact lowering bridges is one practical route to valid pre-typer `untpd` trees.
6. Macro-Paradise is not just a phase experiment: users can write handlers, wire marker/handler projects through `sbt-macroparadise`, compose edits transactionally, and build downstream libraries such as AUXify.
7. Scala Semantic Harness is another current project worth trying; mention it at both ends.

## Status labels

- **MAIN** — normal 33–35 minute route.
- **OPTIONAL** — prepared near its natural point; show when useful / ahead of time.
- **BACKUP** — after the conclusion / Q&A divider.
- **NOTES** — presenter knowledge; no dedicated visible slide required.

# Main deck

## Opening — about 2.5–3 minutes

### M01 — Title
**Status:** MAIN  
**Time:** ~0:20

- London Scala User Group emblem.
- Dmytro Mitin.
- **Can Scala 3 Have Macro Annotations Again? Rebuilding Macro Paradise**.
- 9 September 2026.

### M02 — Who I am / where the material lives
**Status:** MAIN  
**Time:** ~0:45

Compact version:

- Scala + Haskell developer and mathematician;
- metaprogramming / compilers / type systems;
- Stack Overflow / teaching / OSS in one sentence;
- talk repository + QR code.

Full biography remains O01/B01.

### M03 — Scala Semantic Harness announcement
**Status:** MAIN — mandatory  
**Time:** ~0:45–0:55

Show a compact version of:

```bash
cs install --default-channels=false \
  --channel https://raw.githubusercontent.com/DmytroMitin/scala-semantic-harness/main/distribution/coursier/channel.json \
  semantic-scala semantic-scala-mcp
```

Also show:

- repository;
- `skills/semantic-scala/SKILL.md`;
- one short phrase: semantic tooling for coding agents / Scala-aware feedback.

Full onboarding / early-feedback links remain B02.

### O01 — More about me
**Status:** OPTIONAL, after M02 or before M03

Preserve:

- mathematics and competitions;
- Stack Overflow rankings;
- courses/trainings;
- industries;
- Spark PR;
- Scala 3 PR.

---

# Part I — What problem are we solving? — about 4 minutes

### M04 — The question of the talk
**Status:** MAIN  
**Time:** ~1:00

```scala
@addFoo
class A

A.foo(10)
```

Ask explicitly:

> Should ordinary Scala name resolution and typing see `A.foo`?

Then show the conceptual generated companion.

This remains the running example and should return later.

### M05 — Generated code vs generated API
**Status:** MAIN  
**Time:** ~0:45

```text
Can an annotation generate definitions?          yes
Can new definitions become ordinary source API?  different question
```

State immediately that Scala 3 already has `scala.annotation.MacroAnnotation`.

### M06 — Three times
**Status:** MAIN  
**Time:** ~0:35

```text
compile macro/handler implementation
 -> compile client / execute expansion
 -> run generated program
```

### M07 — Ordinary method → inline → macro
**Status:** MAIN  
**Time:** ~0:55

One progression slide:

- ordinary method;
- Scala 3 `inline`;
- macro implementation executed while the client is compiled.

Scala 2 `@inline` nuance is a small note only.

### M08 — Macro annotations and use cases
**Status:** MAIN  
**Time:** ~0:40

Use `@addFoo` plus a compact list:

- generated members / companions / siblings;
- derivation / boilerplate;
- validation / instrumentation;
- transformations;
- type-class helpers / syntax.

---

# Part II — Scala 2: quasiquotes and Macro Paradise — about 3.5 minutes

### M09 — Manual trees → parser → quasiquotes
**Status:** MAIN  
**Time:** ~1:10

Preserve the progression:

```scala
Apply(Select(left, "+"), List(right))
```

then:

```scala
c.parse(s"$left + $right")
```

then:

```scala
q"$left + $right"
```

Core message:

- parsing: strings → trees;
- quasiquotes: structural tree holes/splices;
- construction and matching.

Exact parser implementation details stay B03.

### M10 — Scala 2 def macros / why tree quasiquotes mattered
**Status:** MAIN  
**Time:** ~0:55

Use only enough of `reify/splice` and `make[A]` to motivate arbitrary tree construction.

### M11 — Scala 2 Macro Paradise
**Status:** MAIN  
**Time:** ~1:15

Show:

```text
parser
 -> macroparadise / analyzer integration
 -> namer
 -> typer
```

Then:

> generated definitions participated in the normal downstream pipeline.

Mention analyzer/macro plugin hooks without listing every hook name. Full implementation details stay B04.

---

# Part III — Scala 3 design point and phase choice — about 4.5 minutes

### M12 — Scala 3 quotations / quoted reflection
**Status:** MAIN  
**Time:** ~0:50

Message:

> safer typed staged world, but not the same thing as Scala 2 arbitrary compiler-tree quasiquotes.

Use one short reflection-construction example. Full `make[A]` variants stay B05.

### M13 — Native Scala 3 `MacroAnnotation`
**Status:** MAIN  
**Time:** ~0:55

State accurately:

- real macro-annotation API;
- can transform and generate definitions;
- newly generated definitions have deliberately limited visibility outside expansion.

Full implementation stays B06.

### M14 — Two design points
**Status:** MAIN  
**Time:** ~0:35

```text
Scala 3 MacroAnnotation
  typed macro-expansion world
  generated definitions: limited external visibility

Paradise-style experiment
  pre-typer source transformation
  generated definitions: ordinary typer input
```

### M15 — StandardPlugin vs ResearchPlugin
**Status:** MAIN  
**Time:** ~0:35

```text
StandardPlugin -> contributes PluginPhase(s)
ResearchPlugin -> may replace/rearrange pipeline; nightly/snapshot
```

Then:

> Macro-Paradise is a research/experimental project implemented as a Scala 3 `StandardPlugin`.

### M16 — Why a StandardPlugin is enough
**Status:** MAIN  
**Time:** ~0:55

```text
parse
 -> bounded untpd rewrite
 -> ordinary typer once, on final program
```

Contrast with Scala 2 Paradise:

```text
Scala 2: expansion integrated while analyzer entered symbols
Scala 3 experiment: transform before semantic work becomes authoritative
```

Mention the price:

- bounded pre-typer identity;
- precompiled handlers by default;
- no general typed semantic information before expansion.

### M17 — Where Macro-Paradise runs
**Status:** MAIN  
**Time:** ~0:45

Visually strong phase diagram:

```text
source
 -> parser
 -> Macro-Paradise
    discovery / expansion / validation / composition
 -> typer
 -> later phases
```

---

# Part IV — Walk by trees and the Quasiquotes architecture — about 5.5 minutes

### M18 — The walk map: Levels 0–4
**Status:** MAIN  
**Time:** ~0:40

Preserve:

```text
Level 1   Level 2               Level 3     Level 4
Expr   -> (A) ExprImpl       -> tpd.Tree -> untpd.Tree
       -> (B) q.reflect.Term ->
```

Add Level 0: ordinary values / call site.

Explicitly: arrows mean direction of our walk, not compiler phase flow.

### M19 — Levels 0–2: public typed macro world
**Status:** MAIN  
**Time:** ~0:45

Combine:

- `Expr`;
- `ExprImpl`;
- `quotes.reflect.Term`;
- typed `qr"..."` at the reflection layer.

### M20 — Levels 3–4: `tpd` and `untpd`
**Status:** MAIN  
**Time:** ~0:45

Show the walk beside actual compiler direction:

```text
our walk:  tpd.Tree -> untpd.Tree
compiler:  parser -> untpd -> typer -> tpd
```

Landing point:

> Macro-Paradise operates at Level 4.

### M21 — Why typed `qr` / `dqr` cannot simply feed Macro-Paradise
**Status:** MAIN  
**Time:** ~0:40

```text
qr/dqr -> Quotes / typed reflection
Macro-Paradise -> untpd / pre-typer
```

### M22 — Q / N / U-D / U-U / C
**Status:** MAIN  
**Time:** ~1:05

This is now required explanatory vocabulary.

```text
Q
  Quotes-aware typed quasiquote/frontend world
  qr/qq, tqr/tqq, dqr/dqq

N
  neutral/compiler-free project semantic model

U-D
  fresh exact untpd lowering

U-U
  existing untpd -> untpd capture/rewrite/reconstruct

C
  cross-layer composition/integration/API policy
```

Explicitly note:

```text
C != another AST world
N != necessarily a public n* syntax
U != necessarily a public u* syntax
```

### M23 — Three representation worlds and practical lowering
**Status:** MAIN  
**Time:** ~1:00

First:

```text
Scalameta source AST
!= N neutral semantic model
!= exact Dotty untpd
```

Then practical route:

```text
Scalameta definition / q"..."
 -> projection / bounded semantic plan where applicable
 -> exact Quasiquotes lowering bridge
 -> positioned untpd
 -> Macro-Paradise placement
 -> ordinary typer
```

This slide is the bridge from Q/N/U vocabulary to the upcoming handlers.

### M24 — Generating syntax is not enough
**Status:** MAIN  
**Time:** ~0:35

```text
AST shape
+ provenance / positions
+ ownership
+ exact compiler representation
+ correct phase
```

This justifies the bridge/lowering machinery.

### B08 — Q/N/U-D/U-U/C deep dive
**Status:** BACKUP

Keep full architectural notes, future syntax questions, non-equivalences, and broader roadmap.

---

# Part V — How users actually write and run Macro-Paradise handlers — about 8 minutes

This part is intentionally practical. Listeners should leave knowing what a handler looks like and how the build makes it executable.

### M25 — End-to-end architecture
**Status:** MAIN  
**Time:** ~0:45

```text
marker annotation
 -> handler discovery
 -> precompiled ExpansionHandler
 -> ExpansionInput
 -> authored/lowered untpd changes
 -> validation + transactional composition
 -> staged package replacement
 -> ordinary typer
```

### M26 — Current marker / handler syntax
**Status:** MAIN  
**Time:** ~0:40

Show current-main form:

```scala
@expander("...Handler")
class myAnnotation extends StaticAnnotation

class MyAnnotationHandler extends ExpansionHandler:
  def expand(input: ExpansionInput)(using Context): ExpansionOutcome = ...
```

One sentence about `@expander`: runtime-retained metadata from marker to precompiled handler.

Full Java annotation implementation stays B10.

### M27 — `@identity`: minimal current handler
**Status:** MAIN  
**Time:** ~0:40

Show the current composable identity form:

```scala
final class IdentityHandler extends ExpansionHandler:
  def annotationName = "...identity"

  def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionEdit.finish(ExpansionEdit.start(input))
```

Purpose:

> establish the smallest complete handler before adding generation logic.

Historical `ParadiseAnnotationExpander` identity examples stay B22.

### M28 — `@gen`: first visible generated member
**Status:** MAIN  
**Time:** ~0:50

Show a **current-style** `@gen` equivalent using the current handler protocol.

Conceptual consumer:

```scala
@gen
class World

new World().generatedHello
```

The main deck must not show the old `ParadiseAnnotationExpander` API as current. If the exact current repository example is not named `GenHandler`, translate the old semantic example mechanically to current `ExpansionHandler` / `ExpansionEdit` / current helper/lowering APIs.

The historical prototype implementation stays B22.

### M29 — Structured edits
**Status:** MAIN  
**Time:** ~0:50

Show the model:

```text
primary   preserve / merge / replace / delete
companion preserve / merge / replace / create / delete
siblings  sparse create / merge / replace / delete
```

Then:

```text
ExpansionEdit.start
 -> immutable helpers
 -> ExpansionEdit.finish
```

Mention relationship recomputation / no companion-adjacency assumption.

Raw `Expanded(trees)` stays B12.

### M30 — `@addFoo`: current handler, end to end
**Status:** MAIN  
**Time:** ~1:30

Return to the opening example.

Show enough current code to make the handler real:

- `extends ExpansionHandler`;
- `ExpansionEdit.start`;
- Scalameta `q"def foo..."`;
- `ScalametaDefinitionGeneratedOriginBridge.lower(...)`;
- `ExpansionHelpers.placeMemberInCompanion(...)`;
- explicit `MissingCompanionPolicy.Create(...)`;
- `ExpansionEdit.finish`.

Then summarize:

```text
Scalameta q"def foo..."
 -> exact generated-origin lowering
 -> untpd.DefDef
 -> ExpansionEdit
 -> create companion + place member
 -> validate
 -> typer sees A.foo
```

This is the principal code payoff of the talk.

Full handler remains B14.

### M31 — Build topology: what must exist before consumer expansion
**Status:** MAIN  
**Time:** ~0:35

```text
marker classes on compile classpath
precompiled handler + closure on tool classpath
Macro-Paradise compiler plugin
artifact identity for incremental invalidation
```

Then:

> `sbt-macroparadise` automates the common cases.

### M32 — sbt plugin setup: local / same-build marker + handler projects
**Status:** MAIN  
**Time:** ~0:55

Show the released `0.1.1` setup with:

```scala
MacroParadiseIntegration.precompiledProjects(
  macroAnnotations,
  macroHandlers
)
```

plus:

```scala
.enablePlugins(MacroParadisePrecompiledPlugin)
.settings(macroParadiseCompilerProductVersion := "0.1.1")
```

and the important dependency edge:

```scala
.dependsOn(macroAnnotations % "provided->compile")
```

Do not show the manual marker-JAR / handler-classpath / identity implementation here; that stays B27.

### M33 — sbt plugin setup: published marker + handler modules
**Status:** MAIN  
**Time:** ~0:55

Show:

```scala
macroParadiseMarkerModules := Seq(...)
macroParadiseHandlerModules := Seq(...)
```

with `CrossVersion.full` and `% Provided` on the marker module.

Message:

> same semantic model, but coordinates are resolved rather than sibling projects packaged.

Manual published-module wiring stays B28.

### M34 — Scheduler + transaction
**Status:** MAIN  
**Time:** ~0:40

Combine:

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

Mention default budget 256 as a small note.

### O02 — Exact compiler / classloader identity
**Status:** OPTIONAL, after M31–M33

Explain:

- raw Dotty trees and `Context` cross the handler boundary;
- exact compiler/API class identity matters;
- `CrossVersion.full` and parent-first loading are therefore deliberate.

Full detail stays B11.

---

# Part VI — AUXify: downstream evidence — about 2.5–3 minutes

### M35 — AUXify as downstream consumer
**Status:** MAIN  
**Time:** ~0:40

```text
annotation
 -> Macro-Paradise scheduling / placement
 -> source-shape decoding
 -> Scalameta authoring
 -> Quasiquotes exact lowering
 -> ordinary typer
```

This ties Q/N/U + handler authoring together in an external consumer.

### M36 — Representative generated helpers
**Status:** MAIN  
**Time:** ~1:00

Compact conceptual examples:

- `@apply` — summon/materializer helper;
- `@aux` — `Aux` alias;
- `@instance` — instance constructor;
- `@delegated` — forwarder.

Mention:

- `@self` currently bounded;
- `@syntax` designed but not implemented;
- `@poly` postponed.

Full implementations stay B15–B18.

### M37 — Composition is the stronger test
**Status:** MAIN  
**Time:** ~0:45

Show both source orders of one supported pair, e.g. `@apply + @instance`.

Mention `@apply + @aux` and `@apply + @delegated`.

Message:

> the second handler sees the current result of the first transformation.

### O03 — `@self` / `@syntax` / parity status
**Status:** OPTIONAL

Keep broader type-level programming examples and status caveats.

---

# Part VII — Limits, future, close — about 3 minutes

### M38 — Current scope and costs
**Status:** MAIN  
**Time:** ~0:50

Two columns.

**Works today / current main**

- pre-typer `StandardPlugin`;
- package-level Class/Trait/Object;
- exact Scala 3.3.8 / 3.8.4 / 3.9.0;
- precompiled handlers by default;
- structured edits + raw escape hatch;
- deterministic scheduling + rollback.

**Costs / not general yet**

- compiler-internal coupling;
- exact-version dependence;
- IDE/incremental/same-module complexity;
- bounded identity before typer;
- no general nested/local/arbitrary-target support.

### M39 — Possible future syntax
**Status:** MAIN  
**Time:** ~0:40

Show:

```scala
class myAnnotation extends SomeFutureSuperParadiseAnnotationExpander:
  def expand(...) = ...
```

Main-slide conclusion only:

> the syntax itself does not force deeper typer integration; the decisive questions are whether the expander is already compiled and how much semantic resolution is required before expansion.

### O04 — Consequences of future direct syntax
**Status:** OPTIONAL, immediately after M39

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

Full discussion stays B20.

### M40 — Conclusion
**Status:** MAIN  
**Time:** ~0:35

```text
Scala 3 does have macro annotations.

Macro-Paradise explores a different design point:
transform before ordinary typing when generated API itself must become ordinary compiler input.
```

Reinforce:

```text
pre-typer Macro-Paradise
+ Q/N/U-aware Quasiquotes architecture
+ Scalameta/exact untpd lowering
+ real handlers / sbt integration
+ AUXify downstream experiments
```

### M41 — Scala Semantic Harness reminder
**Status:** MAIN — mandatory  
**Time:** ~0:30

Second mention, intentionally shorter than M03.

Show:

- repository;
- Coursier install command or short install line;
- early-feedback link / QR if available.

Phrase as a reminder:

> If you use coding agents on Scala, I’m also looking for feedback on Scala Semantic Harness.

### M42 — Links / questions
**Status:** MAIN  
**Time:** ~0:15

- talk repository / QR;
- Macro-Paradise;
- Quasiquotes;
- AUXify;
- Semantic Harness;
- contact.

---

# Estimated main-route timing

| Part | Planned talk time |
|---|---:|
| Opening + mandatory Semantic Harness announcement | ~2–2.5 min |
| I. Problem / macro concepts | ~3.5–4 min |
| II. Scala 2 / quasiquotes / Paradise | ~3–3.5 min |
| III. Scala 3 design point / plugin choice | ~4–4.5 min |
| IV. Tree walk + Q/N/U architecture | ~5–5.5 min |
| V. Handler writing + sbt setup + `@addFoo` | ~7.5–8 min |
| VI. AUXify | ~2.5 min |
| VII. Limits / future / conclusion + Harness reminder | ~2.5–3 min |
| **Nominal scripted total** | **~30–31.5 min** |

The scripted total is intentionally lower than the real expected duration. Code-heavy slides and live explanation usually add several minutes. Rehearsal target should be **33–35 minutes actual**, leaving a few minutes of slack inside the 40-minute slot.

# Optional slides in natural positions

1. **O01 More about me** — after M02.
2. **O02 Exact compiler/classloader identity** — after the sbt/build slides.
3. **O03 `@self` / `@syntax` / parity status** — after AUXify examples.
4. **O04 Future direct syntax consequences** — after M39.

These are optional because the main concepts already appear in the normal route; they are not discarded.

# Backup deck

The backup deck should remain substantial. It is the preferred destination for detail removed from visible main slides.

## B01 — Full biography / Stack Overflow / courses / OSS
All detail from `About myself`.

## B02 — Scala Semantic Harness details

- complete Coursier installation;
- `skills/semantic-scala/SKILL.md`;
- `docs/agent-onboarding.md`;
- `docs/early-feedback.md`;
- repository and feedback links.

## B03 — Parsing implementation details

- Scala 2 `c.parse`;
- Dotty `Scala3ParserBridge`;
- `TinyTermParser` / `TinyTypeParser`;
- Scalameta-primary hybrid frontend and fallback condition.

## B04 — Scala 2 Paradise analyzer internals

- outer `nsc` plugin;
- `components = Nil`;
- `AnalyzerPlugin` + `MacroPlugin`;
- `pluginsEnterStats`, `pluginsEnterSym`, `pluginsEnsureCompanionObject`, `pluginsTypedMacroBody`, `pluginsTypeSig`;
- protocol/design-trade caveat.

## B05 — Full Scala 3 quoted-reflection `make[A]` examples
Both manual construction versions.

## B06 — Full native Scala 3 `MacroAnnotation` `@addFoo`
Full `Symbol.newModule` / `ClassDef.module` implementation.

## B07 — Full Level 0–4 walk code

- `Expr`;
- `ExprImpl`;
- `quotes.reflect.Term`;
- `tpd.applyOverloaded`;
- `TypedSplice` + `Typer.typedExpr`;
- manual `untpd.Apply/Select`.

## B08 — Q / N / U-D / U-U / C deep dive
Full architecture, non-equivalences, future `n*` / `u*` questions, and composition policy.

## B09 — Scala 2 “one tree world” vs Scala 3 split
Conceptual deep dive.

## B10 — `@expander` implementation

- Scala marker vs Java runtime annotation;
- full `@Retention(RUNTIME)` / `@Target(...)` source;
- current vs historical handler naming.

## B11 — Exact compiler and classloader identity

- `CrossVersion.full`;
- raw tree / `Context` identity;
- parent-first universe;
- why child compiler copies are invalid.

## B12 — Raw exact replacement
`ExpansionOutcome.Expanded(trees)`, deletion, ordering, topology validation.

## B13 — Primary / companion / siblings and recomputation
Current-revision labels, companion non-adjacency, recomputation and validation.

## B14 — Full current-main `@addFoo` handler
Complete current code with `ExpansionEdit`, Scalameta q, generated-origin bridge and explicit companion creation.

## B15 — Full `@apply` AUXify example
Conceptual output + handler + Scalameta builder/lowering.

## B16 — Full `@aux` AUXify example
Conceptual `Aux` + handler + type-alias builder/lowering.

## B17 — `@instance` / `@delegated`
Full conceptual examples and current bounded status.

## B18 — `@syntax` / `@self` / `@poly`
Selected / bounded / postponed status plus parity examples.

## B19 — Same-module support

- broad/default precompiled architecture;
- bounded different-file Model A;
- suspend / compile handler / resume consumer;
- IDE/BSP/JPS qualification boundaries if useful.

## B20 — Future direct syntax and bootstrap cases
Full precompiled / same-module / same-file / semantic-resolution discussion.

## B21 — Current target scope
Full supported/unsupported target list.

## B22 — Historical API evolution

- `ParadiseAnnotationExpander`;
- `StructuredExpansionOutput`;
- old `ExpansionOutcome` sketches;
- historical `@identity`, `@gen`, `@addFoo` blocks.

Historical APIs stay here, not in the main route.

## B23 — Current structured API in detail

- `ExpansionChanges`;
- primary/companion/sibling variants;
- `ExpansionEdit.start` / helper chain / `finish`;
- conflict / missing-companion policies.

## B24 — Scheduler / rollback / budget details

- rescanning;
- generated handled annotations;
- identity ledger;
- 256-success budget;
- whole-unit rollback modes.

## B25 — Released `0.1.1`: full same-build sbt AutoPlugin setup
Full version of M32.

## B26 — Released `0.1.1`: full published-module AutoPlugin setup
Full version of M33.

## B27 — Manual setup: local/same-build projects
Preserve the lower-level marker JAR / handler JAR / handler closure / `ExternalArtifactIdentity` wiring from v8.

## B28 — Manual setup: published modules (`0.2.0-SNAPSHOT` current protocol)
Preserve the complete manual published-module `build.sbt` from `EXTERNAL_HANDLER_AUTHORING.md`.

## B29 — Project structure / versions / how to play

- `sbt new`;
- clone commands;
- released/current versions;
- exact Scala lines;
- JDK/sbt requirements;
- marker/handler/core topology.

## B30 — Rewriting existing definitions
`@addOption` and the U-U existing-tree capture/rewrite architecture.

## B31 — `allow-experimental`
Precise current semantics and link as related compiler-plugin work.

## B32 — Full current limits / “do not claim” checklist
Presenter safety / Q&A reference.

## B33 — Future directions
Full Macro-Paradise / Quasiquotes / AUXify future lists.

## B34 — Contacts / all links
LinkedIn, GitHub, Facebook, X, Instagram, Threads, YouTube, email and public mirrors.

# Mapping v8 sections to presentation disposition

| v8 material | Default disposition in v2 |
|---|---|
| First slide | MAIN M01 |
| This presentation | MAIN M02/M42 |
| About myself | MAIN compact M02 + O01/B01 |
| Semantic Harness announcement | MAIN M03 + MAIN M41 + B02 |
| Disclaimer / versions | compact MAIN M38 + B29/B32 |
| Question of the talk | MAIN M04 |
| Generated code vs generated API | MAIN M05 |
| Different times | MAIN M06 |
| Ordinary / inline / macro | MAIN M07 |
| Macro annotations / use cases | MAIN M08 |
| What are quasiquotes? | MAIN M09 + B03 |
| Scala 2 reify/splice | MAIN compact M10 |
| Scala 2 quasiquotes | MAIN M09/M10 |
| Scala 2 Macro Paradise | MAIN M11 + B04 |
| Scala 3 quotations / reflection | MAIN M12 + B05 |
| Scala 3 MacroAnnotation | MAIN M13/M14 + B06 |
| Standard vs Research plugin | MAIN M15 |
| Why StandardPlugin is enough | MAIN M16 |
| Why Scala 2 needed analyzer integration | MAIN M16 + B04 |
| Where Macro-Paradise runs | MAIN M17 |
| Our Scala 3 quasiquotes | MAIN M19/M21/M22/M23 |
| Walk Levels 0–4 | MAIN M18–M20 + B07 |
| Why typed qr/dqr not direct | MAIN M21 |
| Q/N/U-D/U-U/C | MAIN M22 + B08 |
| Three representation worlds | MAIN M23 |
| Neutral/exact lowering path | MAIN M23 |
| Generating syntax is not enough | MAIN M24 |
| Macro-Paradise / related repos | MAIN M25 + M35 + B31 |
| Why handlers precompiled | MAIN M31 + B19/B29 |
| Classloader identity | O02/B11 |
| Possible future syntax | MAIN M39 |
| Future syntax consequences | O04/B20 |
| Current marker / handler syntax | MAIN M26 |
| What is @expander? | MAIN one sentence M26 + B10 |
| `@identity` current | MAIN M27 |
| `@identity` historical | B22 |
| `@gen` semantic example | MAIN M28, currentized API |
| `@gen` historical prototype | B22 |
| current `@addFoo` | MAIN M30 + B14 |
| historical `@addFoo` | B22 |
| Project structure / how to play | MAIN M31–M33 compact + B29 |
| sbt same-build/local AutoPlugin setup | MAIN M32 + B25 |
| sbt published marker/handler AutoPlugin setup | MAIN M33 + B26 |
| manual sbt local wiring | B27 |
| manual sbt published wiring | B28 |
| plugin vs handler ownership | MAIN M25/M29 |
| Current target model | MAIN compact M38 + B21 |
| primary / companion / siblings | MAIN M29 + B13 |
| structured transformation | MAIN M29 + B23 |
| raw replacement | B12 |
| scheduler | MAIN M34 + B24 |
| transaction / rollback | MAIN M34 + B24 |
| AUXify downstream role | MAIN M35 |
| `@apply` / `@aux` / `@instance` / `@delegated` | MAIN M36 + B15–B17 |
| AUXify composition | MAIN M37 |
| `@self` / `@syntax` / `@poly` | MAIN short status M36 + O03/B18 |
| rewriting existing definitions | B30 |
| current limits / costs | MAIN M38 + B21/B32 |
| full future directions | MAIN M39 compact + B20/B33 |
| Semantic Harness reminder | MAIN M41 |
| contact links | MAIN M42 + B34 |

# Rehearsal policy

The main route now deliberately includes more practical material than v1. If rehearsal runs long, do **not** first remove the following:

- M03 / M41 Semantic Harness mentions;
- M22 Q/N/U-D/U-U/C;
- M27 `@identity`;
- M28 `@gen`;
- M30 `@addFoo`;
- M32 same-build/local sbt plugin setup;
- M33 published-module sbt plugin setup.

Those are explicit content priorities.

If time needs to be recovered, compress or move material in roughly this order:

1. M06 Three times — fold verbally into M07;
2. M10 Scala 2 def-macro detail — shorten to one motivating example;
3. M14 Two design points — merge into M13 or M15;
4. M24 Generating syntax is not enough — fold into M23;
5. M38 detailed cost bullets — keep only the strongest 3+3;
6. optional slides O01–O04 stay skipped by default.

If rehearsal is short, promote in this order:

1. O02 classloader identity;
2. O04 future syntax consequences;
3. O03 `@self` / `@syntax` parity details;
4. O01 fuller biography.

# Production guidance

- Keep the dark-on-white projector-safe visual direction.
- Prefer one idea per slide, but allow successive slides to reuse the same code while highlighting different lines.
- For `@identity` → `@gen` → `@addFoo`, use progressive complexity: listeners should feel they are learning one handler protocol, not seeing three unrelated code samples.
- For Q/N/U-D/U-U/C, use one stable visual legend and reuse the letters later beside Scalameta/lowering/handler slides.
- Label examples visibly when they are released `0.1.1` vs current-main `0.2.0-SNAPSHOT`.
- Main sbt slides should show the AutoPlugin-facing setup; backup slides should show the manual translation beneath it.
- Historical API names must be visually marked **Historical / prototype** and kept out of the normal main-route handler examples.
- Keep the main `@addFoo` example technically current and end-to-end.
- Put a clear divider before backup slides so a long backup deck does not look like an unfinished main deck.
