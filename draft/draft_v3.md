# Draft v3

This is a third additive revision of the talk draft.

Goals of this version:

- keep `draft.md` and `draft_v2.md` as historical checkpoints;
- preserve the information and examples already collected rather than shortening the talk yet;
- improve the narrative order;
- correct technical inaccuracies found during the v2 audit;
- distinguish released examples from current-`main` / `0.2.0-SNAPSHOT` examples where that matters;
- retain historical/prototype APIs when they are useful, but label them as such;
- explain the Quasiquotes Q/N/U-D/U-U/C vocabulary in one place rather than assuming it.

The final slide deck can be much shorter. This file is still a content pool / speaker draft, not a final slide-count commitment.

# First slide

London Scala User Group

![emblem](london_scala_emblem_400x400.jpg)

Dmytro Mitin

**Can Scala 3 Have Macro Annotations Again?**  
**Rebuilding Macro Paradise**

9 September 2026

# This presentation

Repository:

https://github.com/DmytroMitin/macroparadise-talk-09-2026

QR code?

Slideshare / another public mirror after the talk?

www.slideshare.net ?

# About myself

Former university teacher in mathematics.

Mathematical interests: analysis, function theory, approximation theory, fractal approximation of functions.

Math competitions: training, team leader, problem coordinator, organizer, chairman of jury.

Stack Overflow:

https://stackoverflow.com/users/5249621/dmytro-mitin

- Top 15 in Scala by score.
- 3rd in Scala by number of answers; roughly 1.5% of all Stack Overflow questions tagged `scala` have an answer from me.
- 1st in Cats, `scala-reflect`, Scalameta, and Scala 3.
- 2nd in Scala macros.
- 3rd in Shapeless, after Travis Brown and Miles Sabin.

![stackoverflow](stackoverflow.png)

Online courses about dependent types (2017-2019).

Trainings about Shapeless and macros (2020).

Software engineer: telecom, fintech, cybersecurity, compilers, instant messengers, document-portal engines, web programming.

Programming / research interests: functional programming (Scala, Haskell, etc.), metaprogramming, compilers, type systems, formal verification, AI systems (harnesses, agents, etc.).

A Spark PR (not merged):

https://github.com/apache/spark/pull/38740

A merged Scala 3 compiler PR: fix for deferred-inline selection after `summonInline`:

https://github.com/scala/scala3/pull/26002

:)

# Announcement about Scala semantic harness (for coding agents)

Install via Coursier:

```bash
cs install --default-channels=false \
  --channel https://raw.githubusercontent.com/DmytroMitin/scala-semantic-harness/main/distribution/coursier/channel.json \
  semantic-scala semantic-scala-mcp
```

https://github.com/DmytroMitin/scala-semantic-harness

`skills/semantic-scala/SKILL.md`

`docs/agent-onboarding.md`

`docs/early-feedback.md` -> [link](https://github.com/DmytroMitin/scala-semantic-harness/blob/main/docs/early-feedback.md) !!!

# Disclaimer

Macro-Paradise, Quasiquotes, and AUXify are experimental/research projects.

There are released artifacts, but the projects are compiler-sensitive and their APIs, supported shapes, and compatibility policy are evolving.

Current released / development lines at the time of this talk:

- Macro-Paradise: `0.1.1` released; `0.2.0-SNAPSHOT` on current `main`.
- Quasiquotes: `0.3.0` released.
- AUXify-scala3: `0.1.0` released; `0.2.0-SNAPSHOT` on current `main`.
- Allow Experimental: `0.1.0` released.

The exact currently qualified Scala compiler lines for the compiler-sensitive projects in this talk are Scala `3.3.8`, `3.8.4`, and `3.9.0`.

Some examples below deliberately use released Macro-Paradise `0.1.1` because it is available from Maven Central and through the public `sbt new` starter. Other examples deliberately use current `main` / `0.2.0-SNAPSHOT` because the handler API has evolved. Those are both useful stories; they should simply be labelled when necessary.

The API is experimental and may evolve further.

# The question of the talk

Suppose an annotation transforms

```scala
@addFoo
class A
```

into something conceptually equivalent to

```scala
class A

object A:
  def foo(x: Int): String = x.toString
```

Should ordinary user code in the same compilation be allowed to write:

```scala
A.foo(10)
```

and have ordinary Scala name resolution and typing see the generated method?

That particular requirement is the center of this talk.

# The key distinction: generated code vs generated API

Scala 3 already has an experimental `scala.annotation.MacroAnnotation` API.

It can transform definitions and create definitions. The important limitation for the Paradise-style use case is more specific:

- generated definitions are available to the macro expansion itself;
- newly generated definitions are not generally visible to ordinary user-written code outside that expansion.

So the question is not simply:

> Can Scala 3 generate code from an annotation?

It can.

The question here is:

> Can an annotation change the program *before ordinary typing*, so that a generated member, companion, or sibling becomes part of the API that ordinary user code is subsequently typed against?

# Different times

Without macros we usually distinguish:

- compilation time;
- runtime of the compiled program.

With macros there is another important execution boundary:

1. compile the macro implementation / macro library;
2. compile the client program;
   - macro implementation code executes here;
   - it produces or transforms compiler trees;
3. run the client program;
   - the generated ordinary code executes here.

So instead of saying only "runtime of macros", it is clearer to say:

- macro implementation execution time = client compilation time;
- generated program runtime = ordinary runtime after compilation.

Original shorthand from the first draft:

- compile time of macros;
- runtime of macros = expansion of macros = compile time of main code (calling macros);
- runtime of main code.

# What are macros?

## Ordinary method

```scala
def add(left: Int, right: Int): Int = left + right
```

The method body executes when the program runs.

## Inline method

Scala 2:

```scala
@inline // optimizer recommendation / hint rather than Scala-3-style language semantics
def add(left: Int, right: Int): Int = left + right
```

Scala 3:

```scala
inline def add(left: Int, right: Int): Int = left + right
```

Scala 3 `inline` has language-level compile-time expansion semantics. The expansion happens during compilation, while ordinary operations in the resulting code normally execute later at runtime.

## Macro

A macro has compile-time implementation code that produces program code / compiler trees.

Scala 2:

```scala
def add(left: Int, right: Int): Int = macro addImpl

def addImpl(c: blackbox.Context)(left: c.Tree, right: c.Tree): c.Tree = {
  import c.universe._
  q"$left + $right"
}
```

Scala 3:

```scala
inline def add(left: Int, right: Int): Int = ${ addImpl('left, 'right) }

def addImpl(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
  '{ $left + $right }
```

`addImpl` executes while the caller is compiled. The produced expression normally executes as ordinary program code later.

# What are macro annotations?

A macro annotation transforms the annotated definition and may generate related definitions.

Example:

```scala
@addFoo
class A

// conceptually --->

class A

object A:
  def foo(x: Int): String = x.toString
```

For this talk the strongest use case is not merely generation, but generation that is visible to the ordinary compiler pipeline:

```scala
A.foo(10)
```

# What are use cases for macro annotations?

- code generation;
- derivation;
- instrumenting code;
- validation / compile-time checks;
- generating boilerplate members in a class or companion;
- generating type-class helpers and syntax;
- transforming existing definitions;
- generating sibling definitions.

# What are quasiquotes?

A quasiquote is source-like syntax for constructing or matching ASTs.

Instead of manually spelling tree constructors, for example conceptually:

```scala
Apply(Select(left, "+"), List(right))
```

we can write source-like syntax:

```scala
q"$left + $right"
```

A quasiquote may be used in two directions:

- **construction**: source-like template + holes -> tree;
- **pattern matching**: tree + source-like pattern -> captured subtrees.

Original progression from the first draft:

- manually build trees;
- parse source-code strings into trees / splice strings into strings;
- quasiquotes: splice trees into trees.

The important distinction is that a quasiquote is not only string interpolation. The holes represent structural AST pieces, and repeated holes can represent sequences of trees.

# Scala 2

## Def macros

### `reify` / `splice`

The quoted expression must typecheck when the macro implementation is compiled.

```scala
def add(left: Int, right: Int): Int = macro addImpl

def addImpl(c: blackbox.Context)(left: c.Expr[Int], right: c.Expr[Int]): c.Expr[Int] = {
  import c.universe._
  reify {
    left.splice + right.splice
  }
}
```

A limitation becomes visible when we want syntax that cannot be expressed as an already typechecked ordinary Scala expression in the macro implementation:

```scala
def make[A](args: Any*): A = macro makeImpl[A]

def makeImpl[A: c.WeakTypeTag](c: blackbox.Context)(args: c.Expr[Any]*): c.Expr[A] = {
  import c.universe._

  def exprsToExpr[T: WeakTypeTag](exprs: Seq[Expr[T]]): Expr[Seq[T]] =
    exprs.foldRight(reify { Seq.empty[T] }) { (expr, acc) => reify {
      expr.splice +: acc.splice
    }}

  reify {
    new A(exprsToExpr(args).splice) // error: class type required but A found
  }
}
```

### Scala 2 quasiquotes

Quasiquotes provide source-like construction at the compiler-tree level rather than requiring the template itself to be an ordinary typechecked expression in the macro implementation.

```scala
def add(left: Int, right: Int): Int = macro addImpl

def addImpl(c: blackbox.Context)(left: c.Tree, right: c.Tree): c.Tree = {
  import c.universe._
  q"$left + $right"
}
```

```scala
def make[A](args: Any*): A = macro makeImpl[A]

def makeImpl[A: c.WeakTypeTag](c: blackbox.Context)(args: c.Tree*): c.Tree = {
  import c.universe._
  q"new ${weakTypeOf[A]}(..$args)"
}
```

The `..$args` splice inserts a sequence of trees structurally.

## Scala 2 macro annotations / Macro Paradise

Scala 2 Macro Paradise expanded macro annotations before ordinary naming and typing of the transformed program.

Conceptually the important phase relationship was:

```text
parser
  -> macroparadise
  -> namer
  -> ...
  -> typer
```

So generated definitions participated in the normal downstream compiler pipeline.

```scala
import scala.annotation.{StaticAnnotation, compileTimeOnly}
import scala.language.experimental.macros
import scala.reflect.macros.whitebox

@compileTimeOnly("enable macro paradise to expand macro annotations")
class addFoo extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any = macro AddFooMacro.macroTransformImpl
}

object AddFooMacro {
  def macroTransformImpl(c: whitebox.Context)(annottees: c.Tree*): c.Tree = {
    import c.universe._
    annottees match {
      case (cls @ q"$mods class $tpname[..$tparams] $ctorMods(...$paramss) extends { ..$earlydefns } with ..$parents { $self => ..$stats }") :: Nil =>
        q"""
          $cls
          object ${tpname.toTermName} {
            def foo(x: Int): String = x.toString
          }
        """
    }
  }
}
```

The important property for this talk is phase placement: this transformation occurs before ordinary naming / typing of the transformed program.

# Scala 3

## Def macros: quotations and splices

Scala 3 uses quotes and splices:

- `'{ ... }` for term quotations;
- `'[ ... ]` for type quotations;
- `$` splices inside quotations;
- `${ ... }` to invoke compile-time macro implementation code from an inline definition.

```scala
inline def add(left: Int, right: Int): Int = ${ addImpl('left, 'right) }

def addImpl(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
  '{ $left + $right }
```

The quotation is typed. This is a major safety improvement, but it also means quotations are not a drop-in replacement for Scala 2's arbitrary compiler-tree quasiquotes.

A motivating constructor example from the first draft:

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }

