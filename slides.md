---
theme: default
title: Can Scala 3 Have Macro Annotations Again? Rebuilding Macro Paradise
info: London Scala User Group, 9 September 2026
author: Dmytro Mitin
lineNumbers: true
highlighter: shiki
transition: fade-out
aspectRatio: 16/9
canvasWidth: 1280
fonts:
  sans: Inter
  mono: JetBrains Mono
---

<!-- id: M01 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

<div class="kicker">London Scala User Group · 9 September 2026</div>

# Can Scala 3 Have Macro Annotations Again?

<div class="subtitle">Rebuilding Macro Paradise</div>

<div style="display:flex; align-items:center; gap:1.4rem; margin-top:2rem">
  <img src="./draft/london_scala_emblem_400x400.jpg" alt="London Scala emblem" style="width:150px; height:150px; object-fit:cover; border-radius:50%" />
  <div><strong>Dmytro Mitin</strong><br/><span class="muted">Scala metaprogramming, compilers, types</span></div>
</div>

<!-- Emphasize the question, not a promise of production readiness. -->

---

<!-- id: M02 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# About me and this talk

<div class="two-col">
<div>

- Scala and Haskell developer, mathematician
- Former university teacher
- Metaprogramming, compilers, type systems
- Stack Overflow, OSS, compiler research

</div>
<div>

**Talk repository**  
github.com/DmytroMitin/macroparadise-talk-09-2026

**Related work**  
Macro-Paradise · Quasiquotes · AUXify

</div>
</div>

<!-- Keep this concise in every route. -->

---

<!-- id: O01 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# A longer introduction

<div class="two-col small">
<div>

- Analysis, function theory, approximation theory
- Mathematics competitions: trainer, team leader, jury chair
- Dependent-types courses and Shapeless/macros training
- Telecom, fintech, cybersecurity, compilers, messaging, web

</div>
<div>

<img src="./draft/stackoverflow.png" alt="Stack Overflow profile evidence" style="width:100%; max-height:320px; object-fit:contain" />

Scala 3 compiler PR #26002 fixed deferred-inline selection after `summonInline`.

</div>
</div>

<!-- Full route only. Rankings and PR links are preserved in backup B01. -->

---

<!-- id: M03 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Scala Semantic Harness

Scala-specific semantic evidence for coding agents. The compiler, build, and tests remain the final oracle.

```bash
cs install --default-channels=false \
  --channel https://raw.githubusercontent.com/DmytroMitin/scala-semantic-harness/main/distribution/coursier/channel.json \
  semantic-scala semantic-scala-mcp
```

github.com/DmytroMitin/scala-semantic-harness  
`skills/semantic-scala/SKILL.md`

<!-- Mandatory opening mention. Ask for real-project feedback, do not oversell. -->

---

<!-- id: M04 | route: MAIN | full: 0:46 | normal: 0:44 | short: 0:40 -->

# The question of the talk

<div class="two-col">
<div>

```scala
@addFoo
class A

A.foo(10)
```

</div>
<div>

Conceptual expansion:

```scala
class A

object A:
  def foo(x: Int): String =
    x.toString
```

</div>
</div>

<div class="callout">Should ordinary user-written Scala see <code>A.foo</code>?</div>

<!-- Pause on the question. It drives every later representation choice. -->

---

<!-- id: M05 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Generated definitions and source-visible API

Scala 3 already has experimental macro annotations. They can transform and generate definitions.

<pre class="diagram">generate definitions
        ≠
make new definitions input to ordinary subsequent name resolution and typing</pre>

Macro-Paradise explores the second semantic contract.

<!-- Avoid saying native MacroAnnotation cannot generate code. The visibility boundary is narrower. -->

---

<!-- id: M06 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Three execution boundaries

<pre class="diagram">1  compile macro or handler implementation
2  compile client
   expansion implementation executes
   compiler trees are produced or transformed
3  run generated program
   ordinary generated code executes</pre>

“Macro runtime” usually means client compilation time, not program runtime.

<!-- Emphasize the two different meanings of execution. -->

---

<!-- id: M07 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Ordinary method, inline method, macro

```scala
def add(left: Int, right: Int): Int = left + right

inline def addInline(left: Int, right: Int): Int =
  left + right

inline def addMacro(left: Int, right: Int): Int =
  ${ addImpl('left, 'right) }

def addImpl(left: Expr[Int], right: Expr[Int])
    (using Quotes): Expr[Int] =
  '{ $left + $right }
```

Body at runtime · language-level inline expansion · compile-time tree production

<!-- Point to the implementation invocation and the generated expression. -->

---

<!-- id: M08 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# Macro annotations

```scala
@addFoo
class A
```

An annotation handler transforms the annotated definition and may also change its companion or create siblings.

```text
annotated definition + context
               ↓
transformed primary + companion changes + sibling changes
```

For this talk, the generated structure must exist before ordinary typing.

<!-- Distinguish definition transformation from def-macro expression expansion. -->

---

<!-- id: O02 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Macro-annotation use cases

- Generate boilerplate members, companions, or sibling definitions
- Derive type-class helpers and syntax
- Instrument or validate definitions
- Transform an existing definition
- Enforce compile-time structural constraints

The most demanding cases change the API that later source code may reference.

<!-- Full route only. Keep examples concrete. -->

---

<!-- id: M09 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Manual AST construction

```scala
Apply(Select(left, "+"), List(right))
```

Every syntactic choice becomes a constructor choice:

- which tree node?
- which name representation?
- which nesting and argument shape?

<!-- The code is intentionally small. Let the constructor noise make the point. -->

---

<!-- id: M10 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Parsing as the middle ground

```scala
c.parse(s"$left + $right")
```

<div class="two-col">
<div><strong>Parser</strong><br/>strings → trees<br/>interpolation still travels through text</div>
<div><strong>Project frontends</strong><br/><code>Scala3ParserBridge</code> + tiny façades<br/>Scalameta-primary hybrid with Dotty fallback only after Scalameta parse failure</div>
</div>

Moving backward and forward between tree values and source strings remains awkward.

<!-- Keep the fallback semantics exact: fallback only when Scalameta parsing fails. -->

---

<!-- id: M11 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Structural quasiquotes

```scala
val sum = q"$left + $right"       // construct

tree match
  case q"$left + $right" =>       // match
    (left, right)
```

<pre class="diagram">trees → source-like template with structural holes/splices → trees</pre>

The holes are AST fragments, not merely text. Ranked splices can represent sequences of trees.

<!-- Contrast the type of left/right with string interpolation. -->

---

<!-- id: M12 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# Scala 2 `reify` and `splice`

```scala
def addImpl(c: blackbox.Context)(
    left: c.Expr[Int], right: c.Expr[Int]
): c.Expr[Int] = {
  import c.universe._
  reify { left.splice + right.splice }
}
```

The quoted expression had to typecheck when the macro implementation compiled. Some desired syntax could not be expressed as an already valid ordinary expression.

<!-- Short route: state the limitation and move on. -->

---

<!-- id: M13 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# Scala 2 quasiquotes and sequence splicing

```scala
def makeImpl[A: c.WeakTypeTag](c: blackbox.Context)(
    args: c.Tree*
): c.Tree = {
  import c.universe._
  q"new ${weakTypeOf[A]}(..$args)"
}
```

`..$args` inserts a sequence of argument trees structurally. The template need not already be a typechecked ordinary Scala expression in the macro implementation.

<!-- Emphasize the sequence splice and constructor type. -->

---

<!-- id: M14 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Scala 2 Macro Paradise semantics

<pre class="diagram">parser
  ↓
macroparadise / analyzer integration
  ↓
namer → packageobjects → typer
  ↓
later phases</pre>

Generated definitions participated in the normal downstream compiler pipeline.

<!-- This is the user-visible phase relationship, not the complete implementation story. -->

---

<!-- id: M15 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# How Scala 2 Paradise integrated

```scala
class ParadisePlugin(...) extends Plugin
    with AnalyzerPlugins {
  val components = Nil

  analyzer.addAnalyzerPlugin(AnalyzerPlugin)
  analyzer.addMacroPlugin(MacroPlugin)
}
```

The outer artifact was an ordinary `nsc` plugin. Expansion relied on analyzer and macro hooks inside naming and typing, not only a conventional extra phase.

<!-- Short route: read only components = Nil and the two registrations. -->

---

<!-- id: O03 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Scala 2 analyzer hooks

