export function createSplashEffect(button: HTMLElement, color: string, count = 8) {
  const rect = button.getBoundingClientRect();
  const originX = rect.width / 2;
  const originY = rect.height / 2;
  const isMobile = window.innerWidth <= 768;

  for (let i = 0; i < count; i++) {
    const line = document.createElement("div");
    line.className = "splash-line";
    line.style.background = color;

    const angleRad = (i * (360 / count) + (Math.random() * 15 - 7.5)) * (Math.PI / 180);
    const minStartRadius = 10;
    const travelDistance = isMobile ? 30 + Math.random() * 6 : 35 + Math.random() * 5;
    const lineHeight = isMobile ? 5 + Math.random() * 2 : 6 + Math.random() * 2;

    const spawnX = Math.cos(angleRad) * minStartRadius;
    const spawnY = Math.sin(angleRad) * minStartRadius;
    const dx = Math.cos(angleRad) * travelDistance;
    const dy = Math.sin(angleRad) * travelDistance;

    line.style.left = `${originX + spawnX}px`;
    line.style.top = `${originY + spawnY}px`;
    line.style.height = `${lineHeight}px`;

    const rotation = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
    line.style.setProperty("--rotation", `${rotation}deg`);
    line.style.setProperty("--dx", `${dx}px`);
    line.style.setProperty("--dy", `${dy}px`);

    button.appendChild(line);

    const randomDelay = Math.random() * 150;
    setTimeout(() => line.classList.add("animate"), randomDelay);
    setTimeout(() => line.remove(), 500 + randomDelay);
  }
}
