import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const required = [
  'slides.md',
  'styles/index.css',
  'docs/content-coverage.md',
  'docs/rehearsal-routes.md',
  'reviews/001_chatgpt_task001_deep_technical_deck_v1_handoff/README.md',
  'draft/london_scala_emblem_400x400.jpg',
  'draft/stackoverflow.png',
]

const missing = required.filter(file => !fs.existsSync(path.join(root, file)))
if (missing.length) throw new Error(`missing required files: ${missing.join(', ')}`)

const slides = fs.readFileSync(path.join(root, 'slides.md'), 'utf8')
const identifiers = [...slides.matchAll(/<!-- id: ([MOB]\d{2}) \| route: (MAIN|OPTIONAL-IN-FLOW|BACKUP)/g)]
const counts = identifiers.reduce((acc, match) => {
  acc[match[2]] = (acc[match[2]] ?? 0) + 1
  return acc
}, {})

const duplicateIds = identifiers
  .map(match => match[1])
  .filter((id, index, all) => all.indexOf(id) !== index)
if (duplicateIds.length) throw new Error(`duplicate slide identifiers: ${[...new Set(duplicateIds)].join(', ')}`)

for (const [route, minimum] of [['MAIN', 70], ['OPTIONAL-IN-FLOW', 14], ['BACKUP', 30]]) {
  if ((counts[route] ?? 0) < minimum) {
    throw new Error(`${route} count ${counts[route] ?? 0} is below required minimum ${minimum}`)
  }
}

const requiredText = [
  'Scala Semantic Harness',
  'skills/semantic-scala/SKILL.md',
  '@addFoo',
  'A.foo(10)',
  'Apply(Select(left, "+"), List(right))',
  'c.parse(s"$left + $right")',
  'q"$left + $right"',
  'pluginsEnterStats',
  'MacroAnnotation',
  'StandardPlugin',
  'ResearchPlugin',
  'ExprImpl',
  'quotes.reflect.Term',
  'tpd.Tree',
  'untpd.Tree',
  'U-D',
  'U-U',
  'ExpansionHandler',
  'ExpansionEdit.start',
  'MissingCompanionPolicy.Create',
  'MacroParadiseIntegration.precompiledProjects',
  'macroParadiseMarkerModules',
  'macroParadiseHandlerModules',
  '@instance',
  '@delegated',
  '@syntax',
  '@poly',
  'SomeFutureSuperParadiseAnnotationExpander',
]

const absent = requiredText.filter(text => !slides.includes(text))
if (absent.length) throw new Error(`required deck content absent: ${absent.join(', ')}`)

const localLinks = [...slides.matchAll(/(?:src=|\]\()["']?(\.\/draft\/[^"')\s>]+)/g)]
  .map(match => match[1])
for (const relative of localLinks) {
  if (!fs.existsSync(path.resolve(root, relative))) throw new Error(`broken local asset: ${relative}`)
}

console.log(`verified slide source: MAIN=${counts.MAIN}, OPTIONAL-IN-FLOW=${counts['OPTIONAL-IN-FLOW']}, BACKUP=${counts.BACKUP}`)