```text
pluginsEnterStats
pluginsEnterSym
pluginsEnsureCompanionObject
pluginsTypedMacroBody
pluginsTypeSig
```

These hooks let Paradise cooperate while stats and symbols were entered, companions were ensured, and macro bodies were typed.

<!-- Full route only. These are representative hook names, not a claim about one extra phase. -->

---

<!-- id: M16 | route: MAIN | full: 0:41 | normal: 0:39 | short: 0:35 -->

# Scala 2 `macroTransform`

```scala
@compileTimeOnly("enable macro paradise")
class addFoo extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any =
    macro AddFooMacro.impl
}

def impl(c: whitebox.Context)(annottees: c.Tree*): c.Tree = {
  import c.universe._
  annottees match
    case (cls @ q"$mods class $name[..$tps] $ctor(...$pss) extends ..$parents { ..$stats }") :: Nil =>
      q"""$cls; object ${name.toTermName} {
        def foo(x: Int): String = x.toString
      }"""
}
```

<!-- This is real historical quasiquote code; full version is in backup B05. -->

---

<!-- id: M17 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Scala 3 quotes and splices

```scala
inline def add(left: Int, right: Int): Int =
  ${ addImpl('left, 'right) }

def addImpl(left: Expr[Int], right: Expr[Int])
    (using Quotes): Expr[Int] =
  '{ $left + $right }
```

Scala 3 quotations are typed. That safety boundary differs from Scala 2’s arbitrary compiler-tree quasiquotes.

<!-- Keep the narrower claim: Scala 3 has quotations, but not the same arbitrary-tree q/tq layer. -->

---

<!-- id: M18 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Scala 3 quoted reflection

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  import quotes.reflect.*
  Select.overloaded(left, "+", Nil, List(right))
```

Quoted reflection exposes typed trees and symbols. Manual construction remains possible, but the programmer spells compiler structure explicitly.

<!-- The longer constructor example follows only in the full route. -->

---

<!-- id: O04 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Reflection-level `make[A]`

```scala
def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  args.asTerm.underlying.asExprOf[Seq[Any]] match
    case Varargs(params) =>
      Select.overloaded(
        New(TypeTree.of[A]),
        "<init>",
        Nil,
        params.map(_.asTerm).toList
      ).asExprOf[A]
```

<!-- Full route only. Compare this with q"new ...(..$args)". -->

---

<!-- id: M19 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Native Scala 3 `MacroAnnotation`

```scala
@experimental
class addFoo extends MacroAnnotation:
  def transform(using Quotes)(
      tree: quotes.reflect.Definition,
      companion: Option[quotes.reflect.Definition]
  ): List[quotes.reflect.Definition] =
    ...
```

- Real experimental Scala 3 API
- Works in the typed macro-expansion world
- Can transform and generate definitions
- Newly generated definitions have deliberately limited visibility to ordinary source outside the expansion

<!-- Do not caricature native MacroAnnotation as validation-only. -->

---

<!-- id: M20 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Native `@addFoo` creates a module

```scala
val tpe = MethodType(List("x"))(
  _ => List(TypeRepr.of[Int]),
  _ => TypeRepr.of[String]
)
val mod = Symbol.newModule(
  Symbol.spliceOwner, className,
  Flags.EmptyFlags, Flags.EmptyFlags,
  _ => List(TypeTree.of[Object].tpe),
  cls => List(Symbol.newMethod(cls, "foo", tpe,
    Flags.EmptyFlags, Symbol.noSymbol)),
  Symbol.noSymbol
)
val (modVal, modCls) = ClassDef.module(mod, modParents, List(fooDef))
List(tree, modVal, modCls)
```

This is genuine typed-reflection code generation. The differing contract is external visibility.

<!-- Short route: point to Symbol.newModule and the returned definitions. -->

---

<!-- id: M21 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Two Scala 3 design points

| Native `MacroAnnotation` | Macro-Paradise experiment |
|---|---|
| typed macro-expansion world | parsed untyped program |
| typed reflection and symbols | exact pre-typer `untpd` |
| generated implementation can serve the expansion | generated API becomes ordinary compiler input |

The designs optimize for different semantics and safety boundaries.

<!-- Avoid declaring either design universally better. -->

---

<!-- id: M22 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# `StandardPlugin` and `ResearchPlugin`

| Scala 3 plugin API | Capability |
|---|---|
| `StandardPlugin` | contributes `PluginPhase` instances with ordering constraints |
| `ResearchPlugin` | receives the whole phase pipeline and may add, remove, replace, or rearrange phases |

Scala 3 removed the Scala 2 analyzer-plugin category. Research plugins are a nightly/snapshot mechanism.

<div class="callout">Macro-Paradise is an experimental project implemented as a Scala 3 <code>StandardPlugin</code>.</div>

<!-- “Research project” and ResearchPlugin are different classifications. -->

---

<!-- id: M23 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Why `StandardPlugin` is sufficient

<pre class="diagram">parser
  ↓
bounded untpd rewrite
  ↓
ordinary typer once, on the final transformed program</pre>

The experiment does not replace parser semantics, typing rules, or the whole compiler pipeline. The unusual part is phase placement.

<!-- Stress that stock Dotty typer remains authoritative. -->

---

<!-- id: M24 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Why this protocol avoids analyzer integration

<div class="two-col small">
<div>

**Scala 2 Paradise**

Expansion cooperated while the analyzer entered symbols, ensured companions, and typed macro bodies.

</div>
<div>

**Current Scala 3 experiment**

Precompiled marker + metadata + bounded syntactic identity + precompiled handler produce final `untpd` before the ordinary typer starts.

</div>
</div>

This is a design trade, not a theorem that another Scala 2 design was impossible.

<!-- Explicitly preserve the protocol qualification. -->

---

<!-- id: O05 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Cost of staying outside the analyzer

- Annotation identity resolution is syntactic and import-aware only within a bounded slice
- Handlers receive raw `untpd`, not general typed symbols
- Broad/default architecture requires precompiled handlers
- General same-file source handlers are unsupported
- Type-driven transformations need another strategy or a later typed phase

<!-- Full route only. These are real contract limits, not incidental TODOs. -->

---

<!-- id: M25 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Macro-Paradise phase placement

<pre class="diagram">source
  ↓
parser
  ↓
Macro-Paradise: discover → expand → validate → compose
  ↓
typer
  ↓
later phases</pre>

`runsAfter = Set("parser")` · `runsBefore = Set("typer")`

<!-- This is current source truth for all three exact compiler-line plugin classes. -->

---

<!-- id: M26 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Walk map: Level 0–4

<pre class="diagram">Level 0     ordinary values / macro call site
Level 1     Expr
              ↘ (A) ExprImpl ──↘
Level 2                       tpd.Tree → untpd.Tree
              ↗ (B) q.reflect.Term ↗
Level 3                       typed Dotty
Level 4                                  raw pre-typer Dotty</pre>

These arrows describe our walk through representations, not compiler phase order.

<!-- Preserve the two-branch map; do not imply a subtype or compilation direction. -->

---

<!-- id: M27 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Level 0 to Level 1: call site to `Expr`

```scala
inline def add(left: Int, right: Int): Int =
  ${ addExpr('left, 'right) }

def addExpr(left: Expr[Int], right: Expr[Int])
    (using Quotes): Expr[Int] =
  '{ $left + $right }
```

Level 0 supplies ordinary arguments. Quotation lifts the call-site expressions into the typed staged `Expr` world.

<!-- Emphasize 'left and 'right, then $left and $right. -->

---

<!-- id: M28 | route: MAIN | full: 0:24 | normal: 0:22 | short: 0:18 -->

# Level 2A: `ExprImpl`

```scala
def addExpr(left: Expr[Int], right: Expr[Int])
    (using Quotes): Expr[Int] =
  given Context = quotes.asInstanceOf[impl.QuotesImpl].ctx
  addExprImpl(
    left.asInstanceOf[impl.ExprImpl],
    right.asInstanceOf[impl.ExprImpl]
  ).asInstanceOf[Expr[Int]]

def addExprImpl(left: impl.ExprImpl, right: impl.ExprImpl)
    (using Context): impl.ExprImpl =
  impl.ExprImpl(addTpdTree(left.tree, right.tree), left.scope)
```

`ExprImpl` exposes compiler internals and scope. It is not the public staging abstraction.

<!-- Short route: identify the cast boundary only. -->

---

<!-- id: M29 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Level 2B: `quotes.reflect.Term`

<div class="two-col compact">
<div>

Manual reflection:

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  import quotes.reflect.*
  Select.overloaded(
    left, "+", Nil, List(right)
  )
```

