function getRandomVariations(variaciones, cantidad) {
    const shuffled = [...variaciones].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, cantidad);
}

export { getRandomVariations };