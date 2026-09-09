# First slide

London Scala User Group:
 
![emblem](london_scala_emblem_400x400.jpg)

Dmytro Mitin

**Title:**
Can Scala 3 Have Macro Annotations Again?
Rebuilding Macro Paradise

9 September 2026

# This presentation

https://github.com/DmytroMitin/macroparadise-london-scala-talk-09-2026

QR code?

www.slideshare.net ?

# About myself

University teacher (math)

Interests: analysis, function theory, approximation theory, fractal approximation of functions 

Math competitions (training, team leader, problem coordinator, organizer, chairman of jury)

Stackoverflow https://stackoverflow.com/users/5249621/dmytro-mitin 

top 15th in Scala (by score) 

top 3rd in Scala (by number of answers, the answers for ~1.5% of all questions about Scala)

top 1st in Cats, `scala-reflect`, Scalameta, and Scala 3

top 2nd in Scala macros

top 3rd in Shapeless (after Travis Brown and Miles Sabin)

![stackoverflow](stackoverflow.png)

Online courses about dependent types (2017-2019)

Trainings about Shapeless and macros (2020)

Software engineer (telecom, fintech, cybersecurity, compilers, instant messengers, doc portal engines, web programming)

Interests: functional programming (Scala/Haskell/etc), metaprogramming, compilers, type systems, formal verification, AI (harnesses/agents/etc)

A PR into Spark (not merged) https://github.com/apache/spark/pull/38740

A PR into Scala 3 compiler (merged) https://github.com/scala/scala3/pull/26002

:)

# Announcement about Scala semantic harness (for coding agents)

Install via coursier:
```
cs install --default-channels=false \
  --channel https://raw.githubusercontent.com/DmytroMitin/scala-semantic-harness/main/distribution/coursier/channel.json \
  semantic-scala semantic-scala-mcp
```

https://github.com/DmytroMitin/scala-semantic-harness

`skills/semantic-scala/SKILL.md`

`docs/agent-onboarding.md`

`docs/early-feedback.md` -> [link](https://github.com/DmytroMitin/scala-semantic-harness/blob/main/docs/early-feedback.md) !!!

# Disclaimer

Compiler plugin and libraries are in early stage

# Different times

Without macros:

- Compile time 

- Runtime

With macros:

- Compile time of macros

- Runtime of macros = expansion of macros = compile time of main code (calling macros)

- Runtime of main code

# What are macros?

- Ordinary method

```scala
def add(left: Int, right: Int): Int = left + right
```

- Inline method (inlined at compile time, executed at runtime)

```scala
// Scala 2
@inline // recommendation
def add(left: Int, right: Int): Int = left + right
```

```scala
// Scala 3
// requirement
inline def add(left: Int, right: Int): Int = left + right
```

- Macro (inlined and executed at compile time)

```scala
// Scala 2
def add(left: Int, right: Int): Int = macro addImpl
def addImpl(c: blackbox.Context)(left: c.Tree, right: c.Tree): c.Tree = {
  import c.universe._
  q"$left + $right"
}
```

```scala
// Scala 3
def add(left: Int, right: Int): Int = ${addImpl('left, 'right)}
def addImpl(left: Expr[Int], right: Expr[Int]): Expr[Int] = '{ $left + $right }
```

# What are macro-annotations?

```scala
@addFoo
class A

// --->

class A

object A:
  def foo(x: Int): String = x.toString
```

# What are use cases for macro-annotations?

- code generation

- derivation

- instrumenting code

# What are quasi-quotes? 

- manual building trees

- parsing source code (strings) into trees, splicing strings into strings

- quasi-quotes, splicing trees into trees

# Scala 2

- Def macros

  - `reify` / `splice` (must typecheck at macro compile time)

```scala
def add(left: Int, right: Int): Int = macro addImpl
def addImpl(c: blackbox.Context)(left: c.Expr[Int], right: c.Expr[Int]): c.Expr[Int] = {
  import c.universe._
  reify {
    left.splice + right.splice
  }
}
```

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

  - quasi-quotes (must typecheck at ordinary compile time)

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

- Macro-annotations (expanded at compile time before type-checking)

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
      case (cls@q"$mods class $tpname[..$tparams] $ctorMods(...$paramss) extends { ..$earlydefns } with ..$parents { $self => ..$stats }") :: Nil =>
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

# Scala 3

- Def macros 

  - quotations `'{...}`, `'{... $... ...}`, `'[...]` (must typecheck at macro compile-time)
 
```scala
inline def add(left: Int, right: Int): Int = ${ addImpl('left, 'right) }
def addImpl(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] = '{ $left + $right }
```

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }
def makeImpl[A: Type](args: Expr[Any]*)(using Quotes): Expr[A] =
  '{new A(${Expr.ofSeq(args)})} // A does not have a constructor