</div><div>

Typed quasiquote:

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  qr"$left + $right"
```

</div></div>

Same typed reflection layer, different authoring ergonomics.

<!-- `qr` here belongs to Quasiquotes Q, not pre-typer U-D. -->

---

<!-- id: M30 | route: MAIN | full: 0:24 | normal: 0:22 | short: 0:18 -->

# Level 3: `tpd.Tree`

```scala
def addTpdTree(left: tpd.Tree, right: tpd.Tree)
    (using Context): tpd.Tree =
  tpd.applyOverloaded(
    left,
    "+".toTermName,
    List(right),
    Nil,
    Types.WildcardType
  )
```

Typed Dotty trees carry compiler semantic information. They are below the public reflection façade.

<!-- Short route: name the representation and move on. -->

---

<!-- id: O06 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Typing an `untpd` tree manually

```scala
def addTpdTree(left: tpd.Tree, right: tpd.Tree)
    (using Context): tpd.Tree =
  val untyped = addUntpdTree(
    untpd.TypedSplice(left),
    untpd.TypedSplice(right)
  )
  new Typer().typedExpr(untyped)
```

This is a deliberate compiler-internal bridge: typed subtrees cross into an untyped construction and a typer is invoked explicitly.

<!-- Full route only. This is our representation walk, not the Macro-Paradise architecture. -->

---

<!-- id: M31 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Level 4: `untpd.Tree`

```scala
def addUntpdTree(left: untpd.Tree, right: untpd.Tree)
    (using SourceFile): untpd.Tree =
  untpd.Apply(
    untpd.Select(left, "+".toTermName),
    List(right)
  )
```

Macro-Paradise operates here, after parsing and before ordinary typing. The tree has syntax and positions, not final symbols and types.

<!-- This is why a typed qr result is not directly insertable. -->

---

<!-- id: M32 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Our walk and compiler direction

<div class="two-col">
<div>

**Representation walk**

```text
Expr
 ↓
ExprImpl / reflect.Term
 ↓
tpd.Tree
 ↓
untpd.Tree
```

</div><div>

**Compiler pipeline**

```text
source
 ↓ parser
untpd.Tree
 ↓ typer
tpd.Tree
```

</div></div>

The directions answer different questions.

<!-- Do not let the audience infer that tpd compiles into untpd. -->

---

<!-- id: M33 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Why typed `qr` and `dqr` do not drop into Macro-Paradise

<div class="two-col">
<div>

```text
qr / tqr / dqr
       ↓
Quotes + reflect
typed staged world
```

</div><div>

```text
parser
  ↓
untpd.Tree
  ↓
Macro-Paradise
  ↓
ordinary typer
```

</div></div>

A bridge must lower supported source or semantic shapes into exact pre-typer trees.

<!-- Keep typed quasiquotes and pre-typer lowering as separate responsibilities. -->

---

<!-- id: M34 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Three representation worlds

| World | What it preserves |
|---|---|
| Scalameta source AST | broad source-like syntax and construction |
| project-owned neutral model | bounded compiler-free semantic meaning |
| exact Dotty `untpd` | compiler-version-specific pre-typer topology |

Scalameta is not the neutral model. The neutral model is not raw Dotty.

<!-- These distinctions make the later bridge code honest. -->

---

<!-- id: M35 | route: MAIN | full: 0:18 | normal: 0:16 | short: 0:12 -->

# Q: Quotes-aware typed quasiquotes

```text
qr / qq     terms
tqr / tqq   types
dqr / dqq   definitions
```

Q lives in Scala 3’s staged `Quotes` and `quotes.reflect` world. It serves ordinary typed macros and typed matching/construction.

<!-- Short route: one sentence, but keep the slide. -->

---

<!-- id: M36 | route: MAIN | full: 0:18 | normal: 0:16 | short: 0:12 -->

# N: neutral semantic model

Compiler-free, bounded meanings for terms, types, and definitions. N can mediate between source frontends and exact backends where the supported shape benefits from normalization.

<div class="callout"><code>N</code> does not mean a public <code>n*</code> quasiquote syntax.</div>

<!-- Short route: identify the compiler-free role only. -->

---

<!-- id: M37 | route: MAIN | full: 0:18 | normal: 0:16 | short: 0:12 -->

# U-D: fresh exact untyped lowering

```text
validated source or semantic plan
              ↓
fresh positioned exact Dotty untpd definition
```

This is the direction used when a handler authors a new definition for Macro-Paradise.

<!-- U-D means a fresh definition lowering direction, not a public u* syntax. -->

---

<!-- id: M38 | route: MAIN | full: 0:18 | normal: 0:16 | short: 0:12 -->

# U-U: existing-tree transformation

```text
existing exact untpd
  ↓ capture and preserve raw handles
rewrite selected fragments
  ↓ validated reconstruction
exact untpd
```

U-U is a separate problem from fresh code generation.

<!-- Connect forward to @addOption. -->

---

<!-- id: M39 | route: MAIN | full: 0:16 | normal: 0:14 | short: 0:10 -->

# C: composition and API policy

C decides how the Q, N, U-D, and U-U layers compose into public APIs and downstream integrations.

<div class="callout"><code>C</code> is not another AST universe.</div>

Not every supported path literally traverses every representation.

<!-- Short route: one sentence. -->

---

<!-- id: M40 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Practical lowering path

<pre class="diagram">Scalameta definition or quasiquote
  ↓
bounded semantic or projection plan where applicable
  ↓
Quasiquotes exact generated-origin lowering
  ↓
positioned exact Dotty untpd
  ↓
Macro-Paradise placement
  ↓
ordinary typer</pre>

<!-- Some public bridges go directly from Scalameta to exact lowering; do not imply every intermediate is exposed. -->

---

<!-- id: M41 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Source syntax is only one part of a compiler tree

```text
AST shape
+ source provenance
+ spans and positions
+ ownership discipline
+ exact compiler representation
+ correct compiler phase
```

Generated-origin lowering attaches deterministic virtual-source provenance. Macro-Paradise validates outputs instead of fabricating provenance for arbitrary trees.

<!-- Explain why q"def foo" still needs an exact lowering bridge. -->

---

<!-- id: M42 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Macro-Paradise versions and compiler lines

| Track | State |
|---|---|
| `0.1.1` | released on Maven Central |
| `0.2.0-SNAPSHOT` | current source-development line, locally built |
| exact Scala lines | `3.3.8`, `3.8.4`, `3.9.0` |
| handler crossing | `CrossVersion.full` |

Current source-build requirements: JDK 25 and sbt 1.12.15.

<!-- Label released snippets separately from current-main API snippets. -->

---

<!-- id: M43 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Marker and handler architecture

<pre class="diagram">@myAnnotation in source
  ↓
precompiled marker class
  ↓ runtime @expander("...Handler") metadata
precompiled ExpansionHandler
  ↓
expand current ExpansionInput
  ↓
validated ExpansionOutcome</pre>

The marker identifies executable expansion code. It does not execute the transform itself.

<!-- Keep marker metadata and handler code as separate roles. -->

---

<!-- id: M44 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Current marker syntax

```scala
package com.example.`macro`.annotations

import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macro.handlers.AddFooHandler")
final class addFoo extends StaticAnnotation
```

`@expander` is runtime-retained metadata on the compiled marker. It names a precompiled handler class.

<!-- It is neither Scala 2 macroTransform nor Scala 3 MacroAnnotation.transform. -->

---

<!-- id: M45 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Current `ExpansionHandler` contract

```scala
trait ExpansionHandler:
  def annotationName: String
  def expand(input: ExpansionInput)
      (using Context): ExpansionOutcome

enum ExpansionTarget:
  case Class(tree: untpd.TypeDef)
  case Trait(tree: untpd.TypeDef)
  case Object(tree: untpd.ModuleDef)
```

The plugin mints `ExpansionInput`: current primary, actual companion, container names, and the current annotation tree.

<!-- This is current Macro-Paradise main at 12cb787. -->

---

<!-- id: M46 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# `@identity`: smallest current handler

```scala
final class IdentityHandler extends ExpansionHandler:
  override def annotationName: String =
    "com.example.macro.annotations.identity"

  override def expand(input: ExpansionInput)
      (using Context): ExpansionOutcome =
    ExpansionEdit.finish(
      ExpansionEdit.start(input)
    )