def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  // A type parameter is not directly usable here as source syntax for `new A(...)`
  // in the same way Scala 2 tree quasiquotes could construct the tree.
  ???
```

## Scala 3 standard quoted reflection

Scala 3's standard quoted-reflection API does not provide the same Scala-2-style `q"..."` / `tq"..."` compiler-tree quasiquote layer for arbitrary reflection-tree construction and matching.

This does **not** mean Scala 3 has no quotation syntax: quotes and splices are fundamental to Scala 3 macros. The narrower claim is about the missing Scala-2-style convenience layer over reflection/compiler trees.

At reflection level we can construct trees manually.

Example from the first draft:

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }

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

Another, more explicit reflection-level construction from the first draft:

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }

def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  val fields: List[Symbol] = TypeRepr.of[A].typeSymbol.caseFields
  val fieldTypeTrees: List[TypeTree] = fields.map(_.tree.asInstanceOf[ValDef].tpt)

  Apply(
    Select.unique(New(TypeTree.of[A]), "<init>"),
    fieldTypeTrees.zipWithIndex.map((fieldType, i) =>
      TypeApply(
        Select.unique(
          Apply(
            Select.unique(args.asTerm, "apply"),
            List(Literal(IntConstant(i)))
          ),
          "asInstanceOf"
        ),
        List(fieldType)
      )
    )
  ).asExprOf[A]
```

# Scala 3 experimental `MacroAnnotation`

Scala 3 has a real experimental macro-annotation API, introduced by Nicolas Stucki and developed in the Scala 3 compiler.

It runs in the typed compiler world and can transform an annotated definition, transform its companion, and add definitions.

The crucial restriction for the use case of this talk is:

> New definitions are not visible to ordinary user-written code outside the macro expansion.

So it is better to say:

- suitable for validation and transformations;
- suitable for generating implementation details used by the expansion;
- capable of code generation;
- **not suitable for the specific Paradise-style goal where a newly generated API must become visible to subsequent ordinary user code in the same compilation**.

Example:

```scala
import scala.annotation.{MacroAnnotation, experimental}
import scala.quoted.{Quotes, Type, quotes}

@experimental
class addFoo extends MacroAnnotation:
  def transform(using Quotes)(
      tree: quotes.reflect.Definition,
      companion: Option[quotes.reflect.Definition]
  ): List[quotes.reflect.Definition] =
    import quotes.reflect.*
    tree match
      case ClassDef(className, _, _, _, _) =>
        val modParents = List(TypeTree.of[Object])

        val tpe = MethodType(List("x"))(
          _ => List(TypeRepr.of[Int]),
          _ => TypeRepr.of[String]
        )

        def decls(cls: Symbol): List[Symbol] = List(
          Symbol.newMethod(cls, "foo", tpe, Flags.EmptyFlags, Symbol.noSymbol)
        )

        val mod = Symbol.newModule(
          Symbol.spliceOwner,
          className,
          Flags.EmptyFlags,
          Flags.EmptyFlags,
          _ => modParents.map(_.tpe),
          decls,
          Symbol.noSymbol
        )
        val cls = mod.moduleClass
        val tcSym = cls.declaredMethod("foo").head
        val tcDef = DefDef(
          tcSym,
          argss => Some(Select.unique(argss.head.head.asInstanceOf[Term], "toString"))
        )
        val (modValDef, modClsDef) = ClassDef.module(mod, modParents, body = List(tcDef))

        val res = List(tree, modValDef, modClsDef)
        println(res.map(_.show))
        res
      case _ =>
        report.errorAndAbort("@addFoo can annotate only classes")
```

The important contrast is not "macro annotations vs no macro annotations".

It is:

```text
Scala 3 MacroAnnotation
  -> typed macro expansion
  -> generated definitions have deliberately limited visibility

Paradise-style transformation
  -> before ordinary typer
  -> generated definitions participate in ordinary name resolution / typing
```

# Where Macro-Paradise runs

This is the central architectural idea:

```text
source
  |
  v
parser
  |
  v
Macro-Paradise pre-typer phase
  - annotation discovery / target admission
  - handler expansion
  - output validation
  - transactional composition
  - package-stat replacement
  |
  v
typer
  |
  v
later compiler phases
```

The plugin is a standard Scala 3 compiler plugin whose custom phase is scheduled **after `parser` and before `typer`**.

Therefore generated members, companions, and sibling definitions exist before ordinary typing sees user-written references to them.

This is the reason code such as

```scala
@addFoo
class A

A.foo(10)
```

can be a meaningful target for the project.

# Our Scala 3 quasiquotes

The Quasiquotes project provides typed quoted-reflection quasiquote families:

```scala
import quasiquotes.Quasiquotes.qr
import quasiquotes.construct.TermSequenceSplices.termSplice
```

Example from the first draft: trying to splice a sequence as one ordinary term does not work:

```scala
// does not work as a sequence splice
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }

def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  qr"new ${TypeRepr.of[A]}(..${args.asTerm})".asExprOf[A]
```

Use the explicit sequence-splice transport:

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }

def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  args.asTerm.underlying.asExprOf[Seq[Any]] match
    case Varargs(params) =>
      qr"new ${TypeRepr.of[A]}(..${termSplice(params.map(_.asTerm))})".asExprOf[A]