```

  - no quasi-quotes (as in Scala 2), only manual reflection level

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }
def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  args.asTerm.underlying.asExprOf[Seq[Any]] match
    case Varargs(params) =>
      Select.overloaded(New(TypeTree.of[A]), "<init>", Nil, params.map(_.asTerm).toList).asExprOf[A]
```

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
            Select.unique(
              args.asTerm,
              "apply"),
            List(Literal(IntConstant(i)))
          ), "asInstanceOf"),
        List(fieldType)
      )
    )
  ).asExprOf[A]
```

- Macro annotations, Nicolas Stucki (expanded at compile time during type-checking, new definitions are visible only during macro expansion, suitable for code validation, not so suitable for code generation)

```scala
import scala.annotation.{MacroAnnotation, experimental}
import scala.quoted.{Quotes, Type, quotes}

@experimental
class addFoo extends MacroAnnotation:
  def transform(using Quotes)(tree: quotes.reflect.Definition, companion: Option[quotes.reflect.Definition]): List[quotes.reflect.Definition] =
    import quotes.reflect.*
    tree match
      case ClassDef(className, _, _, _, _) =>
        val modParents = List(TypeTree.of[Object])

        val tpe = MethodType(List("x"))(_ => List(TypeRepr.of[Int]), _ => TypeRepr.of[String])

        def decls(cls: Symbol): List[Symbol] = List(
          Symbol.newMethod(cls, "foo", tpe, Flags.EmptyFlags, Symbol.noSymbol)
        )

        val mod = Symbol.newModule(Symbol.spliceOwner, className, Flags.EmptyFlags, Flags.EmptyFlags,
          _ => modParents.map(_.tpe), decls, Symbol.noSymbol)
        val cls = mod.moduleClass
        val tcSym = cls.declaredMethod("foo").head
        val tcDef = DefDef(tcSym, argss => Some(Select.unique(argss.head.head.asInstanceOf[Term], "toString")))
        val (modValDef, modClsDef) = ClassDef.module(mod, modParents, body = List(tcDef))

        val res = List(tree, modValDef, modClsDef)
        println(res.map(_.show))
        res
      case _ =>
        report.errorAndAbort("@addFoo can annotate only classes")