```

This proves discovery, binding, loading, invocation, and unchanged pass-through.

<!-- Begin with behavior-free wiring before generation. -->

---

<!-- id: M47 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Structured edits

```text
primary    preserve · merge · replace · delete
companion  preserve · merge · replace · create · delete
siblings   sparse create · merge · replace · delete
```

```scala
ExpansionEdit.finish:
  for
    edit0 <- ExpansionEdit.start(input)
    edit1 <- ExpansionHelpers.placeMemberInPrimary(edit0, member)
    edit2 <- ExpansionHelpers.placeMemberInCompanion(edit1, peer)
  yield edit2
```

The edit is immutable. The plugin applies and validates it privately.

<!-- Sparse changes preserve unmentioned domains. Finish exactly once. -->

---

<!-- id: M48 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# `@gen`: a current-protocol generated member

```scala
final class GenHandler extends ExpansionHandler:
  def annotationName = "com.example.macro.annotations.gen"

  def expand(input: ExpansionInput)(using Context) =
    val method = DefDef(
      termName("generatedHello"), Nil,
      Ident(typeName("String")),
      Literal(Constant(s"hello ${input.primary.name}"))
    )
    ExpansionEdit.finish:
      ExpansionEdit.start(input).flatMap: edit =>
        ExpansionHelpers.placeMemberInPrimary(edit, method)
```

Illustrative current API, source-signature verified against the independent contract probe.

<!-- The normal recommended source-like authoring path follows with @addFoo. -->

---

<!-- id: M49 | route: MAIN | full: 0:41 | normal: 0:39 | short: 0:35 -->

# `@addFoo`: source-like authoring and lowering

```scala
definition =
  q"def foo(x: Int): String = x.toString"
    .asInstanceOf[Defn.Def]

lowered <- ScalametaDefinitionGeneratedOriginBridge
  .lower(
    definition,
    "<macroparadise-generated:AddFooHandler:foo>"
  )
  .left.map(error => ExpansionDiagnostic(
    s"${error.code}: ${error.detail}",
    input.currentAnnotation.sourcePos
  ))
```

The `q` is a Scalameta quasiquote. The bridge returns positioned exact `untpd`.

<!-- Emphasize the virtual-source name and error translation. -->

---

<!-- id: M50 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# `@addFoo`: explicit companion creation

```scala
result <- ExpansionHelpers.placeMemberInCompanion(
  edit,
  lowered.tree,
  MissingCompanionPolicy.Create(
    ExpansionTargetKind.Object,
    DefinitionPlacement.AfterPrimary
  )
)
```

The default missing-companion policy rejects. `@addFoo` states that an object may be created after the class.

```scala
ExpansionEdit.finish(edited)
```

<!-- Creation policy is part of the handler contract, not hidden plugin magic. -->

---

<!-- id: M51 | route: MAIN | full: 0:41 | normal: 0:39 | short: 0:35 -->

# `@addFoo`: end-to-end

<pre class="diagram">@addFoo class A
  ↓ marker metadata + precompiled handler
Scalameta q"def foo..."
  ↓ generated-origin exact lowering
positioned untpd.DefDef
  ↓ companion Create + placement
validated staged program
  ↓ ordinary typer
A.foo(10) typechecks</pre>

The generated API becomes ordinary compiler input.

<!-- Return to the opening question and answer it for the bounded experiment. -->

---

<!-- id: M52 | route: MAIN | full: 0:24 | normal: 0:22 | short: 0:18 -->

# Current-tree scheduler

<pre class="diagram">select next handled annotation
  ↓
expand against current staged tree
  ↓
validate
  ↓
rescan staged program from the beginning</pre>

A later handler sees the latest revision. Generated handled annotations can become new work. Deleted annotations and definitions no longer own pending work.

<!-- Short route: state “rescan current tree after success.” -->

---

<!-- id: M53 | route: MAIN | full: 0:24 | normal: 0:22 | short: 0:18 -->

# Transaction, rollback, and budget

<pre class="diagram">stage 1 succeeds
stage 2 succeeds
stage 3 fails
        ↓
rollback the whole compilation unit</pre>

Failures include rejection, invalid topology, collision, handler exception, stale address, or budget exhaustion.

Default guard: **256 successful stages per compilation unit**. This is an operational limit, not a termination proof.

<!-- Short route: show rollback and 256 only. -->

---

<!-- id: O07 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Raw exact replacement

```scala
ExpansionOutcome.Expanded(trees)
```

- Replaces the handler-owned primary and verified companion region
- `Expanded(Nil)` deletes that region
- Returned order is exact
- No “first tree is the new primary” privilege
- Final topology and conflicts are recomputed and validated

<!-- Expert escape hatch. Structured edits remain the normal authoring path. -->

---

<!-- id: O08 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Relationships are revision-local

`primary`, `companion`, and sibling addresses refer to the current invocation revision.

<pre class="diagram">apply requested changes privately
  ↓
discard stale relationship labels
  ↓
recompute actual companions
  ↓
validate conflicts and topology
  ↓
rescan current staged program</pre>

<!-- Full route only. This prevents identity assumptions after replacement. -->

---

<!-- id: M54 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Why handlers are normally precompiled

<pre class="diagram">1  marker annotation project
2  handler implementation project
3  annotated consumer project</pre>

Macro-Paradise runs before the consumer is typed. Executable handler code therefore has to exist before the consumer reaches that phase.

Bounded same-module experiments alter the build staging, not this dependency fact.

<!-- Explain the three-project topology before showing sbt. -->

---

<!-- id: M55 | route: MAIN | full: 0:46 | normal: 0:44 | short: 0:40 -->

# sbt: same-build marker and handler projects

```scala
// project/plugins.sbt
addSbtPlugin("com.github.dmytromitin" %
  "sbt-macroparadise" % "0.1.1")

// build.sbt
import macroparadise.sbt.MacroParadiseIntegration
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport.*

ThisBuild / scalaVersion := "3.9.0"

lazy val macroAnnotations = project.in(file("macro-annotations"))
lazy val macroHandlers = project.in(file("macro-handlers"))

lazy val core = project.in(file("core"))
  .dependsOn(macroAnnotations % "provided->compile")
  .settings(MacroParadiseIntegration.precompiledProjects(
    macroAnnotations, macroHandlers
  ))
  .enablePlugins(MacroParadisePrecompiledPlugin)
  .settings(macroParadiseCompilerProductVersion := "0.2.0-SNAPSHOT")
```

<!-- The generic sbt plugin is released 0.1.1; current compiler/API product is locally built 0.2.0-SNAPSHOT. -->

---

<!-- id: M56 | route: MAIN | full: 0:46 | normal: 0:44 | short: 0:40 -->

# sbt: published marker and handler modules

```scala
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport.*

ThisBuild / scalaVersion := "3.9.0"

lazy val core = project.in(file("core"))
  .enablePlugins(MacroParadisePrecompiledPlugin)
  .settings(
    macroParadiseCompilerProductVersion := "0.2.0-SNAPSHOT",
    macroParadiseMarkerModules := Seq(
      (("com.example" % "my-macro-annotations" % "1.0.0")
        .cross(CrossVersion.full)) % Provided
    ),
    macroParadiseHandlerModules := Seq(
      ("com.example" % "my-macro-handlers" % "1.0.0")
        .cross(CrossVersion.full)
    )
  )
```

Markers are consumer compile dependencies. Handlers belong to a tool-only classpath.

<!-- Contrast coordinates with same-build project references. -->

---

<!-- id: O09 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# What the AutoPlugin derives

```text
-Xplugin-require:macroparadise
-P:macroparadise:handlerClasspath=<complete ordered closure>
-P:macroparadise:externalArtifactIdentity=sha256:<digest>
```

The identity covers explicit marker artifacts and the effective handler classpath so stable paths with changed bytes invalidate consumer compilation.

<!-- Full route only. Manual build translations are in B21/B22. -->

---

<!-- id: O10 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Exact compiler and classloader identity

Handlers exchange raw Dotty trees and `Context` with the plugin.

```text
paradise3.api contract classes
Scala runtime classes
Dotty compiler tree and Context classes
              ↓