```

# Scala 3 tree representations and phase boundaries

The original draft called this a "tree hierarchy". It is more accurate to call it a set of related representations separated by API and compiler-phase boundaries.

The arrows below are **not all subtype relationships**.

Compiler phase direction:

```text
source
  |
  v
parser
  |
  v
untpd.Tree
  |
  |  typer
  v
tpd.Tree
  |
  v
later typed compiler phases
```

The public staged / reflection world lives on the typed side:

```text
Expr[T]
  |\
  | \ public conversion
  |  -> quotes.reflect.Term
  |
  -> runtime implementation detail: ExprImpl

quotes.reflect.Term / ExprImpl
          |
          v
     Dotty typed representation
          tpd.Tree
```

Macro-Paradise works on the `untpd` side, before ordinary typer.

## Level 0: ordinary values / call site

```scala
inline def add(left: Int, right: Int): Int = ${ addExpr('left, 'right) }
```

## `scala.quoted.Expr`

Stay in the standard Scala 3 quotation world:

```scala
def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
  '{ $left + $right }
```

Or cross an implementation boundary to internal `ExprImpl`:

```scala
def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
  given Contexts.Context = quotes.asInstanceOf[impl.QuotesImpl].ctx
  addExprImpl(
    left.asInstanceOf[impl.ExprImpl],
    right.asInstanceOf[impl.ExprImpl]
  ).asInstanceOf[Expr[Int]]
```

Or use public quoted reflection:

```scala
def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
  import quotes.reflect.*
  addTerm(left.asTerm, right.asTerm).asExprOf[Int]
```

## `scala.quoted.runtime.impl.ExprImpl`

Internal implementation path to typed Dotty trees:

```scala
def addExprImpl(
    left: impl.ExprImpl,
    right: impl.ExprImpl
)(using Contexts.Context): impl.ExprImpl =
  impl.ExprImpl(addTpdTree(left.tree, right.tree), left.scope)
```

## `quotes.reflect.Term`

Standard Scala 3 reflection, manual construction:

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  import quotes.reflect.*
  Select.overloaded(left, "+", List(), List(right))
```

Our typed quasiquotes at the same quoted-reflection layer:

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  qr"$left + $right"
```

Possible internal bridge to typed Dotty tree:

```scala
def addTerm(using Quotes)(
    left: quotes.reflect.Term,
    right: quotes.reflect.Term
): quotes.reflect.Term =
  given Contexts.Context = quotes.asInstanceOf[impl.QuotesImpl].ctx
  addTpdTree(
    left.asInstanceOf[tpd.Tree],
    right.asInstanceOf[tpd.Tree]
  ).asInstanceOf[quotes.reflect.Term]
```

## `dotty.tools.dotc.ast.tpd.Tree`

Stay in typed Dotty:

```scala
def addTpdTree(
    left: tpd.Tree,
    right: tpd.Tree
)(using Contexts.Context): tpd.Tree =
  tpd.applyOverloaded(
    left,
    "+".toTermName,
    List(right),
    Nil,
    Types.WildcardType
  )
```

Or construct an untyped tree and ask a typer to type it:

```scala
def addTpdTree(
    left: tpd.Tree,
    right: tpd.Tree
)(using Contexts.Context): tpd.Tree =
  val untyped = addUntpdTree(
    untpd.TypedSplice(left),
    untpd.TypedSplice(right)
  )
  new Typer().typedExpr(untyped)
```

## `dotty.tools.dotc.ast.untpd.Tree`

Macro-Paradise operates here, before ordinary typer.

The typed `qr"..."` family is therefore not directly the right tree authoring surface for this phase.

Manual untyped construction:

```scala
def addUntpdTree(
    left: untpd.Tree,
    right: untpd.Tree
)(using util.SourceFile): untpd.Tree =
  untpd.Apply(
    untpd.Select(left, "+".toTermName),
    List(right)
  )
```

# Why typed `qr` / `dqr` do not directly solve Macro-Paradise authoring

This is an important separation of responsibilities.

The existing typed families:

```text
qr / qq   - terms
tqr / tqq - types
dqr / dqq - definitions
```

operate in Scala 3's staged `Quotes` / `quotes.reflect` world.

That is the correct representation for ordinary quoted macros.

Macro-Paradise inserts definitions before ordinary typer, where the compiler representation is `untpd.Tree`.

So:

```text
ordinary Scala 3 macro
  source-like typed quasiquote
        |
        v
  quotes.reflect.* / typed world

Macro-Paradise
  parser
    |
    v
  untpd.Tree
    |
    v
  ordinary typer
```

A `dqr` result must therefore not be described as directly insertable into the Macro-Paradise phase.

# Quasiquotes: three representation worlds

For the Macro-Paradise integration story it is useful to keep three different things distinct:

```text
Scalameta source AST
  scala.meta.*
  broad source-like syntax / parsing / construction

project-owned compiler-free semantic model
  bounded validated Term / Type / Definition meanings
  no Dotty symbols / ambient compiler resolution

exact Dotty untpd AST
  exact pre-Typer compiler topology
  compiler-version-specific raw trees
```

Scalameta is useful for source-like authoring, but it is not identical to the project-owned neutral semantic model. The neutral model may normalize or intentionally forget source-level distinctions. Exact `untpd` is a third world again.

# Quasiquotes: current neutral / exact lowering path

The current working downstream path uses Scalameta as a compiler-neutral, source-like authoring representation for supported definitions and Quasiquotes as the exact lowering layer:

```text
Scalameta definition / Scalameta quasiquote
        |
        v
Quasiquotes projection / bounded semantic plan where applicable
        |
        v
Quasiquotes exact-version lowering bridge
        |
        v
positioned Dotty untpd.DefDef / untpd.ValDef
        |
        v
Macro-Paradise placement helper
        |
        v
Macro-Paradise pre-typer insertion
        |
        v
ordinary Dotty typer
```

For some focused bridges the public entry point is directly Scalameta -> exact lowering; the architecture does not imply that every path literally exposes every intermediate representation.

Responsibilities remain separated:

- Scalameta/source frontend: source-like authoring;
- project-owned neutral model: compiler-free bounded semantics where used;
- Quasiquotes exact backend: lower the supported shape to exact compiler trees;
- Macro-Paradise: target admission, placement, conflict handling, composition, rollback, and phase timing;
- Dotty typer: authoritative semantic typing.

This separation is useful even if the public names or exact APIs evolve.

# Generating syntax is not enough

A pre-typer compiler tree is not just source syntax.

For robust insertion we also have to care about things such as:

```text
AST shape
+ source provenance / source attachment
+ spans / positions
+ ownership discipline
+ exact compiler representation
+ correct compiler phase
```

The current Quasiquotes generated-origin lowering path attaches deterministic virtual-source provenance for generated definitions.

Macro-Paradise validates the output rather than silently inventing missing provenance for arbitrary caller trees.

This is one reason the exact lowering bridges are useful even when a source-like Scalameta quasiquote looks simple.

# Macro-Paradise

Main project (compiler plugin):

https://github.com/DmytroMitin/macroparadise-scala3

Conceptual user surface:

```scala
@myAnnotation // user-defined macro annotation marker
class A
```

Accompanying Quasiquotes library:

https://github.com/DmytroMitin/quasiquotes-scala3

Typed quoted-reflection families:

```text
qr"..."       // term construction
case qq"..."  // term matching

tqr"..."      // type construction
case tqq"..." // type matching

dqr"..."      // definition construction
case dqq"..." // definition matching

$...           // structural splicing, with explicit ranked/sequence transports where required
```

The broader Quasiquotes architecture also contains compiler-neutral representations and exact Dotty-internal lowering bridges; those are what connect naturally to the pre-typer Macro-Paradise use case.

Example of a library consuming Macro-Paradise and Quasiquotes:

https://github.com/DmytroMitin/AUXify-scala3

Current first implemented Scala 3 slices:

```text
@apply
@aux
@instance
@delegated
@self
```

Designed / characterized but not yet implemented:

```text
@syntax
```

Postponed:

```text
@poly
```

The first draft listed:

```text
@aux, @instance, @delegated, @apply, @syntax, @self
```

Keep that list as the broader AUXify target, but do not imply all six are currently implemented.

Another compiler plugin:

https://github.com/DmytroMitin/allow-experimental

Current purpose: let a supported non-inline method implementation call selected APIs marked `scala.annotation.experimental` without making that method experimental for its callers.

```scala
@allowExperimental // annotation, not a macro annotation
```

Original shorthand from the first draft: "allow / swallow / catch / hide `@experimental`". The more precise formulation above better describes the current project semantics.

# Macro-Paradise: how to play

## Released `0.1.1` story

Fastest released starter:

```bash
sbt new DmytroMitin/macroparadise-scala3.g8
```

Sources:

```bash
# SSH
git clone git@github.com:DmytroMitin/macroparadise-scala3.git