```
  
  - No macro annotations (expanded at compile time before type-checking as in Scala 2)

# Our quasi-quotes

```scala
import quasiquotes.Quasiquotes.qr
import quasiquotes.construct.TermSequenceSplices.termSplice
```

```scala
// doesn't work
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }
def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  qr"new ${TypeRepr.of[A]}(..${args.asTerm})".asExprOf[A]
```

```scala
inline def make[A](args: Any*): A = ${ makeImpl[A]('args) }
def makeImpl[A: Type](args: Expr[Seq[Any]])(using Quotes): Expr[A] =
  import quotes.reflect.*
  args.asTerm.underlying.asExprOf[Seq[Any]] match
    case Varargs(params) =>
      qr"new ${TypeRepr.of[A]}(..${termSplice(params.map(_.asTerm))})".asExprOf[A]
```

# Walk by Scala tree hierarchy

```text
Level 1   Level 2               Level 3     Level 4
Expr   -> (A) ExprImpl       -> tpd.Tree -> untpd.Tree
       -> (B) q.reflect.Term -> 
```

- Level 0, values

```scala
inline def add(left: Int, right: Int): Int = ${ addExpr('left, 'right) }
```

- Level 1, `scala.quoted.Expr`

  - stay here (standard Scala 3 quotations work here)

    ```scala
    def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
      '{ $left + $right }
    ```  

  - go deeper to internal `ExprImpl` (A)

    ```scala
    def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
      given Contexts.Context = quotes.asInstanceOf[impl.QuotesImpl].ctx
      addExprImpl(left.asInstanceOf[impl.ExprImpl], right.asInstanceOf[impl.ExprImpl]).asInstanceOf[Expr[Int]]
    ```

  - go deeper `q.reflect.Term` (B)

    ```scala  
    def addExpr(left: Expr[Int], right: Expr[Int])(using Quotes): Expr[Int] =
      import quotes.reflect.*
      addTerm(left.asTerm, right.asTerm).asExprOf[Int]
    ```
    
- Level 2 (A), `scala.quoted.runtime.impl.ExprImpl`

  - go deeper to Dotty `tpd.Tree`

    ```scala
    def addExprImpl(left: impl.ExprImpl, right: impl.ExprImpl)(using Contexts.Context): impl.ExprImpl =
      impl.ExprImpl(addTpdTree(left.tree, right.tree), left.scope)
    ```
    
- Level 2 (B), `q.reflect.Term`

   - stay here (standard Scala 3 reflection, manual approach)

     ```scala
     def addTerm(using Quotes)(left: quotes.reflect.Term, right: quotes.reflect.Term): quotes.reflect.Term =
       import quotes.reflect.*
       Select.overloaded(left, "+", List(), List(right))
     ```  
     
   - stay here (our quasi-quotes work here)
  
     ```scala
     def addTerm(using Quotes)(left: quotes.reflect.Term, right: quotes.reflect.Term): quotes.reflect.Term =
       qr"$left + $right"
     ```  
     
   - go deeper to Dotty `tpd.Tree`
  
     ```scala
     def addTerm(using Quotes)(left: quotes.reflect.Term, right: quotes.reflect.Term): quotes.reflect.Term =
       given Contexts.Context = quotes.asInstanceOf[impl.QuotesImpl].ctx
       addTpdTree(left.asInstanceOf[tpd.Tree], right.asInstanceOf[tpd.Tree]).asInstanceOf[quotes.reflect.Term]
     ```
     
- Level 3, `dotty.tools.dotc.ast.tpd.Tree`

  - stay here
 
    ```scala
    def addTpdTree(left: tpd.Tree, right: tpd.Tree)(using Contexts.Context): tpd.Tree =
      tpd.applyOverloaded(
        left,
        "+".toTermName,
        List(right),
        Nil,
        Types.WildcardType
      )
    ```

  - go deeper to Dotty `untpd.Tree` 

    ```scala
    def addTpdTree(left: tpd.Tree, right: tpd.Tree)(using Contexts.Context): tpd.Tree =
      val untyped = addUntpdTree(untpd.TypedSplice(left), untpd.TypedSplice(right))
      new Typer().typedExpr(untyped)
    ```
 
- Level 4, `dotty.tools.dotc.ast.untpd.Tree` (Macro-paradise plugin works here, `qr"..."` don't suit here)

```scala
def addUntpdTree(left: untpd.Tree, right: untpd.Tree)(using util.SourceFile): untpd.Tree =
  untpd.Apply(
    untpd.Select(left, "+".toTermName),
    List(right)
  )
```

# Macro-paradise

Main project (compiler plugin):

https://github.com/DmytroMitin/macroparadise-scala3

```
@myAnnotation // user-defined macro-annotation
```

Accompanying library:

https://github.com/DmytroMitin/quasiquotes-scala3

```
qr"..."       // terms
case qq"..."
tqr"..."      // types
case tqq"..."
dqr"..."      // definitions
case dqq"..."

$... // splicing
```

Example (a library consuming Macro-paradise and Quasi-quotes):

https://github.com/DmytroMitin/AUXify-scala3

```
@aux, @instance, @delegated, @apply, @syntax, @self
```

Another my compiler plugin:

https://github.com/DmytroMitin/allow-experimental

Allow (swallow / catch / hide) `@experimental`

```
@allowExperimental // annotation, not macro-annotation
```

# Macro-paradise

How to play:

`sbt new DmytroMitin/macroparadise-scala3.g8`

Sources:

```
# SSH
git clone git@github.com:DmytroMitin/macroparadise-scala3.git
# HTTPS
git clone https://github.com/DmytroMitin/macroparadise-scala3.git
# GitHub CLI
gh repo clone DmytroMitin/macroparadise-scala3
```

# The latest version

```
// Sonatype/Maven Central
"com.github.dmytromitin" % "macroparadise-scala3-plugin" % "0.1.1"
```

```
// git clone ..., sbt publishLocal
"com.github.dmytromitin" % "macroparadise-scala3-plugin" % "0.2.0-SNAPSHOT"
```

Modules:

- `macroparadise-scala3-plugin`
- `macroparadise-scala3-plugin-api`

Package: `paradise3.api.*`

# Possible future syntax

```scala
import paradise3.api.{ExpansionInput, ExpansionOutcome}
import dotty.tools.dotc.core.Contexts

class myAnnotation extends SomeFutureSuperParadiseAnnotationExpander:
  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome = ...
```

similar to:

- Scala 3, Nicolas Stucki

```scala
import scala.annotation.{MacroAnnotation, experimental}
import scala.quoted.{Quotes, quotes}

@experimental
class myAnnotation extends MacroAnnotation:
  def transform(using Quotes)(tree: quotes.reflect.Definition): List[quotes.reflect.Definition] =
    import quotes.reflect.*
    ...
```

- Scala 2

```scala
import scala.annotation.{StaticAnnotation, compileTimeOnly}
import scala.language.experimental.macros
import scala.reflect.macros.whitebox

@compileTimeOnly("enable macro paradise to expand macro annotations")
class myAnnotation extends StaticAnnotation {
  def macroTransform(annottees: Any*): Any = macro MyAnnotationMacro.macroTransformImpl
}

object MyAnnotationMacro {
  def macroTransformImpl(c: whitebox.Context)(annottees: /* c.Tree* */c.Expr[Any]*): /* c.Tree */c.Expr[Any] = {
    import c.universe._
    ...
  }
}
```

# Current syntax

```scala
// macro-annotations
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.MyAnnotationHandler")
final class myAnnotation extends StaticAnnotation

// macro-handlers
import dotty.tools.dotc.core.Contexts
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}

class MyAnnotationHandler extends ParadiseAnnotationExpander:
  override def annotationName: String = "com.example.macros.annotations.addFooToClassCompanion"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome = ...
```

What language is `@expander` written in?

Is it a `scala.annotation.StaticAnnotation` (present in Scala sources)?

Is it a `scala.annotation.Annotation` (present in Java class files, bytecode)?

# `@expander`

```java
// java
package paradise3.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Metadata annotation for precompiled marker annotations.
 *
 * <p>Place {@code @expander("fully.qualified.HandlerClass")} on a marker annotation to let the
 * plugin discover which precompiled {@link ParadiseAnnotationExpander} class should handle that
 * marker. The handler class must still be compiled before use and reachable through the explicit
 * handler classpath.
 *
 * <p>This annotation is metadata only. It does not make the handler executable by itself, does not
 * support same-module source handlers, and is not Scala 2 {@code macroTransform} or Scala 3 {@code
 * MacroAnnotation.transform}.
 */
@Retention(RetentionPolicy.RUNTIME) // not SOURCE, not CLASS (Java default)
@Target({ElementType.TYPE, ElementType.ANNOTATION_TYPE})
public @interface expander {
  String value();
}
```

# Project structure

Macro-paradise:

- `macro-annotations`

- `macro-handlers`

- `core` (depends on `macro-annotations`, Macro-paradise switched on, Macro-paradise should be aware of `macro-annotations`, `macro-handlers`)

(same module, different files as an experiment)

Scala 2:

- `macros`

- `core` (depends on `macros`)

Scala 3, Nicolas Stucki:

- same module, different files

# Sbt (annotations and handlers not published)

- `project/build.properties`:

```
sbt.version=1.12.15
```

- `project/plugins.sbt`: 

```scala
addSbtPlugin("com.github.dmytromitin" % "sbt-macroparadise" % "0.1.1")
```

- `build.sbt`:

```scala
import macroparadise.sbt.MacroParadiseIntegration
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // 3.8.4, 3.9.0

lazy val macroAnnotations = (project in file("macro-annotations"))
  .settings(libraryDependencies ++= Seq(
    ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1").cross(CrossVersion.full),
  ))

lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1").cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value,
    )
  )