one parent-first exact runtime universe
```

`CrossVersion.full` is about runtime type identity and compiler internals, not ordinary nearby-version binary compatibility.

<!-- Full route only. Deep dive in B12. -->

---

<!-- id: M57 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# AUXify as downstream evidence

<pre class="diagram">AUXify annotation
  ↓ Macro-Paradise scheduling and placement
source-shape decoding
  ↓
Scalameta authoring
  ↓ Quasiquotes exact lowering
positioned untpd
  ↓
ordinary typer</pre>

AUXify asks whether nontrivial user-facing annotation libraries can live on the pre-typer mechanism.

<!-- Current AUXify main uses a pinned accepted Macro-Paradise peer graph; examples show semantics, not migrated unified-handler source. -->

---

<!-- id: M58 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# AUXify `@apply`

```scala
@apply
trait Show[A]:
  def show(a: A): String

object Show:
  // generated
  def apply[A](using inst: Show[A]): Show[A] = inst

val showString: Show[String] = Show[String]
```

The fuller supported slice preserves a path-dependent result:

```scala
def apply[N <: Nat, M <: Nat](using inst: Add[N, M]):
  Add[N, M] { type Out = inst.Out } = inst
```

<!-- Short route: show only the first example. -->

---

<!-- id: M59 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# AUXify `@aux`

```scala
@aux
trait Add[N <: Nat, M <: Nat]:
  type Out <: Nat
  def apply(n: N, m: M): Out

object Add:
  // generated
  type Aux[N <: Nat, M <: Nat, Out0 <: Nat] =
    Add[N, M] { type Out = Out0 }
```

The source decoder preserves source names. Exact lowering produces the companion type alias; placement preserves an existing direct `Aux` conflict.

<!-- The leading '=' is illustrative formatting; the exact generated declaration begins with `type Aux`. -->

---

<!-- id: M60 | route: MAIN | full: 0:26 | normal: 0:24 | short: 0:20 -->

# AUXify `@instance`

```scala
@instance
trait Monoid[A]:
  def empty: A
  def combine(a: A, b: A): A
```

```scala
def instance[A](
    emptyValue: => A,
    combineFunction: (A, A) => A
): Monoid[A] =
  new Monoid[A]:
    def empty = emptyValue
    def combine(a: A, b: A) = combineFunction(a, b)
```

Current main also admits one bounded final inherited concrete unary method, parameterless method, or exact alias.

<!-- Short route: focus on the two generated overrides. -->

---

<!-- id: M61 | route: MAIN | full: 0:24 | normal: 0:22 | short: 0:18 -->

# AUXify `@delegated`

```scala
@delegated
trait Show[A]:
  def show(a: A): String

object Show:
  // generated
  def show[A](a: A)(using inst: Show[A]): String =
    inst.show(a)
```

The first slice supports one eligible direct abstract method. Wider forwarding and overload semantics remain outside the boundary.

<!-- Short route: read the generated forwarder only. -->

---

<!-- id: O11 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# AUXify `@syntax`: selected design

```scala
@syntax
trait Monoid[A]:
  def combine(a: A, b: A): A

object Monoid:
  object syntax:
    extension [A](a: A)
      def combine(b: A)(using inst: Monoid[A]): A =
        inst.combine(a, b)
```

**Characterized and designed, not yet implemented.** The design preserves `import Monoid.syntax.*`.

<!-- Full route only. Keep status visible and exact. -->

---

<!-- id: O12 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# AUXify `@self`: bounded implementation

```scala
@self
trait Nat:
  type Existing = String

// conceptually adds
trait Nat { self =>
  type Self >: self.type <: Nat { type Self = self.Self }
  type Existing = String
}
```

Current support is a plain zero-parameter trait with default semantics. Class, object, generic targets and historical options remain unsupported. `@poly` is postponed.

<!-- Full route only. The broader parity target is in B28. -->

---

<!-- id: M62 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Composition is the stronger test

<div class="two-col">
<div>

```scala
@apply
@instance
trait X[A]:
  def empty: A
  def combine(a: A, b: A): A
```

</div><div>

```scala
@instance
@apply
trait Y[A]:
  def empty: A
  def combine(a: A, b: A): A
```

</div></div>

Both bounded source orders are qualified. The second handler must see the current staged result of the first.

Also qualified in both orders: bounded `@apply + @aux` and `@apply + @delegated` slices.

<!-- Composition demonstrates rescanning and transactional current-tree semantics. -->

---

<!-- id: M63 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Rewriting, not only generation

```scala
@addOption
def foo(x: Int): String = rhs

// desired transformation
def foo(x: Int): Option[String] = Option(rhs)
```

<pre class="diagram">existing exact untpd
  ↓ capture and preserve raw handles
rewrite result type and RHS fragments
  ↓ validated reconstruction
exact untpd</pre>

Arbitrary existing Dotty owners should not be round-tripped through Scalameta.

<!-- This motivates U-U as a separate architecture. -->

---

<!-- id: M64 | route: MAIN | full: 0:41 | normal: 0:39 | short: 0:35 -->

# Current scope and limits

**Supported target kinds:** package-level `Class`, `Trait`, `Object`

**Exact compiler lines:** Scala `3.3.8`, `3.8.4`, `3.9.0`

**Broad/default architecture:** precompiled handlers; bounded same-module work is separate

**Not general targets:** nested/local definitions, enum/case, method, val/var, type alias, parameter, given, extension forms

**Other boundaries:** compiler-internal API, experimental surface, IDE/incremental complexity, no general same-file handler discovery

<!-- Caveats stay visible in every route. -->

---

<!-- id: M65 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Costs of a pre-typer design

- Exact compiler-version coupling and parent-first classloader policy
- Responsibility for valid raw trees, ownership, positions, and provenance
- More complex handler loading and build topology
- Harder IDE, BSP, incremental, and same-module behavior
- Less help from public typed reflection
- More machinery for diagnostics, scheduling, conflict checks, rollback, and validation

The experiment asks whether source-visible generated API justifies these costs.

<!-- Do not soften the engineering tradeoffs. -->

---

<!-- id: M66 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Possible future direct syntax

```scala
class myAnnotation
    extends SomeFutureSuperParadiseAnnotationExpander:

  override def expand(input: ExpansionInput)
      (using Contexts.Context): ExpansionOutcome =
    ...
```

<div class="callout">This syntax by itself does not require deeper namer or typer integration.</div>

If the annotation/expander is already compiled, the current pre-typer `StandardPlugin` model can load it.

<!-- Surface syntax and integration depth are separate decisions. -->

---

<!-- id: O13 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Future syntax and staging topology

```text
precompiled annotation/expander
  current pre-typer model is sufficient

same module, different file
  suspension and precompilation may remain sufficient

same file
  bootstrap cycle: expansion needs code from its own untyped unit

full semantic superclass resolution before expansion
  deeper namer/typer integration becomes more relevant
```

<!-- Full route only. These are design consequences, not implemented promises. -->

---

<!-- id: O14 | route: OPTIONAL-IN-FLOW | full: 0:12 | normal: skip | short: skip -->

# Bounded same-module experiment

<pre class="diagram">identify selected handler source
  ↓
suspend dependent consumers
  ↓
compile the handler
  ↓
load fresh handler output
  ↓
resume consumers at pre-typer expansion</pre>

This is a staging strategy for different-file handlers, not general same-file automatic discovery. IDE/BSP/JPS behavior needs separate qualification.

<!-- Full route only. Keep Model A bounded. -->

---

<!-- id: M67 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# What works today

```scala
@addFoo
class A