# HTTPS
git clone https://github.com/DmytroMitin/macroparadise-scala3.git

# GitHub CLI
gh repo clone DmytroMitin/macroparadise-scala3
```

# Macro-Paradise versions and exact compiler identity

Released:

```scala
// Maven Central
"com.github.dmytromitin" % "macroparadise-scala3-plugin" % "0.1.1"
```

Current source / local development line:

```scala
// git clone ..., sbt publishLocal
"com.github.dmytromitin" % "macroparadise-scala3-plugin" % "0.2.0-SNAPSHOT"
```

Modules / artifacts:

- `macroparadise-scala3-plugin`;
- `macroparadise-scala3-plugin-api`.

Package:

```text
paradise3.api.*
```

Current qualified exact Scala versions:

```text
3.3.8
3.8.4
3.9.0
```

The plugin API and handlers expose compiler internals. This is why `CrossVersion.full` and exact compiler identity matter: a nearby Scala version is not automatically ABI-compatible with raw Dotty trees and compiler context types.

Current build requirements also use JDK 25 and sbt 1.12.15.

# Why handlers are normally precompiled

Macro-Paradise runs before the consumer is ordinarily typed.

A handler is executable compiler code and receives exact compiler internals.

Therefore the broad/default architecture has three conceptual stages:

```text
1. marker annotation
2. handler implementation
3. ordinary annotated consumer
```

The marker and handler must normally already exist when the consumer reaches the Macro-Paradise compiler phase.

This explains the build topology rather than treating it as accidental sbt complexity.

Current Macro-Paradise also contains bounded experimental different-file same-module support, but it is deliberately narrower than the precompiled-handler architecture. Same-file/general automatic source-handler discovery is not a general supported promise.

# Why exact class-loader identity matters

Exact-version coupling is not only about source APIs changing between compiler releases.

The handler exchanges raw Dotty trees and a compiler `Context` with the plugin. Therefore plugin and handler must agree on the same runtime identities for:

```text
paradise3.api.* contract classes
Scala runtime classes
Dotty compiler tree / Context classes
```

The external-handler architecture uses a shared parent-first universe for those classes. Loading a second incompatible compiler/API copy in a child handler classloader would make apparently identical raw types runtime-incompatible.

So `CrossVersion.full`, exact compiler qualification, handler classpath construction, and class-loader policy are all parts of the same design constraint.

# Possible future syntax

A possible future API could make the relationship between the marker and expander look more direct:

```scala
import paradise3.api.{ExpansionInput, ExpansionOutcome}
import dotty.tools.dotc.core.Contexts

class myAnnotation extends SomeFutureSuperParadiseAnnotationExpander:
  override def expand(
      input: ExpansionInput
  )(using Contexts.Context): ExpansionOutcome =
    ...
```

Conceptually similar to native Scala 3:

```scala
import scala.annotation.{MacroAnnotation, experimental}
import scala.quoted.{Quotes, quotes}

@experimental
class myAnnotation extends MacroAnnotation:
  def transform(using Quotes)(
      tree: quotes.reflect.Definition,
      companion: Option[quotes.reflect.Definition]
  ): List[quotes.reflect.Definition] =
    import quotes.reflect.*
    ...
```

and historically similar in intent to Scala 2:

```scala
import scala.annotation.{StaticAnnotation, compileTimeOnly}
import scala.language.experimental.macros
import scala.reflect.macros.whitebox

@compileTimeOnly("enable macro paradise to expand macro annotations")
class myAnnotation extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any = macro MyAnnotationMacro.macroTransformImpl
}

object MyAnnotationMacro {
  def macroTransformImpl(
      c: whitebox.Context
  )(
      annottees: /* c.Tree* */ c.Expr[Any]*
  ): /* c.Tree */ c.Expr[Any] = {
    import c.universe._
    ...
  }
}
```

# Current Macro-Paradise marker / handler syntax (`0.2.0-SNAPSHOT`)

The marker is an ordinary Scala annotation class carrying `@expander` metadata:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.MyAnnotationHandler")
final class myAnnotation extends StaticAnnotation
```

Current `main` handler API:

```scala
import dotty.tools.dotc.core.Contexts.Context
import paradise3.api.{ExpansionHandler, ExpansionInput, ExpansionOutcome}

final class MyAnnotationHandler extends ExpansionHandler:
  override def annotationName: String =
    "com.example.macros.annotations.myAnnotation"

  override def expand(
      input: ExpansionInput
  )(using Context): ExpansionOutcome =
    ...
```

The first draft used the older prototype name:

```text
ParadiseAnnotationExpander
```

and older structured output names such as:

```text
StructuredExpansionOutput
```

Those examples remain below as design history, but anything labelled **Current syntax** uses the current `ExpansionHandler` / `ExpansionChanges` / `ExpansionEdit` model.

# What is `@expander`?

The interesting question is not only "what language is this annotation written in?" but:

> How can an untyped pre-typer annotation marker identify executable expansion code?

There are two distinct annotations/classes in play:

```text
myAnnotation
  - Scala annotation class
  - extends scala.annotation.StaticAnnotation
  - appears in user source as @myAnnotation

@expander(...)
  - Java annotation type in paradise3.api
  - runtime-retained metadata on the marker class
  - maps marker identity to a precompiled ExpansionHandler class
```

Conceptually:

```text
@myAnnotation
      |
      v
compiled annotation-marker class
      |
      v
@expander("fully.qualified.HandlerClass")
      |
      v
Macro-Paradise handler discovery / loading
      |
      v
ExpansionHandler.expand(...)
```

Questions retained from the first draft, now answered more explicitly:

- `myAnnotation` is a Scala `StaticAnnotation` marker.
- `@expander` itself is a Java annotation type represented in class-file metadata.
- It uses runtime retention so the plugin can inspect the precompiled marker metadata.

Implementation shape:

```java
package paradise3.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Metadata annotation for precompiled marker annotations.
 *
 * Place @expander("fully.qualified.HandlerClass") on a marker annotation
 * so the plugin can discover which precompiled ExpansionHandler handles it.
 *
 * This metadata does not execute the handler by itself and is not Scala 2
 * macroTransform or Scala 3 MacroAnnotation.transform.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface expander {
  String value();
}
```

Historical note: the older source comment named `ParadiseAnnotationExpander`; current `main` calls the handler protocol `ExpansionHandler`.

# Project structure

Macro-Paradise consumer setup:

- `macro-annotations` / marker project;
- `macro-handlers` / expansion-handler project;
- `core` / ordinary consumer, with Macro-Paradise enabled and aware of the markers and handlers.

The first draft experimented with same build / different files.

Scala 2 classic split:

- `macros`;
- `core` depending on `macros`.

Native Scala 3 `MacroAnnotation` can use same-module different-file compilation through compiler suspension / macro loading mechanisms.

Macro-Paradise's broad/default path remains precompiled external handlers; bounded same-module support is a separate experimental lane.

# sbt: annotations and handlers not published (`0.1.1` released setup)

`project/build.properties`:

```text
sbt.version=1.12.15
```

`project/plugins.sbt`:

```scala
addSbtPlugin("com.github.dmytromitin" % "sbt-macroparadise" % "0.1.1")
```

`build.sbt`:

```scala
import macroparadise.sbt.MacroParadiseIntegration
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // or exact 3.8.4 / 3.9.0

lazy val macroAnnotations = (project in file("macro-annotations"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1")
        .cross(CrossVersion.full)
    )
  )

lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1")
        .cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value
    )
  )

lazy val core = (project in file("core"))
  //.dependsOn(macroAnnotations)
  .dependsOn(macroAnnotations % "provided->compile")
  .settings(
    MacroParadiseIntegration.precompiledProjects(
      macroAnnotations,
      macroHandlers
    ),
//  MacroParadiseIntegration.precompiledProjects(
//    markers = Seq(macroAnnotationsA, macroAnnotationsB),
//    handlers = Seq(macroHandlersA, macroHandlersB)
//  )
  )
  .enablePlugins(macroparadise.sbt.MacroParadisePrecompiledPlugin)
  .settings(macroParadiseCompilerProductVersion := "0.1.1")
```

