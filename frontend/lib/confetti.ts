import confetti from "canvas-confetti";

export function fireEcoConfetti() {
  // Eco-themed colors: shades of emerald, forest green, gold, and lime
  const colors = ["#059669", "#10b981", "#34d399", "#f59e0b", "#84cc16"];

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
  });
}

export function fireCelebrationConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    colors: ["#059669", "#10b981", "#3b82f6", "#f59e0b", "#ec4899"],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}