A.foo(10)
```

1. Marker metadata identifies a precompiled exact-line handler.
2. The `StandardPlugin` runs after parser and before typer.
3. Scalameta authors `foo`; Quasiquotes lowers it to positioned exact `untpd`.
4. `ExpansionEdit` creates the missing companion and places the member.
5. Validation and rescanning complete before ordinary Dotty typing.

<!-- Concise end-to-end recap. -->

---

<!-- id: M68 | route: MAIN | full: 0:36 | normal: 0:34 | short: 0:30 -->

# Two macro-annotation contracts

Scala 3 has a real native macro-annotation API in the typed expansion world.

Macro-Paradise explores a pre-typer transformation when generated API must become ordinary compiler input.

<pre class="diagram">Macro-Paradise   phase placement + transaction
Quasiquotes       source-like authoring + exact lowering
AUXify            downstream semantics + composition evidence</pre>

Neither contract replaces the other.

<!-- Land on the semantic distinction, not nostalgia. -->

---

<!-- id: M69 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Scala Semantic Harness: feedback wanted

Scala-specific semantic evidence for coding agents, with explicit provenance, freshness, limits, and uncertainty.

github.com/DmytroMitin/scala-semantic-harness

**Early-feedback guide**  
github.com/DmytroMitin/scala-semantic-harness/blob/main/docs/early-feedback.md

`skills/semantic-scala/SKILL.md`

Please bring one concrete Scala project decision and compare it with the compiler, tests, and the tooling you already trust.

<!-- Mandatory closing reminder. Ask for evidence, including “ordinary tooling was sufficient.” -->

---

<!-- id: M70 | route: MAIN | full: 0:31 | normal: 0:29 | short: 0:25 -->

# Links and questions

- Talk: github.com/DmytroMitin/macroparadise-talk-09-2026
- Macro-Paradise: github.com/DmytroMitin/macroparadise-scala3
- Quasiquotes: github.com/DmytroMitin/quasiquotes-scala3
- AUXify: github.com/DmytroMitin/AUXify-scala3
- Semantic Harness: github.com/DmytroMitin/scala-semantic-harness

**Dmytro Mitin** · github.com/DmytroMitin · linkedin.com/in/dmitin

<!-- Take questions. Backup starts after the next divider. -->

---

<!-- id: B00 | route: BACKUP | live: after-Q&A -->

<div class="kicker">Q&A · Reference material follows</div>

# Backup: implementation evidence

The published deck keeps the deeper code, build wiring, historical APIs, and bounded status detail.

<div class="route-key">Not part of the full, normal, or short timed route</div>

---

<!-- id: B01 | route: BACKUP -->

# Biography, teaching, and OSS

- Former university mathematics teacher; analysis, function theory, approximation, fractal approximation
- Mathematics competitions: training, team leadership, problem coordination, organization, jury chair
- Dependent-types courses (2017–2019); Shapeless and macros training (2020)
- Engineering across telecom, fintech, cybersecurity, compilers, messaging, portals, and web
- Stack Overflow: top-ranked across Scala 3, Scalameta, scala-reflect, Cats, macros, and Shapeless tags
- Apache Spark PR #38740; merged Scala 3 compiler PR #26002

github.com/DmytroMitin · stackoverflow.com/users/5249621/dmytro-mitin

---

<!-- id: B02 | route: BACKUP -->

# Semantic Harness install and boundaries

```bash
cs install --default-channels=false \
  --channel https://raw.githubusercontent.com/DmytroMitin/scala-semantic-harness/main/distribution/coursier/channel.json \
  semantic-scala semantic-scala-mcp
semantic-scala version
```

- Current supported public channel selects exact `0.1.0-alpha.3` on JDK 21
- CLI and generic stdio MCP server are separate applications
- `skills/semantic-scala/SKILL.md` is the canonical client-neutral skill
- The harness complements compiler, tests, Metals, IDEs, and LSPs; it does not replace them
- Feedback guide: `docs/early-feedback.md`

---

<!-- id: B03 | route: BACKUP -->

# Parser implementation details

```text
ordinary frontend
  Scala3ParserBridge → Dotty parser
  TinyTermParser / TinyTypeParser are façades

hybrid frontend
  try Scalameta first
  if Scalameta parsing fails, use current Dotty frontend
```

Parsing gives trees from text. It does not make interpolated tree holes structural. Quasiquotes still need explicit source mapping, capture, splice ranking, and collision-safe binding.

---

<!-- id: B04 | route: BACKUP -->

# Scala 2 Paradise analyzer integration

```scala
class ParadisePlugin(...) extends Plugin
    with AnalyzerPlugins {
  val name = "macroparadise"
  val components = Nil

  analyzer.addAnalyzerPlugin(AnalyzerPlugin)
  analyzer.addMacroPlugin(MacroPlugin)
}
```

Representative callbacks:

```text
pluginsEnterStats · pluginsEnterSym · pluginsEnsureCompanionObject
pluginsTypedMacroBody · pluginsTypeSig
```

The literal phase list is user-facing context; the implementation participated through analyzer/macro hooks.

---

<!-- id: B05 | route: BACKUP -->

# Full Scala 2 `macroTransform` shape

```scala
@compileTimeOnly("enable macro paradise to expand macro annotations")
class addFoo extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any =
    macro AddFooMacro.macroTransformImpl
}

object AddFooMacro {
  def macroTransformImpl(c: whitebox.Context)(annottees: c.Tree*): c.Tree = {
    import c.universe._
    annottees match {
      case (cls @ q"$mods class $name[..$tps] $ctor(...$pss) extends { ..$early } with ..$parents { $self => ..$stats }") :: Nil =>
        q"""$cls
          object ${name.toTermName} {
            def foo(x: Int): String = x.toString
          }"""
    }
  }
}
```

---

<!-- id: B06 | route: BACKUP -->

# Full reflection constructor path

```scala
def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  val fields = TypeRepr.of[A].typeSymbol.caseFields
  val fieldTypes = fields.map(_.tree.asInstanceOf[ValDef].tpt)
  Apply(
    Select.unique(New(TypeTree.of[A]), "<init>"),
    fieldTypes.zipWithIndex.map((fieldType, i) =>
      TypeApply(
        Select.unique(
          Apply(Select.unique(args.asTerm, "apply"),
            List(Literal(IntConstant(i)))),
          "asInstanceOf"
        ),
        List(fieldType)
      )
    )
  ).asExprOf[A]
```

---

<!-- id: B07 | route: BACKUP -->

# Native Scala 3 `MacroAnnotation` result

```scala
val mod = Symbol.newModule(
  Symbol.spliceOwner,
  className,
  Flags.EmptyFlags,
  Flags.EmptyFlags,
  _ => modParents.map(_.tpe),
  cls => List(Symbol.newMethod(
    cls, "foo", tpe, Flags.EmptyFlags, Symbol.noSymbol
  )),
  Symbol.noSymbol
)
val moduleClass = mod.moduleClass
val fooSymbol = moduleClass.declaredMethod("foo").head
val fooDef = DefDef(fooSymbol, argss =>
  Some(Select.unique(argss.head.head.asInstanceOf[Term], "toString")))
val (moduleVal, moduleDef) = ClassDef.module(mod, modParents, List(fooDef))
List(tree, moduleVal, moduleDef)
```

The API can create definitions. Its external source-visibility contract remains the important difference.

---

<!-- id: B08 | route: BACKUP -->

# Level 0–4 code map

```text
0  inline call site                addExpr('left, 'right)
1  Expr[Int]                       '{ $left + $right }
2A scala.quoted.runtime.ExprImpl   ExprImpl(tree, scope)
2B quotes.reflect.Term             Select.overloaded / qr"..."
3  dotty.tools.dotc.ast.tpd.Tree   tpd.applyOverloaded(...)
4  dotty.tools.dotc.ast.untpd.Tree untpd.Apply(untpd.Select(...), ...)
```

Public typed staging ends before the exact compiler-internal raw tree world used by a pre-typer plugin.

---

<!-- id: B09 | route: BACKUP -->

# Q / N / U-D / U-U / C glossary

| Label | Exact role |
|---|---|
| Q | Quotes-aware typed construction and matching: `qr/qq`, `tqr/tqq`, `dqr/dqq` |
| N | compiler-free bounded term/type/definition semantics and Scalameta interop |
| U-D | fresh exact `untpd` lowering from a validated plan |
| U-U | existing exact `untpd` capture, preservation, rewrite, reconstruction |
| C | cross-layer composition, integration, and public API policy |

`N ≠ public n* syntax` · `U ≠ public u* syntax` · `C ≠ another tree universe`

---

<!-- id: B10 | route: BACKUP -->

# Scalameta to exact lowering

```text
Scalameta Defn.Def
  source-like syntax and names
        ↓ validate supported family
project-owned plan where applicable
  compiler-free semantic constraints
        ↓ exact-version backend
ConstructedDefinitionGeneratedOriginAdapter
        ↓
positioned untpd.DefDef with virtual SourceFile
```

`ScalametaDefinitionGeneratedOriginBridge.lower(definition, virtualSourceName)` is a focused public entry point. It does not claim arbitrary Scalameta-to-Dotty coverage.

---

<!-- id: B11 | route: BACKUP -->

# `@expander` metadata source

```java
package paradise3.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface expander {
  String value();
}
```

The compiled marker stores the fully qualified handler name. The metadata does not execute the handler by itself.

---

<!-- id: B12 | route: BACKUP -->

# Classloader identity deep dive

```text
plugin loader parent
  paradise3.api.*
  scala.*
  dotty.tools.dotc.*
        ↑ parent first
handler child loader
  handler classes
  handler-only dependencies