# sbt: annotations and handlers published (`0.1.1` released setup)

If `macro-annotations` and `macro-handlers` are already published (`publishLocal`, Maven Central, etc.), their producing builds can define coordinates such as:

```scala
lazy val macroAnnotations = (project in file("macro-annotations"))
  .settings(
    moduleName := "my-macro-annotations",
    crossVersion := CrossVersion.full
  )

lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    moduleName := "my-macro-handlers",
    crossVersion := CrossVersion.full
  )
```

Consumer `project/build.properties`:

```text
sbt.version=1.12.15
```

Consumer `project/plugins.sbt`:

```scala
addSbtPlugin("com.github.dmytromitin" % "sbt-macroparadise" % "0.1.1")
```

Consumer `build.sbt`:

```scala
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // or exact 3.8.4 / 3.9.0

lazy val core = (project in file("core"))
  .enablePlugins(macroparadise.sbt.MacroParadisePrecompiledPlugin)
  .settings(
    macroParadiseCompilerProductVersion := "0.1.1",
    macroParadiseMarkerModules := Seq(
      (("com.example" % "my-macro-annotations" % "1.0.0").cross(CrossVersion.full)) % Provided
    ),
    macroParadiseHandlerModules := Seq(
      ("com.example" % "my-macro-handlers" % "1.0.0").cross(CrossVersion.full)
    )
  )
```

# Current-main sbt note (`0.2.0-SNAPSHOT`)

The current source tree also has `0.2.0-SNAPSHOT` sbt integration. It is not remotely published as a snapshot. To exercise it, publish the current `sbt-integration` project locally and use matching locally published current compiler-plugin/API artifacts for the selected exact Scala line.

So examples using the current `ExpansionHandler` API should be read as current-main/source-build examples unless a released `0.1.1` compatibility example is explicitly intended.

# What the sbt plugin actually does: annotations and handlers not published

The lower-level wiring retained from the first draft is useful for explaining what the integration plugin hides.

```scala
import macroparadise.sbt.MacroParadiseIntegration
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // or exact 3.8.4 / 3.9.0

lazy val macroAnnotations = (project in file("macro-annotations"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1")
        .cross(CrossVersion.full)
    )
  )

lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1")
        .cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value
    )
  )

lazy val core = (project in file("core"))
  .dependsOn(macroAnnotations)
  .settings(
    libraryDependencies += compilerPlugin(macroparadisePlugin),
    Compile / scalacOptions ++= {
      val markerJar = (macroAnnotations / Compile / packageBin).value
      val handlerJar = (macroHandlers / Compile / packageBin).value
      val handlerClasses = (macroHandlers / Compile / classDirectory).value.getCanonicalFile
      val handlerClasspath = handlerJar +:
        (macroHandlers / Runtime / dependencyClasspath).value.files
          .filterNot(_.getCanonicalFile == handlerClasses)

      val buildIdentity = ExternalArtifactIdentity.combined(
        Seq("marker" -> markerJar),
        handlerClasspath.zipWithIndex.map { case (file, index) =>
          f"handler-$index%04d" -> file
        }
      )

      Seq(
        "-Xplugin-require:macroparadise",
        s"-P:macroparadise:handlerClasspath=${handlerClasspath.map(_.getAbsolutePath).mkString(java.io.File.pathSeparator)}",
        s"-P:macroparadise:externalArtifactIdentity=sha256:$buildIdentity"
      )
    }
  )
```

The important concepts behind this wiring are:

- put the compiler plugin on the compiler plugin path;
- make the marker annotation visible to ordinary source compilation;
- make the precompiled handler and its dependencies visible to Macro-Paradise's handler loader;
- tie handler/marker artifacts to an identity so stale or mismatched build products are not silently reused.

# What the sbt plugin actually does: annotations and handlers published

The first draft left this as:

```text
???
```

Conceptually the published-module mode resolves the marker module and handler module from dependency coordinates instead of package outputs from sibling projects, then supplies the same three things to the compiler invocation:

```text
compiler plugin
+ marker classes on source compilation classpath
+ exact handler expansion classpath / artifact identity
```

The integration plugin is therefore an ergonomic and reproducibility layer over the same compiler-plugin configuration model.

# Macro-Paradise handler contract: plugin vs handler ownership (`0.2.0-SNAPSHOT`)

The plugin owns:

- annotation matching and target admission;
- handler discovery / loading;
- current target and companion relationship discovery;
- deterministic scheduling;
- package/container conflict checks;
- output validation;
- atomic application / rollback;
- final ordering and insertion before typer.

A handler owns one bounded transformation.

It receives a plugin-minted, read-only `ExpansionInput` and returns an `ExpansionOutcome`.

This means the normal model is not "a handler mutates arbitrary compiler state".

# Current target model

Current public target kinds are:

```text
Class
Trait
Object
```

The target kind is descriptive; the handler decides whether its specific annotation applies to the current shape.

Current execution is deliberately limited to the established package-level Class/Trait/Object slice.

Not currently enabled as general targets:

```text
nested / inner / local definitions
enum / enum case
method
val / var
type alias
parameter / type parameter
given
extension-related forms
```

This exact list is useful in the talk because "experimental" becomes a concrete technical boundary rather than a vague disclaimer.

# Primary, companion, siblings: current staged relationships

`ExpansionInput.primary` addresses the currently selected annotated definition.

`ExpansionInput.companion` is the actual compatible same-name current companion in the same staged scope / unit when one exists. Companion adjacency is not required.

Structured `primary`, `companion`, and sibling labels are addresses into the **current invocation revision**, not promises that those identities remain the same after a replacement.

The plugin:

```text
applies the requested changes privately
-> discards stale input relationship labels
-> recomputes actual companions from the resulting staged definitions
-> validates conflicts / topology
-> rescans the current staged program
```

So an expansion model based on current relationships is more precise than "return a list and assume the first tree stays primary".

# Current structured transformation model

The current structured API models sparse changes to the current invocation revision.

Conceptually:

```text
primary   : preserve / merge / replace / delete
companion : preserve / merge / replace / create / delete
siblings  : sparse create / addressed merge / replace / delete
```

The handler can also use immutable composable editing helpers:

```scala
ExpansionEdit.start(input)
// -> helper operations
ExpansionEdit.finish(edit)
```

More precisely, `ExpansionEdit.start(input)` returns an `Either[ExpansionDiagnostic, ExpansionEdit]`. Helper calls thread that immutable edit through a `for`-comprehension, and `ExpansionEdit.finish(...)` converts the final `Either` to an `ExpansionOutcome`.

The plugin applies all requested changes privately, recomputes real companion relationships from the resulting program, validates the result, and only then continues.

# Raw exact replacement

There is also an expert escape hatch:

```scala
ExpansionOutcome.Expanded(trees)
```

This can replace the handler-owned primary/companion region with zero or more raw supported definitions.

Important points:

- `Expanded(Nil)` can delete the owned region;
- output order is exact;
- there is no privileged "first returned tree is always the new primary" rule;
- final topology and conflicts are recomputed and validated by the plugin.

For normal authoring, the structured API and helpers are safer and more composable; raw `untpd` replacement remains available when needed.

# `@identity`: current composable form (`0.2.0-SNAPSHOT`)

Marker:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.IdentityHandler")
class identity extends StaticAnnotation
```

Current handler style:

```scala
import dotty.tools.dotc.core.Contexts.Context
import paradise3.api.{ExpansionEdit, ExpansionHandler, ExpansionInput, ExpansionOutcome}

final class IdentityHandler extends ExpansionHandler:
  override def annotationName: String =
    "com.example.macros.annotations.identity"

  override def expand(
      input: ExpansionInput
  )(using Context): ExpansionOutcome =
    ExpansionEdit.finish(ExpansionEdit.start(input))
```

Composable helper shape retained from the first draft:

```scala
val edited = for
  edit0 <- ExpansionEdit.start(input)
  edit1 <- ExpansionHelpers.placeMembersInPrimary(
    edit0,
    List(method.tree, method1.tree, method2.tree)
  )
  edit2 <- ExpansionHelpers.placeMembersInCompanion(
    edit1,
    List(method3.tree, method4.tree)
  )
