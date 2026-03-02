export function getCardImage(cardTypeId: number, colorId: number): string {
  const type = cardTypeId === 1 ? "card" : cardTypeId === 2 ? "tag" : "card"

  if (colorId === 1) return `/images/${type}Black.png`
  if (colorId === 2) return `/images/${type}White.png`
  return `/images/${type}MultiColor.png`
}