```

Two loaders can load byte-identical class names as different runtime types. A handler receiving `untpd.Tree` and `Context` must share the plugin’s exact compiler/API identities. Complete ordered handler closure and artifact identity are part of the correctness boundary.

---

<!-- id: B13 | route: BACKUP -->

# Expansion input and structured changes

```scala
final class ExpansionInput private[api] (
  val primary: ExpansionTarget,
  val companion: Option[ExpansionTarget],
  val container: ExpansionContainerContext,
  val currentAnnotation: untpd.Tree
)

final case class ExpansionChanges(
  primary: PrimaryChange = PrimaryChange.Preserve,
  companion: CompanionChange = CompanionChange.Preserve,
  siblings: List[SiblingChange] = Nil
)
```

The plugin constructs the context. External handlers can read it but cannot mint or copy a new invocation revision.

---

<!-- id: B14 | route: BACKUP -->

# Raw `Expanded(trees)` semantics

```scala
enum ExpansionOutcome:
  case Structured(changes: ExpansionChanges)
  case Expanded(trees: List[untpd.Tree])
  case Rejected(diagnostics: List[ExpansionDiagnostic])
```

- Exact replacement of the handler-owned primary/verified-companion region
- `Expanded(Nil)` deletes that owned region
- Output order is exact; no privileged first tree
- Only supported Class/Trait/Object roots with provenance survive validation
- Final companions, names, collisions, and ownership topology are recomputed

---

<!-- id: B15 | route: BACKUP -->

# Scheduler, rollback, and expansion budget

```text
select next handled annotation from current staged tree
  ↓ run handler
apply privately → validate topology and provenance
  ↓ success
rescan staged tree from the beginning
  ↓ late failure
discard every provisional stage in the compilation unit
```

Fresh generated annotations are new work. The private identity ledger prevents the same preserved tree from running twice. Default budget: 256 successful stages per unit; exhaustion is a diagnostic, not a proof about semantic termination.

---

<!-- id: B16 | route: BACKUP -->

# Full current `@identity`

```scala
@expander("com.example.macro.handlers.IdentityHandler")
class identity extends StaticAnnotation

final class IdentityHandler extends ExpansionHandler:
  override def annotationName: String =
    "com.example.macro.annotations.identity"

  override def expand(input: ExpansionInput)
      (using Context): ExpansionOutcome =
    ExpansionEdit.finish(ExpansionEdit.start(input))
```

An equivalent raw pass-through is `ExpansionOutcome.Expanded(List(input.primary.tree))`; the structured form demonstrates the normal edit pipeline.

---

<!-- id: B17 | route: BACKUP -->

# Full current-form `@gen`

```scala
final class GenHandler extends ExpansionHandler:
  def annotationName = "com.example.macro.annotations.gen"

  def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    val method = DefDef(
      termName("generatedHello"),
      Nil,
      Ident(typeName("String")),
      Literal(Constant(s"hello ${input.primary.name}"))
    )
    ExpansionEdit.finish(
      ExpansionEdit.start(input).flatMap(edit =>
        ExpansionHelpers.placeMemberInPrimary(edit, method)
      )
    )
```

This exact current-protocol shape is exercised by the independent handler contract probe.

---

<!-- id: B18 | route: BACKUP -->

# Full current `@addFoo` handler

```scala
final class AddFooHandler extends ExpansionHandler:
  def annotationName = "com.example.macro.annotations.addFoo"
  def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionEdit.finish:
      for
        edit <- ExpansionEdit.start(input)
        _ <- input.primary match
          case ExpansionTarget.Class(_) => Right(())
          case _ => Left(ExpansionDiagnostic(
            "@addFoo requires a class primary", input.currentAnnotation.sourcePos))
        definition = q"def foo(x: Int): String = x.toString".asInstanceOf[Defn.Def]
        lowered <- ScalametaDefinitionGeneratedOriginBridge
          .lower(definition, "<macroparadise-generated:AddFooHandler:foo>")
          .left.map(e => ExpansionDiagnostic(s"${e.code}: ${e.detail}", input.currentAnnotation.sourcePos))
        result <- ExpansionHelpers.placeMemberInCompanion(
          edit, lowered.tree,
          MissingCompanionPolicy.Create(ExpansionTargetKind.Object, DefinitionPlacement.AfterPrimary))
      yield result
```

---

<!-- id: B19 | route: BACKUP -->

# Full same-build `sbt-macroparadise` setup

```scala
val mpApi =
  ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.2.0-SNAPSHOT")
    .cross(CrossVersion.full)

lazy val macroAnnotations = project.in(file("macro-annotations"))
  .settings(libraryDependencies += mpApi)

lazy val macroHandlers = project.in(file("macro-handlers"))
  .settings(libraryDependencies ++= Seq(
    mpApi,
    "org.scala-lang" %% "scala3-compiler" % scalaVersion.value,
    ("com.github.dmytromitin" % "quasiquotes-scala3-dotty-internal" % "0.3.0")
      .cross(CrossVersion.full),
    "org.scalameta" %% "scalameta" % "4.17.3"
  ))

lazy val core = project.in(file("core"))
  .dependsOn(macroAnnotations % "provided->compile")
  .settings(MacroParadiseIntegration.precompiledProjects(macroAnnotations, macroHandlers))
  .enablePlugins(MacroParadisePrecompiledPlugin)
  .settings(macroParadiseCompilerProductVersion := "0.2.0-SNAPSHOT")
```

---

<!-- id: B20 | route: BACKUP -->

# Full published-module AutoPlugin setup

```scala
val markerModules = Seq(
  (("com.example" % "my-macro-annotations" % "1.0.0")
    .cross(CrossVersion.full)) % Provided
)
val handlerModules = Seq(
  ("com.example" % "my-macro-handlers" % "1.0.0")
    .cross(CrossVersion.full)
)

lazy val core = project.in(file("core"))
  .enablePlugins(MacroParadisePrecompiledPlugin)
  .settings(
    macroParadiseCompilerProductVersion := "0.2.0-SNAPSHOT",
    macroParadiseMarkerModules := markerModules,
    macroParadiseHandlerModules := handlerModules
  )
```

The producer may be remote or deliberately installed locally. The coordinate crossing still tracks exact compiler identity.

---

<!-- id: B21 | route: BACKUP -->

# Manual same-build wiring

```scala
lazy val core = project.in(file("core"))
  .dependsOn(macroAnnotations % "provided->compile")
  .settings(
    libraryDependencies += compilerPlugin(mpPlugin),
    Compile / scalacOptions ++= {
      val markerJar = (macroAnnotations / Compile / packageBin).value
      val handlerJar = (macroHandlers / Compile / packageBin).value
      val handlerClasses = (macroHandlers / Compile / classDirectory).value.getCanonicalFile
      val handlerClasspath = handlerJar +:
        (macroHandlers / Runtime / dependencyClasspath).value.files
          .filterNot(_.getCanonicalFile == handlerClasses)
      val identity = ExternalArtifactIdentity.combined(
        Seq("marker" -> markerJar),
        handlerClasspath.zipWithIndex.map((f, i) => f"handler-$i%04d" -> f))
      Seq("-Xplugin-require:macroparadise",
        s"-P:macroparadise:handlerClasspath=${handlerClasspath.mkString(File.pathSeparator)}",
        s"-P:macroparadise:externalArtifactIdentity=sha256:$identity")
    })
```

---

<!-- id: B22 | route: BACKUP -->

# Manual published-module wiring

```scala
val MacroParadiseHandler = config("macroParadiseHandler").hide

lazy val core = project.in(file("core"))
  .configs(MacroParadiseHandler)
  .settings(inConfig(MacroParadiseHandler)(Defaults.configSettings))
  .settings(
    libraryDependencies += compilerPlugin(mpPlugin),
    libraryDependencies ++= markerModules,
    libraryDependencies ++= handlerModules.map(_ % MacroParadiseHandler.name),
    markerArtifacts := resolveConfigured(
      markerModules, (Compile / dependencyClasspath).value, "marker"),
    handlerClasspath := completeHandlers(
      handlerModules, (MacroParadiseHandler / dependencyClasspath).value),
    externalArtifactIdentity := ExternalArtifactIdentity.combined(
      markerArtifacts.value, handlerClasspath.value),
    Compile / scalacOptions ++= Seq(
      "-Xplugin-require:macroparadise",
      "-P:macroparadise:handlerClasspath=" + handlerClasspath.value.map(_._2).mkString(File.pathSeparator),
      "-P:macroparadise:externalArtifactIdentity=sha256:" + externalArtifactIdentity.value))