yield edit2

ExpansionEdit.finish(edited)
```

# `@identity`: historical prototype forms

The first draft also documented older prototype forms. Keep them as history / design evolution, not as current API.

Older raw form:

```scala
final class IdentityHandler extends ParadiseAnnotationExpander:
  override def annotationName: String =
    "com.example.macros.annotations.identity"

  override def expand(
      input: ExpansionInput
  )(using Contexts.Context): ExpansionOutcome =
    ExpansionOutcome.Expanded(List(input.annotatedClass))
```

Older structured form:

```scala
final class IdentityHandler extends ParadiseAnnotationExpander:
  override def annotationName: String =
    "com.example.macros.annotations.identity"

  override def expand(
      input: ExpansionInput
  )(using Contexts.Context): ExpansionOutcome =
    ExpansionOutcome.Structured(
      StructuredExpansionOutput(
        primary = input.annotatedClass,
        companion = input.existingCompanion,
        additionalTopLevelDefinitions = List()
      )
    )
```

Older enum sketch from the first draft:

```scala
// enum ExpansionOutcome:
//   case Expanded(trees: List[untpd.Tree])
//   case Structured(output: StructuredExpansionOutput)
//   case Rejected(diagnostics: List[ExpansionDiagnostic], fallback: untpd.TypeDef)
//   case NotApplicable
```

These names have evolved on current `main`.

# `@gen`

Marker:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.GenHandler")
final class gen extends StaticAnnotation
```

Original prototype handler from the first draft:

```scala
import dotty.tools.dotc.core.Contexts.Context
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}
import paradise3.api.helpers.ExpansionHelpers

final class GenHandler extends ParadiseAnnotationExpander:
  override def annotationName: String =
    "com.example.macros.annotations.gen"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionHelpers.addStringMethodToClass(
      input,
      methodName = "generatedHello",
      value = s"Hello, ${input.className}!"
    )
```

Conceptual consumer:

```scala
@gen
class World

val greeting: String = new World().generatedHello
```

Current canonical examples use the new `ExpansionHandler` / `ExpansionEdit` API and source-like definition lowering; the semantic point of this example remains the same: the method is generated before typer and is visible to ordinary user code.

# Current-stage scheduling and stacked annotations

Macro-Paradise does not treat the original annotation list as one immutable work queue.

After a successful expansion, it validates the current staged program and rescans the current trees deterministically.

Consequences:

- a later annotation runs only if it still exists after earlier transformations;
- generated handled annotations can become new work;
- deleting a definition also deletes pending work owned by it;
- stacked annotations can operate on the latest revision;
- source order / tree preorder / annotation order provide deterministic selection.

This is important for real consumers such as AUXify where annotation composition matters.

# Transactional expansion / rollback

All successful stages in a compilation unit are provisional until the staged result remains valid.

Conceptually:

```text
annotation 1 succeeds
annotation 2 succeeds
annotation 3 fails
        |
        v
rollback the whole compilation unit
```

rather than leaking the partial effect of annotations 1 and 2.

Failures can include:

- explicit handler rejection;
- invalid output;
- collision / topology error;
- handler exception;
- stale / duplicate address;
- expansion budget exhaustion.

The current default operational budget is 256 successful stages per compilation unit. This is an engineering termination guard, not a semantic termination proof.

# `@addFoo`: current-main Quasiquotes + Scalameta + Macro-Paradise (`0.2.0-SNAPSHOT`)

Handler dependencies, preserving the shape of the original draft:

```scala
lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % macroparadiseV)
        .cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value,
      "org.scalameta" %% "scalameta" % "4.17.3",
      ("com.github.dmytromitin" % "quasiquotes-scala3-dotty-internal" % quasiquotesV)
        .cross(CrossVersion.full)
    )
  )
```

Marker:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.AddFooHandler")
final class addFoo extends StaticAnnotation
```

Current API version of the central idea:

```scala
import dotty.tools.dotc.core.Contexts.Context
import paradise3.api.*
import paradise3.api.helpers.{ExpansionHelpers, MissingCompanionPolicy}
import quasiquotes.definitions.dotty.ScalametaDefinitionGeneratedOriginBridge
import scala.meta.*
import scala.meta.dialects.Scala3

final class AddFooHandler extends ExpansionHandler:
  override def annotationName: String =
    "com.example.macros.annotations.addFoo"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionEdit.finish:
      for
        edit <- ExpansionEdit.start(input)
        _ <- input.primary match
          case ExpansionTarget.Class(_) => Right(())
          case _ =>
            Left(
              ExpansionDiagnostic(
                "@addFoo requires a class primary",
                input.currentAnnotation.sourcePos
              )
            )
        definition =
          q"def foo(x: Int): String = x.toString".asInstanceOf[Defn.Def]
        lowered <- ScalametaDefinitionGeneratedOriginBridge
          .lower(
            definition,
            "<macroparadise-generated:AddFooHandler:foo>"
          )
          .left
          .map(error =>
            ExpansionDiagnostic(
              s"${error.code}: ${error.detail}",
              input.currentAnnotation.sourcePos
            )
          )
        result <- ExpansionHelpers.placeMemberInCompanion(
          edit,
          lowered.tree,
          MissingCompanionPolicy.Create(
            ExpansionTargetKind.Object,
            DefinitionPlacement.AfterPrimary
          )
        )
      yield result
```

The `q"..."` above is a **Scalameta quasiquote**, not the typed `quasiquotes-scala3` `qr"..."` family.

The explicit missing-companion policy matters: for

```scala
@addFoo
class A
```

there is initially no `object A`, so current `placeMemberInCompanion` must be told to create one rather than using its default `Reject` policy.

Conceptual result:

```scala
@addFoo
class A

A.foo(10)
```

The chain is:

```text
Scalameta q"def foo ..."
  -> exact generated-origin lowering
  -> positioned untpd.DefDef
  -> ExpansionEdit
  -> companion Create + member placement
  -> transactional Macro-Paradise insertion
  -> ordinary typer sees A.foo
```

# `@addFoo`: generated members in the primary — historical prototype block

Original example retained from the first draft:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.AddFooHandler")
final class addFoo extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts
import paradise3.api.helpers.ExpansionHelpers
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}
import quasiquotes.definitions.dotty.ScalametaDefinitionGeneratedOriginBridge
import scala.meta.*

class AddFooHandler extends ParadiseAnnotationExpander:
  override def annotationName: String =
    "com.example.macros.annotations.addFoo"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    (
      ScalametaDefinitionGeneratedOriginBridge.lower(
        q"def foo(x: Int): String = ${Term.Name(input.annotatedClass.name.show)}.m(x)",
        "fooFile.scala"
      ),
      ScalametaDefinitionGeneratedOriginBridge.lower(
        q"def bar(x: Int): String = x.toString",
        "barFile.scala"
      ),
      ScalametaDefinitionGeneratedOriginBridge.lower(
        q"def baz(x: Int): String = bar(x)",
        "bazFile.scala"
      )
    ) match
      case (Right(method), Right(method1), Right(method2)) =>
        ExpansionHelpers.placeMembersInPrimary(
          input,
          List(method.tree, method1.tree, method2.tree)
        )
```

Consumer:

```scala
@addFoo
class A

object A:
  def m(x: Int): String = x.toString

A().foo(10)
A().bar(10)
A().baz(10)
```

This code block deliberately retains the old API names from the original experiment. For final slides, either keep it visibly labelled **historical prototype** or mechanically translate it to the current `ExpansionHandler` / `ExpansionEdit` / current target-view names.

# AUXify-scala3: why it matters to this talk

AUXify is not only a list of annotation demos. It is an independent downstream consumer that exercises the architecture:

```text
source annotation
    |
    v
Macro-Paradise scheduling / placement
    |
    +-- handler source-shape decoding
    |
    +-- source-like Scalameta construction
    |
    +-- Quasiquotes exact lowering
    |
    v
ordinary Scala typer
```

This makes AUXify useful as an integration test for the larger idea: can we build nontrivial user-facing macro-annotation libraries on top of the pre-typer mechanism?

# `@apply` (type-class materializer)

Simple case:

