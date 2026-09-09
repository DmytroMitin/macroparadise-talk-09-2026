# Draft v8 content coverage

This ledger maps the substantial content in `draft/draft_v8.md` to the fresh Slidev deck. Slide identifiers are stable source comments in `slides.md`. `MAIN` and `OPTIONAL-IN-FLOW` slides precede Q&A; `BACKUP` slides follow the Q&A divider. `NOTES` means the detail lives in speaker/source comments or is preserved through a more specific visible slide.

The primary-status column is used for the handoff summary. Additional destinations show where the deck repeats or expands the material. No substantial v8 section is silently deleted.

| Draft v8 section | Primary status | Slide destinations | Preservation note |
|---|---|---|---|
| Draft v8 goals and additive-preservation policy | NOTES | source comments; this ledger | Governs the implementation rather than becoming audience copy. |
| First slide | MAIN | M01 | Title, group, speaker, date, and emblem. |
| This presentation | MAIN | M02, M70, B37 | Talk repository and publication context; unconfirmed mirror ideas remain NOTES. |
| About myself | OPTIONAL-IN-FLOW | M02, O01, B01 | Short route introduction plus full biography and OSS evidence. |
| Scala Semantic Harness announcement | MAIN | M03, B02 | Project purpose, repository, Coursier command, and canonical skill path. |
| Disclaimer, release/development lines, exact Scala versions | MAIN | M42, M64, B23, B35 | Visible experimental and exact-version boundaries. |
| The question of the talk | MAIN | M04, M51, M67 | `@addFoo class A` and ordinary `A.foo(10)` visibility. |
| Generated code vs generated API | MAIN | M05, M21, M68 | Native generation capability preserved; visibility distinction drives the deck. |
| Different execution times | MAIN | M06 | Handler compilation, client compilation/expansion, program runtime. |
| Ordinary method | MAIN | M07 | Real code and execution boundary. |
| Scala 2 and Scala 3 inline methods | NOTES | M07; B06 context | Scala 3 semantics visible; Scala 2 optimizer-hint nuance is speaker detail. |
| Scala 2 and Scala 3 def macros | MAIN | M07, M12, M13, M17 | Real macro implementations and staging. |
| What macro annotations are | MAIN | M08 | Primary/companion/sibling transformation model. |
| Macro-annotation use cases | OPTIONAL-IN-FLOW | O02 | Full use-case list remains in natural narrative position. |
| Manual AST, parsing, and quasiquotes | MAIN | M09, M10, M11 | Construction and matching; strings-to-trees versus structural holes. |
| Scala 2 `reify` / `splice` | MAIN | M12 | Typed-expression limitation retained. |
| Scala 2 quasiquotes and `make[A]` | MAIN | M13, B05 | Structural sequence splice and constructor example. |
| Scala 2 Macro Paradise semantics | MAIN | M14, M16 | Pre-namer/typer generated-API behavior. |
| Scala 2 analyzer/macro integration | MAIN | M15, O03, B04 | Plugin container, `components = Nil`, registrations, and representative hooks. |
| Scala 3 quotations and splices | MAIN | M17 | Typed `Expr` implementation. |
| Scala 3 standard quoted reflection | MAIN | M18, O04, B06 | Manual `Select.overloaded` and full constructor path. |
| Native Scala 3 `MacroAnnotation` | MAIN | M19, M20, B07 | Real typed API and module-generation code, with exact visibility boundary. |
| StandardPlugin vs ResearchPlugin | MAIN | M22, B35 | Official taxonomy and no Scala 3 analyzer-plugin category. |
| Why StandardPlugin is sufficient | MAIN | M23, M25 | Bounded pre-typer rewrite and stock typer on final program. |
| Protocol contrast with Scala 2 analyzer integration | MAIN | M24, O05 | Different responsibility split and explicit tradeoff qualification. |
| Annotation identity before typer | OPTIONAL-IN-FLOW | O05, B13 | Bounded syntactic/import-aware model, not general semantic resolution. |
| Precompiled handler implementation | MAIN | M43, M54 | Executable code exists before consumer typing. |
| Generated-symbol ownership | MAIN | M23, M40, M51 | Ordinary Dotty typer enters and types the final generated program. |
| Companion discovery and recomputation | OPTIONAL-IN-FLOW | M47, M50, O08 | Explicit creation, current relationships, recomputation after edit. |
| Price of avoiding analyzer integration | OPTIONAL-IN-FLOW | O05, M64, M65 | Raw-tree, target, precompilation, and semantic limits. |
| Where Macro-Paradise runs | MAIN | M25 | `runsAfter(parser)` / `runsBefore(typer)` and staged responsibilities. |
| Scala 3 typed Quasiquotes and ranked splices | MAIN | M29, M35, B09 | `qr/qq`, `tqr/tqq`, `dqr/dqq`; explicit sequence transport retained in backup context. |
| Walk by tree representations | MAIN | M26, M32, B08 | Original Level 0–4 map and compiler direction kept distinct. |
| Level 0 call site | MAIN | M27 | Ordinary arguments entering staging. |
| Level 1 `Expr` | MAIN | M27 | Typed quotation and splice. |
| Level 2A `ExprImpl` | MAIN | M28 | Internal cast, tree, and scope. |
| Level 2B `quotes.reflect.Term` | MAIN | M29 | Manual reflection and typed quasiquote side by side. |
| Level 3 `tpd.Tree` | MAIN | M30, O06 | `tpd.applyOverloaded` and explicit typer bridge. |
| Level 4 `untpd.Tree` | MAIN | M31 | Exact manual raw construction and phase meaning. |
| Why typed `qr` / `dqr` do not directly solve pre-typer authoring | MAIN | M33 | Typed staged versus raw pre-typer representations. |
| Three representation worlds | MAIN | M34 | Scalameta, neutral model, exact Dotty `untpd`. |
| Current neutral/exact lowering path | MAIN | M40, B10 | Focused bridges; no claim that all paths expose all intermediates. |
| Syntax, provenance, positions, ownership, exact representation, phase | MAIN | M41 | Full technical checklist and virtual source provenance. |
| Macro-Paradise and related repositories | MAIN | M42, M57, M70 | Product identity and ecosystem links. |
| Released starter / clone commands | BACKUP | B23, B37 | Release route and repository links retained as reference; no live demo dependency. |
| Versions and exact compiler identity | MAIN | M42, O10, B12, B23 | `CrossVersion.full`, exact lines, classloader identity. |
| Why handlers are precompiled | MAIN | M54 | Marker-handler-consumer topology. |
| Exact classloader identity | OPTIONAL-IN-FLOW | O10, B12 | Parent-first compiler/API universe and transitive closure. |
| Possible future direct syntax | MAIN | M66 | Requested inheritance-style surface and main conclusion. |
| Future precompiled annotation/expander | MAIN | M66, O13 | Current model remains sufficient. |
| Future same-module/different-file staging | OPTIONAL-IN-FLOW | O14, B31 | Suspension, compilation, loading, resume. |
| Future same-file bootstrap problem | OPTIONAL-IN-FLOW | O13, B32 | Cycle and possible design choices. |
| Semantic superclass recognition | OPTIONAL-IN-FLOW | O13, B32 | Bounded syntax versus full semantic resolution. |
| Current marker and handler syntax | MAIN | M44, M45 | Unified `ExpansionHandler` API from current Macro-Paradise main. |
| What `@expander` is | MAIN | M43, M44, B11 | Runtime-retained Java metadata; not the transformation itself. |
| Project structure | MAIN | M54, M55 | Marker, handler, consumer roles. |
| sbt same-build setup | MAIN | M55, B19 | AutoPlugin setup with current local compiler/API product selection. |
| sbt published-module setup | MAIN | M56, B20 | Marker and handler coordinates kept distinct. |
| Current-main sbt note | NOTES | M55, M56, B23 | Released generic sbt plugin versus locally built `0.2.0-SNAPSHOT` compiler/API. |
| Manual same-build wiring | BACKUP | B21 | Marker JAR, handler closure, identity, and compiler options. |
| Manual published-module wiring | BACKUP | B22 | Tool-only configuration and complete handler closure. |
| Plugin versus handler ownership | MAIN | M45, M47, B13 | Plugin-minted input and privately applied/validated changes. |
| Current target model | MAIN | M45, M64, B35 | Class/Trait/Object package-level slice and unsupported target list. |
| Current staged primary/companion/sibling relationships | OPTIONAL-IN-FLOW | O08, B13 | Invocation-revision addresses and recomputation. |
| Current structured transformation model | MAIN | M47 | Immutable edit pipeline and sparse domains. |
| Raw exact replacement | OPTIONAL-IN-FLOW | O07, B14 | `Expanded(Nil)`, exact order, validation, no privileged first tree. |
| Current `@identity` | MAIN | M46, B16 | Minimal unified protocol. |
| Historical `@identity` forms | BACKUP | B33 | Old expander and structured-output names clearly labelled historical. |
| `@gen` | MAIN | M48, B17 | Current-protocol equivalent verified from contract probe. |
| Current-stage scheduling and stacked annotations | MAIN | M52, M62, B15 | Current-tree rescan and generated work. |
| Transactional rollback and budget | MAIN | M53, B15 | Whole-unit rollback and 256-stage operational guard. |
| Current `@addFoo` | MAIN | M49, M50, M51, B18 | Scalameta authoring, generated-origin lowering, explicit companion creation. |
| Historical `@addFoo` primary-member prototype | BACKUP | B33 | Historical API retained without presenting it as current. |
| AUXify architecture | MAIN | M57 | Downstream source-decoding, lowering, placement, typer chain. |
| AUXify `@apply` | MAIN | M58, B24 | Simple and path-dependent result forms. |
| AUXify `@aux` | MAIN | M59, B25 | Companion `Aux` alias and bounded lowering. |
| AUXify `@instance` | MAIN | M60, B26 | Factory plus bounded inherited concrete member status. |
| AUXify `@delegated` | MAIN | M61, B26 | Bounded forwarder shape. |
| AUXify `@syntax` | OPTIONAL-IN-FLOW | O11, B27 | Designed/characterized and visibly not implemented. |
| AUXify `@self` | OPTIONAL-IN-FLOW | O12, B28 | Current bounded implementation versus parity target. |
| AUXify `@poly` | OPTIONAL-IN-FLOW | O12, B36 | Postponed; no claim of implementation. |
| AUXify annotation composition | MAIN | M62, B29 | Three bounded pairs, both source orders, no arbitrary-stack claim. |
| Rewriting existing definitions | MAIN | M63, B30 | `@addOption` and separate U-U preservation problem. |
| Q / N / U-D / U-U / C architecture | MAIN | M35–M39, B09 | All labels and non-equivalences visible. |
| Scala 2 one-tree-world comparison | NOTES | M32, M34, M63 | Speaker explanation connects the older shared Tree universe to Scala 3 separation. |
| Current limits / what not to claim | MAIN | M64, B35 | Concrete limits remain visible and repeated in backup. |
| Concise end-to-end story | MAIN | M67 | Eight-stage v8 story condensed without losing the semantic chain. |
| Difference from native MacroAnnotation | MAIN | M21, M68 | Typed expansion versus pre-typer source transformation. |
| Costs of the pre-typer approach | MAIN | M65 | Full engineering-cost list. |
| Future directions | BACKUP | B36 | Macro-Paradise, Quasiquotes, and AUXify directions. |
| Semantic Harness reminder | MAIN | M69 | Repository, early-feedback guide, canonical skill. |
| Subscribe / contact | MAIN | M70, B37 | Core links in main; full reference links in backup. |

## Omissions

No substantial technical section is marked `OMITTED`.

Unconfirmed “QR code?”, SlideShare/mirror placeholders, the smiley, and repetitive clone-transport variants are not promoted to dedicated slides. The stable repository links remain visible in M02, M70, and B37; the open publication ideas remain speaker-only because v8 itself marks them as questions rather than established facts.

## Current-source correction boundary

Macro-Paradise current `main` at inspection time exposes the unified `ExpansionHandler` / `ExpansionEdit` / `ExpansionChanges` surface. AUXify current `main` still targets a pinned accepted Macro-Paradise `0.2.0-SNAPSHOT` peer graph and its implementation source uses the earlier handler surface. Therefore current handler-authoring slides use Macro-Paradise’s unified API, while AUXify slides teach verified generated semantics, admitted source shapes, composition results, and status without relabelling its implementation snippets as unified-current API.