```

Direct handlers come first; their canonical de-duplicated transitive closure remains on the tool classpath.

---

<!-- id: B23 | route: BACKUP -->

# Versions, coordinates, and toolchains

| Project | Public release | Current source line |
|---|---|---|
| Macro-Paradise | `0.1.1` | `0.2.0-SNAPSHOT` |
| Quasiquotes | `0.3.0` | repository architecture continues beyond release scope |
| AUXify | `0.1.0` | `0.2.0-SNAPSHOT` |
| Allow Experimental | `0.1.0` | current source development |
| Semantic Harness | `0.1.0-alpha.3` supported channel | `0.1.0-alpha.4-SNAPSHOT` source only |

Compiler-sensitive Macro-Paradise/AUXify lines: exact Scala `3.3.8`, `3.8.4`, `3.9.0`; JDK 25; sbt 1.12.15. Semantic Harness packaged route uses JDK 21.

---

<!-- id: B24 | route: BACKUP -->

# AUXify `@apply` authoring path

```scala
def definition(className: String, typeParameterName: String): Defn.Def =
  val cls = Type.Name(className)
  val a = Type.Name(typeParameterName)
  val parameter = tparam"$a"
  val target = t"$cls[$a]"
  q"def apply[$parameter](using inst: $target): $target = inst"

def lower(...)(using Context) =
  ContextualMethodPeerBridge.lower(
    definition(className, typeParameterName),
    "<auxify-generated:apply>"
  )
```

The source decoder admits a bounded trait shape before the builder and exact lowering bridge run.

---

<!-- id: B25 | route: BACKUP -->

# AUXify `@aux` authoring path

```scala
val first = tparam"$firstName <: $upper"
val second = tparam"$secondName <: $upper"
val out = tparam"$outName <: $upper"
val target = t"$typeClass[..${List(firstName, secondName)}]"
val equality = q"type $resultName = $outName"
val refined = t"$target { ..${List(equality)} }"

q"type Aux[..${List(first, second, out)}] = $refined"
```

`AuxTypeAliasPeerBridge.lower(...)` rechecks the expected names, bounds, target, and refinement member before exact lowering.

---

<!-- id: B26 | route: BACKUP -->

# AUXify `@instance` and `@delegated`

`@instance` first slice requires one invariant unbounded type parameter and two ordered public abstract methods: parameterless `A`, then binary `(A, A): A`.

It may also inherit exactly one final compatible concrete unary method, parameterless method, or alias `type Item = A`. AUXify does not inspect, copy, re-author, or lower that concrete implementation.

`@delegated` first slice requires one public abstract direct method with one ordinary parameter of the enclosing type and a simple named result. It appends a contextual instance clause and forwards to the same method.

Both preserve direct same-name companion members under their bounded conflict policy.

---

<!-- id: B27 | route: BACKUP -->

# `@syntax` design

```scala
object Monoid:
  object syntax:
    extension [A](a: A)
      def combine(a1: A)(using inst: Monoid[A]): A =
        inst.combine(a, a1)

import Monoid.syntax.*
```

The selected Scala 3 design uses native extension methods while preserving the familiar import and receiver-call style.

Status: characterized and design-selected, not implemented.

---

<!-- id: B28 | route: BACKUP -->

# `@self`: parity target and current slice

Broader historical target:

```scala
sealed trait Nat: self =>
  type Self >: self.type <: Nat { type Self = self.Self }
  type ++ = Succ[Self]
case object _0 extends Nat:
  override type Self = _0
case class Succ[N <: Nat](n: N) extends Nat:
  override type Self = Succ[N]
```

Current Scala 3 implementation covers only a plain zero-parameter trait with default semantics. Generic, class, object, `lowerBound`, and `fBound` parity remain outside scope.

---

<!-- id: B29 | route: BACKUP -->

# AUXify composition matrix

| Pair | Qualified source orders | Common bounded envelope |
|---|---|---|
| `@apply + @instance` | both | one invariant parameter; exact instance body family |
| `@apply + @aux` | both | common two-upper-bounded `Add` family |
| `@apply + @delegated` | both | one invariant parameter; one eligible method |

Independent direct companion conflicts suppress only their own generated member. Late rejection rolls back the whole compilation unit. This matrix does not establish arbitrary annotation-stack composition.

---

<!-- id: B30 | route: BACKUP -->

# U-U rewriting architecture

```text
existing untpd owner
  ↓ exact bounded capture
raw handles for unchanged pieces
  + authored/lowered changed fragments
  ↓ validated reconstruction plan
fresh exact graph with preserved authority
  ↓
untpd owner
```

Fresh source-like lowering and existing-owner transformation carry different preservation obligations. A Scalameta round trip would erase compiler topology that U-U must retain.

---

<!-- id: B31 | route: BACKUP -->

# Same-module Model A boundaries

```text
selected handler source in a different file
  ↓ suspend annotated consumers
compile marker/handler subset
  ↓ exact fresh outputs and identity
load handler
  ↓ resume consumers
pre-typer expansion
```

General same-file discovery remains a bootstrap problem. IDE import, BSP, JPS, incremental invalidation, and editor feedback are separate qualification surfaces; a command-line source proof does not establish them.

---

<!-- id: B32 | route: BACKUP -->

# Future direct syntax: bootstrap analysis

```text
already compiled expander
  load before consumer → no deeper typer integration required

same module, different file
  staged sub-compilation can preserve pre-typer model

same compilation unit
  expander must compile before transforming its own unit → cycle

arbitrary aliases and semantic superclass relationships
  bounded syntax cannot decide identity → semantic integration grows relevant
```

Current `@expander` indirection keeps the broad/default dependency graph acyclic.

---

<!-- id: B33 | route: BACKUP -->

# Historical API evolution

```scala
// Historical prototype
trait ParadiseAnnotationExpander
final case class StructuredExpansionOutput(
  primary: untpd.TypeDef,
  companion: Option[untpd.Tree],
  additionalTopLevelDefinitions: List[untpd.Tree]
)

// Current main
trait ExpansionHandler
final case class ExpansionChanges(
  primary: PrimaryChange,
  companion: CompanionChange,
  siblings: List[SiblingChange]
)
```

Historical examples remain evidence of design evolution. Current MAIN slides use `ExpansionHandler`, `ExpansionEdit`, and current target names.

---

<!-- id: B34 | route: BACKUP -->

# `allow-experimental`

github.com/DmytroMitin/allow-experimental

```scala
@allowExperimental
def useCompilerMarkedApi(): Result =
  experimentalOperation()
```

Current purpose: permit a supported non-inline method implementation to call selected APIs marked `scala.annotation.experimental` without making that method experimental for callers.

`@allowExperimental` is an annotation processed by another compiler plugin. It is not a macro annotation and does not generate source-visible API.

---

<!-- id: B35 | route: BACKUP -->

# Full “do not claim” checklist

- Macro-Paradise is not a Scala 3 `ResearchPlugin`
- No general nested, local, method, val/var, type, given, parameter, enum, or extension target support
- No compiler-version-independent handler binaries
- No general same-file source-handler discovery
- No arbitrary Scalameta-to-arbitrary-`untpd` lowering
- Typed `dqr` output is not directly insertable in the pre-typer phase
- AUXify `@syntax` is not implemented
- Full historical `@self` parity is not implemented
- The 256-stage budget is an operational guard, not a semantic termination theorem

---

<!-- id: B36 | route: BACKUP -->

# Future directions

**Macro-Paradise:** broader targets, IDE and same-module qualification, more ergonomic handlers, richer transactional transforms

**Quasiquotes:** wider neutral term/type/definition semantics, exact lowering coverage, existing-tree capture and rewrite, possible future neutral or untyped syntax only after the architecture proves sound

**AUXify:** widen bounded annotation families, implement the selected `@syntax` design, pursue Scala 2 parity only where Scala 3 has a suitable semantic counterpart

These are directions, not release commitments.

---

<!-- id: B37 | route: BACKUP -->

# Repositories and contact

- github.com/DmytroMitin/macroparadise-talk-09-2026
- github.com/DmytroMitin/macroparadise-scala3
- github.com/DmytroMitin/quasiquotes-scala3
- github.com/DmytroMitin/AUXify-scala3
- github.com/DmytroMitin/allow-experimental
- github.com/DmytroMitin/scala-semantic-harness

LinkedIn: linkedin.com/in/dmitin  
GitHub: github.com/DmytroMitin  
YouTube: youtube.com/@DmytroMitin  
Email: dmitin3@gmail.com