lazy val core = (project in file("core"))
  //.dependsOn(macroAnnotations)
  .dependsOn(macroAnnotations % "provided->compile")
  .settings(
    MacroParadiseIntegration.precompiledProjects(
      macroAnnotations,
      macroHandlers,
    ),
//    MacroParadiseIntegration.precompiledProjects(
//      markers = Seq(macroAnnotationsA, macroAnnotationsB),
//      handlers = Seq(macroHandlersA, macroHandlersB)
//    ),
  )
  .enablePlugins(macroparadise.sbt.MacroParadisePrecompiledPlugin)
  .settings(macroParadiseCompilerProductVersion := "0.1.1")
```

# Sbt (annotations and handlers published)

If `macro-annotations`, `macro-handlers` are already published (`sbt publishLocal`, at Maven Central etc.)

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
then

- `project/build.properties`:

```
sbt.version=1.12.15
```

- `project/plugins.sbt`:

```scala
addSbtPlugin("com.github.dmytromitin" % "sbt-macroparadise" % "0.1.1")
```

- `build.sbt`:

```scala
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // 3.8.4, 3.9.0

lazy val core = (project in file("core"))
  .enablePlugins(macroparadise.sbt.MacroParadisePrecompiledPlugin)
  .settings(
    macroParadiseCompilerProductVersion := "0.1.1",
    macroParadiseMarkerModules := Seq(
      //("com.example" % "my-macro-annotations" % "1.0.0").cross(CrossVersion.full),
      (("com.example" % "my-macro-annotations" % "1.0.0").cross(CrossVersion.full)) % Provided,
      //...
    ),
    macroParadiseHandlerModules := Seq(
      ("com.example" % "my-macro-handlers" % "1.0.0").cross(CrossVersion.full),
      //...
    )
  )