```scala
@apply
trait Show[A]:
  def show(a: A): String

object Show:
  given Show[String] with
    def show(a: String): String = a

  // generated conceptually:
  // def apply[A](using inst: Show[A]): Show[A] = inst

val stringShow: Show[String] = Show[String]
```

Path-dependent / refined result case:

```scala
@apply
trait Add[N <: Nat, M <: Nat]:
  type Out <: Nat
  def apply(n: N, m: M): Out

object Add:
  // generated conceptually:
  // def apply[N <: Nat, M <: Nat](using inst: Add[N, M]):
  //   Add[N, M] { type Out = inst.Out } = inst
```

Marker:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.github.dmytromitin.auxify.macros.internal.ApplyHandler")
class apply extends StaticAnnotation
```

Historical handler sketch from the first draft:

```scala
import dotty.tools.dotc.core.Contexts.Context

import paradise3.api.{
  ExpansionCompositionPolicy,
  ExpansionInput,
  ExpansionOutcome,
  ExpansionTargetProfile,
  ParadiseAnnotationExpander
}
import paradise3.api.helpers.{CompanionMethodConflictPolicy, ExpansionHelpers}
import quasiquotes.definitions.dotty.ContextualMethodPeerBridge

final class ApplyHandler extends ParadiseAnnotationExpander:
  override val annotationName: String =
    "com.github.dmytromitin.auxify.macros.apply"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionHelpers.withAnnotatedClassView(input): view =>
      view.typeParameters match
        case List(typeParameter) =>
          lowerAndPlace(
            input,
            ApplyDefinitionBuilder.lower(input.className, typeParameter.name)
          )
        // ...
```

```scala
private def lowerAndPlace(
    input: ExpansionInput,
    lowered: Either[
      ContextualMethodPeerBridge.Failure,
      ContextualMethodPeerBridge.Lowered
    ]
)(using Context): ExpansionOutcome =
  lowered match
    case Right(value) =>
      ExpansionHelpers.addMethodToCompanion(
        input,
        value.tree,
        CompanionMethodConflictPolicy.PreserveExisting
      )
    // ...
```

Source-like definition authoring / lowering:

```scala
private[internal] object ApplyDefinitionBuilder:
  def definition(
      className: String,
      typeParameterName: String
  ): Defn.Def =
    val classNameTree = Type.Name(className)
    val typeParameterNameTree = Type.Name(typeParameterName)
    val typeParameter = tparam"$typeParameterNameTree"
    val target = t"$classNameTree[$typeParameterNameTree]"
    q"def apply[$typeParameter](using inst: $target): $target = inst"

  def lower(
      className: String,
      typeParameterName: String
  )(using Context): Either[
      ContextualMethodPeerBridge.Failure,
      ContextualMethodPeerBridge.Lowered
  ] =
    ContextualMethodPeerBridge.lower(
      definition(className, typeParameterName),
      s"..."
    )
```

Again, this shows the design separation:

```text
Scalameta authors the source-like definition
-> Quasiquotes lowers it to exact Dotty untyped representation
-> Macro-Paradise places it
```

# `@aux` (type-level programming helper)

```scala
@aux
trait Add[N <: Nat, M <: Nat]:
  type Out <: Nat
  def apply(n: N, m: M): Out

object Add:
  // generated conceptually:
  // type Aux[N <: Nat, M <: Nat, Out0 <: Nat] =
  //   Add[N, M] { type Out = Out0 }
```

Marker:

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.github.dmytromitin.auxify.macros.internal.AuxHandler")
class aux extends StaticAnnotation
```

Historical handler sketch retained from the first draft:

```scala
final class AuxHandler extends ParadiseAnnotationExpander:
  override val annotationName: String =
    "com.github.dmytromitin.auxify.macros.aux"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    AuxHandler.expandWithLowering(input): (shape, context) =>
      AuxDefinitionBuilder.lower(shape)(using context)
```

```scala
private[internal] object AuxHandler:
  def expandWithLowering(
      input: ExpansionInput
  )(
      lower: Lowering
  )(using Context): ExpansionOutcome =
    input.annotatedClassTypeStructureView match
      case Right(structure) =>
        AuxSourceShapeDecoder.decode(input.className, structure) match
          case Right(shape) =>
            lower(shape, summon[Context]) match
              case Right(lowered) =>
                ExpansionHelpers.addTypeToCompanion(
                  input,
                  lowered.tree,
                  CompanionTypeConflictPolicy.PreserveExisting
                )
          // ...
      // ...
```

Definition authoring / exact lowering retained from the first draft:

```scala
private[internal] object AuxDefinitionBuilder:
  def definition(shape: AuxSourceShapeDecoder.Shape): Defn.Type =
    val aliasName = Type.Name("Aux")
    val typeClassName = Type.Name(shape.typeClassName)
    val firstTypeParameterName = Type.Name(shape.firstTypeParameterName)
    val secondTypeParameterName = Type.Name(shape.secondTypeParameterName)
    val upperBoundTypeName = Type.Name(shape.upperBoundTypeName)
    val resultTypeMemberName = Type.Name(shape.resultTypeMemberName)
    val generatedResultParameterName = Type.Name(shape.generatedResultParameterName)

    val firstTypeParameter: Type.Param =
      tparam"$firstTypeParameterName <: $upperBoundTypeName"
    val secondTypeParameter: Type.Param =
      tparam"$secondTypeParameterName <: $upperBoundTypeName"
    val generatedResultParameter: Type.Param =
      tparam"$generatedResultParameterName <: $upperBoundTypeName"

    val allTypeParameters =
      List(firstTypeParameter, secondTypeParameter, generatedResultParameter)

    val targetArguments: List[Type] =
      List(firstTypeParameterName, secondTypeParameterName)

    val target: Type = t"$typeClassName[..$targetArguments]"

    val resultEquality: Defn.Type =
      q"type $resultTypeMemberName = $generatedResultParameterName"

    val refinementMembers: List[Stat] = List(resultEquality)
    val refinement: Type = t"$target { ..$refinementMembers }"

    q"type $aliasName[..$allTypeParameters] = $refinement"

  def lower(
      shape: AuxSourceShapeDecoder.Shape
  )(using Context): Either[
      AuxTypeAliasPeerBridge.Failure,
      AuxTypeAliasPeerBridge.Lowered
  ] =
    val sourceDefinition = definition(shape)
    AuxTypeAliasPeerBridge.lower(
      sourceDefinition,
      expectedAliasName = "Aux",
      expectedFirstParameterName = shape.firstTypeParameterName,
      expectedFirstUpperBoundName = shape.upperBoundTypeName,
      expectedSecondParameterName = shape.secondTypeParameterName,
      expectedSecondUpperBoundName = shape.upperBoundTypeName,
      expectedOutputParameterName = shape.generatedResultParameterName,
      expectedOutputUpperBoundName = shape.upperBoundTypeName,
      expectedTargetName = shape.typeClassName,
      expectedRefinementMemberName = shape.resultTypeMemberName,
      virtualSourceName = s"..."
    )
```

# `@instance` (constructor of type-class instances)

```scala
@instance
trait Monoid[A]:
  def empty: A
  def combine(a: A, a1: A): A

object Monoid:
  // generated conceptually:
  // def instance[A](
  //   emptyValue: => A,
  //   combineFunction: (A, A) => A
  // ): Monoid[A] =
  //   new Monoid[A]:
  //     override def empty: A = emptyValue
  //     override def combine(a: A, a1: A): A = combineFunction(a, a1)
```

Current AUXify has a bounded implemented Scala 3 slice for this shape rather than full Scala 2 parity.

# `@delegated` (forwarder)

```scala
@delegated
trait Show[A]:
  def show(a: A): String

object Show:
  // generated conceptually:
  // def show[A](a: A)(using inst: Show[A]): String = inst.show(a)
```

A first bounded Scala 3 slice is implemented.

# `@syntax` (type-class syntax)

```scala
@syntax
trait Monoid[A]:
  def empty: A
  def combine(a: A, a1: A): A

object Monoid:
  // intended Scala 3 design:
  // object syntax:
  //   extension [A](a: A):
  //     def combine(a1: A)(using inst: Monoid[A]): A = inst.combine(a, a1)
```

Current status: **characterized / design selected, not yet implemented**.

The Scala 3 design uses native extension methods while preserving the familiar import style:

```scala
import Monoid.syntax.*
```

# `@self` (type-level programming helper)

Broader parity target / original example:

