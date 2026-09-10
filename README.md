# Can Scala 3 Have Macro Annotations Again? Rebuilding Macro Paradise

Text: [MD](draft/draft_v8.md)

Slides: [PDF](macroparadise-talk-09-2026-literal-v8.pdf)

QR Code to this repo: [PNG](qr.png)

Meetup: https://www.meetup.com/london-scala/events/316153466/

Live stream: https://3ds.zoom.us/j/85822609353?pwd=Lrv4H5qEJQkCr6rJf1YzwZKdg95VJc.1

Repositories:

- https://github.com/DmytroMitin/macroparadise-scala3

- https://github.com/DmytroMitin/quasiquotes-scala3

- https://github.com/DmytroMitin/AUXify-scala3

- https://github.com/DmytroMitin/AUXify (Scala 2)

- https://github.com/DmytroMitin/scala-semantic-harness

Starters:

- `sbt new DmytroMitin/macroparadise-scala3.g8`

   - https://github.com/DmytroMitin/macroparadise-scala3.g8

- `sbt new DmytroMitin/quasiquotes-scala3.g8` 

   - https://github.com/DmytroMitin/quasiquotes-scala3.g8

- `sbt new DmytroMitin/AUXify-scala3.g8` 

   - https://github.com/DmytroMitin/AUXify-scala3.g8

> Scala 2's Macro Paradise allowed annotations to transform definitions and generate members, companions and other definitions before ordinary typechecking. Scala 3 has an experimental macro-annotation API, but newly generated definitions are visible only within the macro expansion.
>
> In this talk, we'll connect Scala 2 def macros and quasiquotes to Scala 3's
> quotes, reflection, and experimental `MacroAnnotation`; identify the standard
> visibility boundary for newly generated API names; and explore a pre-typer
> Macro-Paradise design with Quasiquotes and AUXify as the authoring and downstream
> proof layers.

![flyer](event-flyer.jpg)