```

# What sbt plugin actually does (annotations and handlers not published)

- `project/build.properties`:

```
sbt.version=1.12.15
```

- `project/plugins.sbt`:

```scala
addSbtPlugin("com.github.dmytromitin" % "sbt-macroparadise" % "0.1.1")
```

- `build.sbt`:

```scala
import macroparadise.sbt.MacroParadiseIntegration
import macroparadise.sbt.MacroParadisePrecompiledPlugin.autoImport._

ThisBuild / scalaVersion := "3.3.8" // 3.8.4, 3.9.0

lazy val macroAnnotations = (project in file("macro-annotations"))
  .settings(libraryDependencies ++= Seq(
    ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1").cross(CrossVersion.full),
  ))

lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % "0.1.1").cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value,
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

# What sbt plugin actually does (annotations and handlers published)

???

```scala
```

# `@identity` (`Expanded`)

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.IdentityHandler")
class identity extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}

final class IdentityHandler extends ParadiseAnnotationExpander:
  override def annotationName: String = "com.example.macros.annotations.identity"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    ExpansionOutcome.Expanded(List(input.annotatedClass))
    
//enum ExpansionOutcome:
//  case Expanded(trees: List[untpd.Tree])
//  case Structured(output: StructuredExpansionOutput)
//  case Rejected(diagnostics: List[ExpansionDiagnostic], fallback: untpd.TypeDef)
//  case NotApplicable    
```

# `@identity` (`Structured`)

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.IdentityHandler")
class identity extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander, StructuredExpansionOutput}

final class IdentityHandler extends ParadiseAnnotationExpander:
  override def annotationName: String = "com.example.macros.annotations.identity"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    ExpansionOutcome.Structured(StructuredExpansionOutput(
      primary = input.annotatedClass,
      companion = input.existingCompanion, // Option
      additionalTopLevelDefinitions = List(),
    ))
    
//enum ExpansionOutcome:
//  case Expanded(trees: List[untpd.Tree])
//  case Structured(output: StructuredExpansionOutput)
//  case Rejected(diagnostics: List[ExpansionDiagnostic], fallback: untpd.TypeDef)
//  case NotApplicable    
```

