function randomIndex(maxExclusive) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues && maxExclusive > 0) {
    const range = 0x100000000;
    const limit = range - (range % maxExclusive);
    const value = new Uint32Array(1);

    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);

    return value[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleArray(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}
