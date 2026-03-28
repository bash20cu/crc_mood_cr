import type { Trend } from "@lib/exchange-rate";

type HeroSceneOptions = {
  canvas: HTMLCanvasElement;
  trend: Trend;
  intensity?: "mild" | "wild";
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  symbol: string;
  rotation: number;
};

type Theme = (typeof palette)[Trend];

const palette = {
  up: {
    body: "#ffcd5a",
    accent: "#ff6f59",
    glow: "rgba(255, 111, 89, 0.28)",
  },
  down: {
    body: "#7fe0b7",
    accent: "#1aa1a1",
    glow: "rgba(127, 224, 183, 0.24)",
  },
  stable: {
    body: "#8fd8ff",
    accent: "#5b6ee1",
    glow: "rgba(91, 110, 225, 0.2)",
  },
} as const;

export function createHeroScene({ canvas, trend, intensity = "mild" }: HeroSceneOptions) {
  const context = canvas.getContext("2d");

  if (!context) {
    return () => undefined;
  }

  const particles = Array.from({ length: 14 }, (_, index) => {
    const symbols = trend === "down" ? ["₡", "✦", "☀"] : trend === "up" ? ["$", "!", "↗"] : ["•", "…", "↔"];

    return {
      x: 40 + index * 36,
      y: 70 + (index % 4) * 34,
      size: 16 + (index % 3) * 4,
      speed: 0.4 + (index % 4) * 0.08,
      drift: index % 2 === 0 ? 1 : -1,
      symbol: symbols[index % symbols.length],
      rotation: index * 0.3,
    };
  });

  let animationFrame = 0;
  let frameId = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(bounds.width * dpr);
    canvas.height = Math.round(bounds.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // El loop principal limpia el canvas, pinta el escenario y luego
  // vuelve a dibujar la mascota frame por frame para darle personalidad.
  const render = () => {
    animationFrame += 1;
    context.clearRect(0, 0, width, height);

    const theme = palette[trend];
    const centerX = width * 0.5;
    const centerY = height * 0.56;
    const intensityBoost = intensity === "wild" ? 1.85 : 1;
    const idleSway = Math.sin(animationFrame * 0.03) * 6;
    const shakeX =
      trend === "up"
        ? Math.sin(animationFrame * 0.58) * 5 * intensityBoost
        : idleSway * 0.4;
    const shakeY =
      trend === "up"
        ? Math.cos(animationFrame * 0.52) * 4 * intensityBoost
        : Math.cos(animationFrame * 0.03) * 1.8;
    const bounce =
      Math.sin(animationFrame * 0.05) * 10 * (trend === "down" ? 1.2 : 1) +
      Math.sin(animationFrame * 0.025) * 4;
    const squish = 1 + Math.sin(animationFrame * 0.05) * 0.02 * intensityBoost;

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#fff7ec");
    gradient.addColorStop(1, "#ffe7d0");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    drawSceneBackground(context, width, height, trend, animationFrame);
    drawGroundShadow(context, centerX, centerY, theme);

    context.save();
    context.translate(centerX + shakeX, centerY + bounce + shakeY);
    context.rotate(idleSway * 0.005);
    context.scale(1, squish);

    drawMascotBody(context, theme);
    drawArmsAndLegs(context, trend, animationFrame, theme, intensity);
    drawFace(context, trend, animationFrame, intensity);
    drawExtras(context, trend, animationFrame, theme, intensity);
    context.restore();

    drawParticles(context, particles, animationFrame, width, height, trend, intensity);
    frameId = window.requestAnimationFrame(render);
  };

  resize();
  render();

  const resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(canvas);

  return () => {
    window.cancelAnimationFrame(frameId);
    resizeObserver.disconnect();
  };
}

function drawSceneBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  trend: Trend,
  frame: number,
) {
  context.save();
  context.fillStyle = "rgba(255,255,255,0.45)";

  for (let index = 0; index < 5; index += 1) {
    const offset = Math.sin(frame * 0.01 + index) * 8;
    context.beginPath();
    context.ellipse(90 + index * 120, 60 + offset, 36, 16, 0, 0, Math.PI * 2);
    context.fill();
  }

  if (trend === "down") {
    context.fillStyle = "rgba(255, 216, 94, 0.7)";
    context.beginPath();
    context.arc(width - 74, 68, 28, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawGroundShadow(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  theme: Theme,
) {
  context.save();
  context.fillStyle = theme.glow;
  context.beginPath();
  context.ellipse(centerX, centerY + 36, 128, 72, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawMascotBody(context: CanvasRenderingContext2D, theme: Theme) {
  context.fillStyle = theme.body;
  context.beginPath();
  context.ellipse(0, 0, 100, 84, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(255,255,255,0.35)";
  context.beginPath();
  context.ellipse(-22, -24, 28, 18, -0.5, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(31, 41, 55, 0.2)";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 42, Math.PI * 0.1, Math.PI * 1.9);
  context.stroke();
}

function drawArmsAndLegs(
  context: CanvasRenderingContext2D,
  trend: Trend,
  frame: number,
  theme: Theme,
  intensity: "mild" | "wild",
) {
  const limbSwing = Math.sin(frame * 0.08) * (intensity === "wild" ? 18 : 10);
  const idleReach = Math.sin(frame * 0.04) * 10;

  context.save();
  context.strokeStyle = "#1f2937";
  context.lineWidth = 8;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(-66, 14);
  context.quadraticCurveTo(-112, trend === "up" ? -16 : 24, -118 - idleReach * 0.4, trend === "up" ? -66 : 32);
  context.stroke();

  context.beginPath();
  context.moveTo(66, 14);
  context.quadraticCurveTo(112, trend === "down" ? 36 : 4, 118 + idleReach * 0.4, trend === "down" ? 18 : -42);
  context.stroke();

  context.beginPath();
  context.moveTo(-34, 78);
  context.quadraticCurveTo(-40, 108, -58, 126 + limbSwing * 0.12);
  context.stroke();

  context.beginPath();
  context.moveTo(34, 78);
  context.quadraticCurveTo(42, 108, 62, 124 - limbSwing * 0.12);
  context.stroke();

  context.fillStyle = theme.accent;
  context.beginPath();
  context.arc(-118, trend === "up" ? -66 : 32, 10, 0, Math.PI * 2);
  context.arc(118, trend === "down" ? 18 : -42, 10, 0, Math.PI * 2);
  context.arc(-58, 126 + limbSwing * 0.12, 10, 0, Math.PI * 2);
  context.arc(62, 124 - limbSwing * 0.12, 10, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawFace(
  context: CanvasRenderingContext2D,
  trend: Trend,
  frame: number,
  intensity: "mild" | "wild",
) {
  const blink = Math.abs(Math.sin(frame * 0.055)) < 0.09 ? 0.1 : 1;
  const eyeTilt = trend === "up" ? -0.16 : trend === "down" ? 0.12 : 0;
  const tremble = trend === "up" && intensity === "wild" ? Math.sin(frame * 0.8) * 4 : 0;
  const pupilLift = trend === "down" ? Math.sin(frame * 0.04) * 1.5 : 0;

  context.save();
  context.fillStyle = "#1f2937";

  context.beginPath();
  context.ellipse(-30 - tremble, -8, 11, 12 * blink, eyeTilt, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.ellipse(30 + tremble, -8, 11, 12 * blink, -eyeTilt, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.ellipse(-27 - tremble, -12 - pupilLift, 3, 3, 0, 0, Math.PI * 2);
  context.ellipse(33 + tremble, -12 - pupilLift, 3, 3, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#1f2937";
  context.lineWidth = 6;
  context.lineCap = "round";

  context.beginPath();
  context.moveTo(-46, -32);
  context.lineTo(-12, trend === "up" ? -40 : trend === "down" ? -26 : -34);
  context.moveTo(12, trend === "up" ? -40 : trend === "down" ? -26 : -34);
  context.lineTo(46, -32);
  context.stroke();

  context.beginPath();
  if (trend === "up") {
    context.arc(0, 26, 26, 0.12, Math.PI - 0.12, false);
  } else if (trend === "down") {
    context.arc(0, 14, 22, 0.15, Math.PI - 0.15, false);
  } else {
    context.moveTo(-22, 26);
    context.lineTo(22, 26);
  }
  context.stroke();
  context.restore();
}

function drawExtras(
  context: CanvasRenderingContext2D,
  trend: Trend,
  frame: number,
  theme: Theme,
  intensity: "mild" | "wild",
) {
  context.save();
  context.strokeStyle = theme.accent;
  context.fillStyle = theme.accent;
  context.lineWidth = 4;

  if (trend === "up") {
    // Arriba: demasiado drama. Le ponemos sudor, rayas de panico
    // y una barra con flecha para que se sienta "full gym mode".
    for (const x of [-72, -56, 56, 72]) {
      context.beginPath();
      context.moveTo(x, -48);
      context.lineTo(x + Math.sin(frame * 0.14) * 8, -86);
      context.stroke();
    }

    const sweatDrops = intensity === "wild" ? 4 : 2;
    for (let index = 0; index < sweatDrops; index += 1) {
      const dripOffset = Math.sin(frame * 0.08 + index) * 10;
      context.beginPath();
      context.ellipse(42 + index * 18, 12 + index * 12 + dripOffset, 7, 14, -0.2, 0, Math.PI * 2);
      context.fill();
    }

    context.strokeStyle = "#1f2937";
    context.lineWidth = 10;
    context.beginPath();
    context.moveTo(-74, -82);
    context.lineTo(76, -82);
    context.stroke();

    context.fillStyle = theme.accent;
    context.fillRect(-100, -94, 24, 24);
    context.fillRect(76, -94, 24, 24);

    const arrowOffset = Math.sin(frame * 0.2) * (intensity === "wild" ? 16 : 8);
    context.beginPath();
    context.moveTo(54 + arrowOffset, -122);
    context.lineTo(104 + arrowOffset, -82);
    context.lineTo(54 + arrowOffset, -42);
    context.closePath();
    context.fill();
  }

  if (trend === "down") {
    context.fillStyle = "#1f2937";
    context.fillRect(-44, -20, 88, 8);
    context.fillRect(-26, -38, 52, 18);

    context.strokeStyle = "#ff8a65";
    context.lineWidth = 8;
    context.beginPath();
    context.arc(0, 18, 60, 0.1, Math.PI - 0.1);
    context.stroke();

    for (let index = 0; index < 8; index += 1) {
      const angle = index * (Math.PI / 4) + frame * 0.03;
      const confettiX = Math.cos(angle) * 118;
      const confettiY = -24 + Math.sin(angle) * 32;

      context.fillStyle = index % 2 === 0 ? "#ff6f59" : "#ffd85e";
      context.save();
      context.translate(confettiX, confettiY);
      context.rotate(angle);
      context.fillRect(-4, -8, 8, 16);
      context.restore();
    }
  }

  if (trend === "stable") {
    context.fillStyle = "#7b4f2a";
    context.fillRect(76, 8, 22, 30);
    context.strokeStyle = "#7b4f2a";
    context.beginPath();
    context.arc(98, 22, 10, -Math.PI * 0.35, Math.PI * 0.35);
    context.stroke();

    context.strokeStyle = theme.accent;
    context.beginPath();
    context.moveTo(-54, -34);
    context.lineTo(-76, -40 - Math.sin(frame * 0.07) * 6);
    context.stroke();

    context.beginPath();
    context.moveTo(54, -34);
    context.lineTo(76, -40 + Math.sin(frame * 0.07) * 6);
    context.stroke();

    context.fillStyle = "rgba(91, 110, 225, 0.16)";
    context.beginPath();
    context.arc(-88, -6 + Math.sin(frame * 0.04) * 3, 11, 0, Math.PI * 2);
    context.arc(-108, 8 + Math.cos(frame * 0.05) * 3, 8, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  frame: number,
  width: number,
  height: number,
  trend: Trend,
  intensity: "mild" | "wild",
) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";

  particles.forEach((particle, index) => {
    const x = (particle.x + frame * particle.speed * particle.drift + width) % width;
    const y = particle.y + Math.sin(frame * 0.02 + index) * 18 + ((index * 23) % 60);
    const opacity = trend === "up" ? 0.72 : trend === "down" ? 0.58 : 0.4;
    const speedBoost = intensity === "wild" ? 1.5 : 1;
    const sizeBoost = trend === "down" ? 1.15 : trend === "stable" ? 0.9 : 1;

    context.save();
    context.translate(x, y % height);
    context.rotate(particle.rotation + frame * 0.01 * particle.drift * speedBoost);
    context.fillStyle = `rgba(31, 41, 55, ${opacity})`;
    context.font = `${particle.size * sizeBoost}px sans-serif`;
    context.fillText(particle.symbol, 0, 0);
    context.restore();
  });

  context.restore();
}