# `@identity` (composable helpers)

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.IdentityHandler")
class identity extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}

final class IdentityHandler extends ParadiseAnnotationExpander:
  override def annotationName: String = "com.example.macros.annotations.identity"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    ExpansionEdit.finish(ExpansionEdit.start(input))
    
//  val edited = for
//    edit0 <- ExpansionEdit.start(input)
//    edit1 <- ExpansionHelpers.placeMembersInPrimary(edit0, List(method.tree, method1.tree, method2.tree))
//    edit2 <- ExpansionHelpers.placeMembersInCompanion(edit1, List(method3.tree, method4.tree))
//  yield edit2
//  ExpansionEdit.finish(edited)    
```

# `@gen`

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.example.macros.handlers.GenHandler")
final class gen extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts.Context
import paradise3.api.{ExpansionInput, ExpansionOutcome, ParadiseAnnotationExpander}
import paradise3.api.helpers.ExpansionHelpers

final class GenHandler extends ParadiseAnnotationExpander:
  override def annotationName: String = "com.example.macros.annotations.gen"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionHelpers.addStringMethodToClass(
      input,
      methodName = "generatedHello",
      value = s"Hello, ${input.className}!"
    )
```

```scala
@gen
class World

val greeting: String = new World().generatedHello
```

# `@addFoo`

```scala
lazy val macroHandlers = (project in file("macro-handlers"))
  .settings(
    libraryDependencies ++= Seq(
      ("com.github.dmytromitin" % "macroparadise-scala3-plugin-api" % macroparadiseV).cross(CrossVersion.full),
      "org.scala-lang" %% "scala3-compiler" % scalaVersion.value,
      "org.scalameta" %% "scalameta" % "4.17.3",
      ("com.github.dmytromitin" % "quasiquotes-scala3-dotty-internal" % quasiquotesV).cross(CrossVersion.full),//bridges
    )
  )
```

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
  override def annotationName: String = "com.example.macros.annotations.addFoo"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    // quasiquotes-scala3-dotty-internal
    ScalametaDefinitionGeneratedOriginBridge.lower(q"def foo(x: Int): String = x.toString", "fooFile.scala") match
    //                                             ^^^^^^^   Scalameta quasiquote
      case Right(method) =>
        // macroparadise-scala3-plugin-api
        ExpansionHelpers.placeMembersInCompanion(
          input,
          List(method.tree),
        )

@addFoo
class A

A.foo(10)
```

# `@addFoo`

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
  override def annotationName: String = "com.example.macros.annotations.addFoo"

  override def expand(input: ExpansionInput)(using Contexts.Context): ExpansionOutcome =
    (
      ScalametaDefinitionGeneratedOriginBridge.lower(q"def foo(x: Int): String = ${Term.Name(input.annotatedClass.name.show)}.m(x)", "fooFile.scala"),
      ScalametaDefinitionGeneratedOriginBridge.lower(q"def bar(x: Int): String = x.toString", "barFile.scala"),
      ScalametaDefinitionGeneratedOriginBridge.lower(q"def baz(x: Int): String = bar(x)", "bazFile.scala"),
    ) match
      case (Right(method), Right(method1), Right(method2)) =>
        ExpansionHelpers.placeMembersInPrimary(
          input,
          List(method.tree, method1.tree, method2.tree),
        )

@addFoo
class A
object A:
  def m(x: Int): String = x.toString

A().foo(10)
A().bar(10)
A().baz(10)
```

