import { characterEntities as namedEntities } from 'character-entities'

export function decodeNamedCharacterReference(value: string): string | false {
  if (!value) return false
  if (value[0] === '#') {
    const isHex = value[1]?.toLowerCase() === 'x'
    const numeric = Number.parseInt(isHex ? value.slice(2) : value.slice(1), isHex ? 16 : 10)
    if (Number.isNaN(numeric)) return false
    return String.fromCodePoint(numeric)
  }
  return namedEntities[value] ?? false
}