```scala
@self
sealed trait Nat:
  type ++ = Succ[Self]

@self
case object _0 extends Nat

type _0 = _0.type

@self
case class Succ[N <: Nat](n: N) extends Nat
```

Conceptual expansion:

```scala
sealed trait Nat: self =>
  type Self >: self.type <: Nat { type Self = self.Self }
  type ++ = Succ[Self]

case object _0 extends Nat:
  override type Self = _0

type _0 = _0.type

case class Succ[N <: Nat](n: N) extends Nat:
  override type Self = Succ[N]
```

Important current-status correction: the current Scala 3 `@self` implementation is only a bounded first slice for a plain zero-parameter trait with default semantics. Class/object/generic targets and the full parity example above are not yet generally supported.

Keep this example as the broader semantics / parity target, not as a claim that the whole example works today.

# AUXify annotation composition

The current project also exercises bounded composition, which is important evidence for Macro-Paradise's current-tree scheduler.

Examples include both source orders of supported combinations such as:

```scala
@apply
@instance
trait ApplyThenInstance[A]:
  def empty: A
  def combine(a: A, a1: A): A
```

and:

```scala
@instance
@apply
trait InstanceThenApply[A]:
  def empty: A
  def combine(a: A, a1: A): A
```

There are also bounded `@apply` + `@aux` composition slices and bounded `@apply` + `@delegated` composition slices.

This is stronger evidence than isolated examples because the second handler must see the current result of the first transformation rather than an immutable copy of the original source tree.

# Re-writing / actual transformations

Fresh code generation is only one direction.

A stronger transformation changes an existing definition itself.

Original TODO example:

```scala
@addOption
def foo(x: Int): String = rhs

// --->

def foo(x: Int): Option[String] = Option(rhs)
```

This direction is harder because we need to preserve the parts of an existing compiler tree that should remain exact while safely replacing selected parts.

The current Quasiquotes architecture distinguishes:

- fresh source-like neutral authoring + exact lowering;
- existing-tree capture / structural rewrite as a separate exact problem.

A useful future architecture is:

```text
existing untpd
  -> bounded exact capture / view
  -> preserve exact raw handles for unchanged pieces
  -> author / lower changed fragments
  -> validated reconstruction plan
  -> untpd
```

This should not be confused with simply round-tripping the whole existing Dotty owner through Scalameta.

# Quasiquotes architecture: Q / N / U-D / U-U / C

What initially looks like "bring back Scala 2 quasiquotes" splits into several independent questions in Scala 3:

1. What is the source-like authoring / pattern language?
2. What semantic representation do we use between frontends and backends?
3. Is the target typed quoted reflection or raw pre-typer Dotty?
4. Are we generating a fresh tree or transforming an existing owner?
5. How do the layers compose into public APIs and downstream integrations?

The project uses this short internal vocabulary:

```text
Q
  Quotes-aware typed quasiquote / frontend world
  public qr/qq, tqr/tqq, dqr/dqq are primarily here

N
  neutral / compiler-free project semantic model
  bounded Term / Type / Definition meanings and Scalameta interoperability

U-D
  "untyped, fresh lowering" direction
  build fresh exact Dotty untpd trees from validated semantic/source plans

U-U
  "untyped -> untyped" existing-tree transformation direction
  capture / preserve / rewrite / reconstruct an existing exact untpd graph

C
  cross-layer composition / integration / API policy
  not another AST world
```

Important non-equivalences:

```text
N != public n* syntax
U != public u* syntax
C != another tree universe
```

Possible future `n*` or `u*` syntax names are optional surface decisions, not what the letters themselves mean.

The exact internal labels matter less to the talk than the architectural lesson:

> one source-like syntax can only be honest if it lowers differently for the compiler phase / representation in which the result will be used.

# Scala 2 felt more like one tree world

Scala 2 macro APIs and quasiquotes were built around a broadly shared reflection/compiler `Tree` universe.

That made it relatively natural to use source-like quasiquotes for both ordinary macros and Macro-Paradise annottees.

Scala 3 draws a much stronger boundary between:

```text
public typed staged reflection
  Quotes / Expr / quotes.reflect
```

and:

```text
compiler-internal phase trees
  untpd / tpd / Context
```

Macro-Paradise deliberately chooses the compiler-internal pre-typer side because that is where generated definitions can participate in ordinary typing.

# Current limits / what not to claim

Macro-Paradise current `main`:

- package-level Class/Trait/Object target slice;
- exact Scala 3.3.8 / 3.8.4 / 3.9.0 support;
- compiler-sensitive `ExpansionHandler` API;
- precompiled external handlers as the broad/default architecture;
- bounded same-module support as a separate experiment;
- deterministic current-tree scheduling;
- transactional validation / rollback;
- structured changes plus raw exact replacement escape hatch.

Do **not** claim yet:

- general nested/local target support;
- arbitrary method/val/type/given/extension annotation targets;
- compiler-version-independent handler binaries;
- general same-file source handler discovery;
- arbitrary Scalameta -> arbitrary `untpd` lowering;
- that typed `dqr` output can simply be inserted by the pre-typer plugin;
- that AUXify `@syntax` is implemented;
- that the broad `@self` parity example is fully implemented.

# What works today: one concise end-to-end story

A useful compact narrative for the final talk could be:

```scala
@addFoo
class A

A.foo(10)
```

1. `@addFoo` is an ordinary Scala marker annotation carrying `@expander` metadata.
2. Macro-Paradise sees it after parser, before typer.
3. The precompiled handler is loaded for the exact compiler line.
4. The handler authors `def foo...` using source-like Scalameta syntax.
5. Quasiquotes lowers that supported definition to positioned exact `untpd`.
6. An `ExpansionEdit` explicitly creates the missing companion and places the member.
7. Macro-Paradise validates the staged transaction and rescans the current program.
8. Ordinary Dotty typer now sees the generated `A.foo`.

That is the core experiment behind "rebuilding Macro Paradise".

# Why this is different from native Scala 3 `MacroAnnotation`

Native Scala 3 macro annotation:

```text
already typed / typed macro-expansion world
-> strong typed reflection
-> generated definitions deliberately have limited external visibility
```

Macro-Paradise experiment:

```text
parsed untyped program
-> pre-typer source transformation
-> generated definitions become ordinary compiler input
-> ordinary typer sees them
```

Neither design is universally "better".

They optimize for different semantics and different safety / compiler-integration trade-offs.

# Costs of the pre-typer approach

The benefits come with real costs:

- compiler-internal API dependence;
- exact Scala version coupling;
- more responsibility for valid untyped trees and source provenance;
- more complicated handler loading / build topology;
- IDE / incremental compiler / same-module behavior is harder;
- less help from the public typed reflection API;
- more work required for diagnostics, composition, rollback, and validation.

This is an experiment in whether the additional power is worth those costs for libraries that genuinely need source-visible generated APIs.

# Possible future directions

Macro-Paradise:

- broader target support;
- more same-module / IDE qualification;
- more ergonomic handler authoring;
- potentially more direct annotation/handler syntax;
- further transformation APIs while preserving transactional semantics.

Quasiquotes:

- broaden neutral Term/Type/Definition semantics;
- broaden exact lowering coverage;
- improve compiler-neutral authoring;
- continue existing-tree capture/rewrite work;
- possibly expose future neutral quasiquote names (`n*`) or exact untyped sugar (`u*`) if the programmatic architecture proves sound.

AUXify:

- widen the currently bounded `@apply`, `@aux`, `@instance`, `@delegated`, `@self` slices;
- implement the selected Scala 3 `@syntax` design;
- continue Scala 2 parity only where Scala 3 has an appropriate semantic counterpart.

# Reminder about Scala semantic harness

https://github.com/DmytroMitin/scala-semantic-harness

Feedback about Scala semantic harness:

https://github.com/DmytroMitin/scala-semantic-harness/blob/main/docs/early-feedback.md

# Subscribe / contact

LinkedIn:

https://www.linkedin.com/in/dmitin/

GitHub:

https://github.com/DmytroMitin

Facebook:

https://www.facebook.com/dmitry.mitin

X:

https://x.com/DmytroMitin

Instagram:

https://www.instagram.com/dmytro.mitin/

Threads:

https://www.threads.com/@dmytro.mitin

YouTube:

https://www.youtube.com/@DmytroMitin

Email:

dmitin3@gmail.com