# `@apply` (type-class materializer)

```scala
@apply
trait Show[A]:
  def show(a: A): String

object Show:
  given Show[String] with
    def show(a: String): String = a
    
  //def apply[A](using inst: Show[A]): Show[A] = inst  // materializer

val stringShow: Show[String] = Show[String]
```

```scala
@apply
trait Add[N <: Nat, M <: Nat]:
  type Out <: Nat
  def apply(n: N, m: M): Out
  
object A:
  // ...
  
  // def apply[N <: Nat, M <: Nat](using inst: Add[N, M]): Add[N, M] { type Out = inst.Out } = inst  // materializer
```

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.github.dmytromitin.auxify.macros.internal.ApplyHandler")
class apply extends StaticAnnotation
```

```scala
import dotty.tools.dotc.core.Contexts.Context

import paradise3.api.{ExpansionCompositionPolicy, ExpansionInput, ExpansionOutcome, ExpansionTargetProfile, ParadiseAnnotationExpander}
import paradise3.api.helpers.{CompanionMethodConflictPolicy, ExpansionHelpers}
import quasiquotes.definitions.dotty.ContextualMethodPeerBridge

final class ApplyHandler extends ParadiseAnnotationExpander:
  override val annotationName: String = "com.github.dmytromitin.auxify.macros.apply"

  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    ExpansionHelpers.withAnnotatedClassView(input): view =>
      view.typeParameters match
        case List(typeParameter) =>
          lowerAndPlace(
            input,
            ApplyDefinitionBuilder.lower(input.className, typeParameter.name)
          )
        //...
```

```scala
  private def lowerAndPlace(input: ExpansionInput, lowered: Either[ContextualMethodPeerBridge.Failure, ContextualMethodPeerBridge.Lowered])(using Context): ExpansionOutcome =
    lowered match
      case Right(value) =>
        ExpansionHelpers.addMethodToCompanion(input, value.tree, CompanionMethodConflictPolicy.PreserveExisting)
      //...  
```

```scala
private[internal] object ApplyDefinitionBuilder:
  def definition(className: String, typeParameterName: String): Defn.Def =
    val classNameTree = Type.Name(className)
    val typeParameterNameTree = Type.Name(typeParameterName)
    val typeParameter = tparam"$typeParameterNameTree"
    val target = t"$classNameTree[$typeParameterNameTree]"
    q"def apply[$typeParameter](using inst: $target): $target = inst"

  def lower(className: String, typeParameterName: String)(using Context): Either[ContextualMethodPeerBridge.Failure, ContextualMethodPeerBridge.Lowered] =
    ContextualMethodPeerBridge.lower(definition(className, typeParameterName), s"...")
```

# `@aux` (type-level programming helper)

```scala
@aux
trait Add[N <: Nat, M <: Nat]:
  type Out <: Nat
  def apply(n: N, m: M): Out
  
object Add:
  // type Aux[N <: Nat, M <: Nat, Out0 <: Nat] = Add[N, M] { type Out = Out0 }  
```

```scala
import paradise3.api.expander
import scala.annotation.StaticAnnotation

@expander("com.github.dmytromitin.auxify.macros.internal.AuxHandler")
class aux extends StaticAnnotation
```

```scala
final class AuxHandler extends ParadiseAnnotationExpander:
  override val annotationName: String = "com.github.dmytromitin.auxify.macros.aux"
  
  override def expand(input: ExpansionInput)(using Context): ExpansionOutcome =
    AuxHandler.expandWithLowering(input): (shape, context) =>
      AuxDefinitionBuilder.lower(shape)(using context)
```

```scala
private[internal] object AuxHandler:
  def expandWithLowering(input: ExpansionInput)(lower: Lowering)(using Context): ExpansionOutcome =
    input.annotatedClassTypeStructureView match
      case Right(structure) =>
        AuxSourceShapeDecoder.decode(input.className, structure) match
          case Right(shape) =>
            lower(shape, summon[Context]) match
              case Right(lowered) =>
                ExpansionHelpers.addTypeToCompanion(input, lowered.tree, CompanionTypeConflictPolicy.PreserveExisting)
      //...                
```

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
    val firstTypeParameter: Type.Param = tparam"$firstTypeParameterName <: $upperBoundTypeName"
    val secondTypeParameter: Type.Param = tparam"$secondTypeParameterName <: $upperBoundTypeName"
    val generatedResultParameter: Type.Param = tparam"$generatedResultParameterName <: $upperBoundTypeName"
    val allTypeParameters = List(firstTypeParameter, secondTypeParameter, generatedResultParameter)
    val targetArguments: List[Type] = List(firstTypeParameterName, secondTypeParameterName)
    val target: Type = t"$typeClassName[..$targetArguments]"
    val resultEquality: Defn.Type = q"type $resultTypeMemberName = $generatedResultParameterName"
    val refinementMembers: List[Stat] = List(resultEquality)
    val refinement: Type = t"$target { ..$refinementMembers }"
    q"type $aliasName[..$allTypeParameters] = $refinement"

  def lower(shape: AuxSourceShapeDecoder.Shape)(using Context): Either[AuxTypeAliasPeerBridge.Failure, AuxTypeAliasPeerBridge.Lowered] =
    val sourceDefinition = definition(shape)
    AuxTypeAliasPeerBridge.lower(
      sourceDefinition,
      expectedAliasName = "Aux",
      expectedFirstParameterName   = shape.firstTypeParameterName,
      expectedFirstUpperBoundName  = shape.upperBoundTypeName,
      expectedSecondParameterName  = shape.secondTypeParameterName,
      expectedSecondUpperBoundName = shape.upperBoundTypeName,
      expectedOutputParameterName  = shape.generatedResultParameterName,
      expectedOutputUpperBoundName = shape.upperBoundTypeName,
      expectedTargetName           = shape.typeClassName,
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
//  def instance[A](emptyValue: => A, combineFunction: (A, A) => A): Monoid[A] =
//    new Monoid[A]:
//      override def empty: A = emptyValue
//      override def combine(a: A, a1: A): A = combineFunction(a, a1)
```

# @delegated (forwarder)

```scala
@delegated
trait Show[A]:
  def show(a: A): String

object Show:
  //def show[A](a: A)(using inst: Show[A]): String = inst.show(a)
```

# `@syntax` (type-class syntax)

```scala
@syntax
trait Monoid[A]:
  def empty: A
  def combine(a: A, a1: A): A

object Monoid:
//  object syntax:
//    extension [A](a: A):
//      def combine(a1: A)(using inst: Monoid[A]): A = inst.combine(a, a1)
```

# `@self` (type-level programming helper)

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

# Re-writing, actual transformations

```scala
// TODO

@addOption
def foo(x: Int): String = rhs
// -->
def foo(x: Int): Option[String] = Option(rhs)
```

# Reminder about Scala semantic harness

https://github.com/DmytroMitin/scala-semantic-harness

Feedback about Scala semantic harness: https://github.com/DmytroMitin/scala-semantic-harness/blob/main/docs/early-feedback.md


# Subscribe to me

https://www.linkedin.com/in/dmitin/

https://github.com/DmytroMitin

https://www.facebook.com/dmitry.mitin

https://x.com/DmytroMitin

https://www.instagram.com/dmytro.mitin/

https://www.threads.com/@dmytro.mitin

https://www.youtube.com/@DmytroMitin

dmitin3@gmail.com

