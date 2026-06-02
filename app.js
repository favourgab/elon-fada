/**
 * Elon Musk RewardRush — Spin to Win
 * Set your WhatsApp number (country code, no + or spaces), e.g. "15551234567"
 */
const WHATSAPP_NUMBER = "12268457134";
const BRAND_NAME = "Elon Musk RewardRush";
const STORAGE_KEY = "emrr_win";

const PRIZES = [
  {
    id: "img1",
    name: "TESLA MODEL 3",
    value: "$42,500",
    image: "assets/img1.jpg",
    isRetry: false,
  },
  {
    id: "img2",
    name: "TESLA MODEL Y",
    value: "$49,990",
    image: "assets/img2.jpg",
    isRetry: false,
  },
  {
    id: "img3",
    name: "CYBERTRUCK",
    value: "$79,990",
    image: "assets/img3.jpg",
    isRetry: false,
  },
  {
    id: "img4",
    name: "$50,000 CASH",
    value: "$50,000",
    image: "assets/img4.jpg",
    isRetry: false,
  },
  {
    id: "img5",
    name: "$100,000 CASH",
    value: "$100,000",
    image: "assets/img5.jpg",
    isRetry: false,
  },
  {
    id: "retry",
    name: "TRY AGAIN",
    value: "Better luck next time",
    image: "assets/retry.png",
    isRetry: true,
  },
];

const spinGrid = document.getElementById("spin-grid");
const btnSpin = document.getElementById("btn-spin");
const btnScrollSpin = document.getElementById("btn-scroll-spin");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalCongrats = document.getElementById("modal-congrats");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalValue = document.getElementById("modal-value");
const modalCode = document.getElementById("modal-code");
const modalCodeBlock = document.getElementById("modal-code-block");
const modalClaim = document.getElementById("modal-claim");
const modalRetryMsg = document.getElementById("modal-retry-msg");
const modalRetryBtn = document.getElementById("modal-retry-btn");
const modalSignature = document.getElementById("modal-signature");

let isSpinning = false;
let spinCells = [];
let hasSpunOnce = false;
let confettiFrame = null;

function animateCounter(element, target, suffix = "") {
  let current = 0;
  const increment = target / 100;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 20);
}

function animateMoney(element, target) {
  let current = 0;
  const increment = target / 100;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = "$" + (current / 1000000).toFixed(1) + "M";
  }, 20);
}

window.addEventListener("load", () => {
  const winnerCount = document.getElementById("winnerCount");
  const verifiedCount = document.getElementById("verifiedCount");
  const prizeCount = document.getElementById("prizeCount");

  if (winnerCount) animateCounter(winnerCount, 2400, "+");
  if (verifiedCount) animateCounter(verifiedCount, 100, "%");
  if (prizeCount) animateMoney(prizeCount, 4200000);

  restoreSavedWin();
});

function setSpinBtnLabel(text, spinning = false) {
  btnSpin.innerHTML = `<span class="btn-icon spin-icon" aria-hidden="true">⟳</span> ${text}`;
  btnSpin.classList.toggle("is-spinning", spinning);
}

function resetSpinBtnAfterModal() {
  if (isSpinning) return;

  const saved = loadWin();
  if (saved) {
    btnSpin.disabled = true;
    setSpinBtnLabel("Prize claimed — check WhatsApp");
    return;
  }

  btnSpin.disabled = false;
  setSpinBtnLabel(
    hasSpunOnce ? "Spin again! Elon has more to give away!" : "SPIN NOW"
  );
}

function createPrizeCard(prize, forSpin = false) {
  const card = document.createElement("article");
  card.className = "prize-card" + (prize.isRetry ? " prize-card--retry" : "");
  card.dataset.prizeId = prize.id;

  const imgWrap = document.createElement("div");
  imgWrap.className = "prize-card__img-wrap";

  const img = document.createElement("img");
  img.src = prize.image;
  img.alt = prize.name;
  img.loading = forSpin ? "eager" : "lazy";
  img.onerror = () => {
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      if (/\.jpe?g$/i.test(img.src)) {
        img.src = img.src.replace(/\.jpe?g$/i, ".png");
        return;
      }
      if (/\.png$/i.test(img.src)) {
        img.src = img.src.replace(/\.png$/i, ".jpg");
        return;
      }
    }
    img.style.display = "none";
    imgWrap.style.background = prize.isRetry ? "#1a0a0a" : "#374151";
  };
  imgWrap.appendChild(img);

  const footer = document.createElement("div");
  footer.className = "prize-card__footer";

  const name = document.createElement("p");
  name.className = "prize-card__name";
  name.textContent = prize.name;

  footer.appendChild(name);

  if (!prize.isRetry) {
    const value = document.createElement("p");
    value.className = "prize-card__value";
    value.textContent = prize.value;
    footer.appendChild(value);
  }

  card.appendChild(imgWrap);
  card.appendChild(footer);

  return card;
}

function renderSpinGrid() {
  PRIZES.forEach((prize) => {
    const spinCard = createPrizeCard(prize, true);
    spinGrid.appendChild(spinCard);
    spinCells.push(spinCard);
  });
}

function generateClaimCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "EMRR-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function buildWhatsAppUrl(prize, code) {
  const text = [
    `Hi! I'd like to claim my ${BRAND_NAME} win.`,
    "",
    `Event: ${BRAND_NAME}`,
    `Prize: ${prize.name}`,
    `Value: ${prize.value}`,
    `Claim Code: ${code}`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function saveWin(prize, code) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      prizeId: prize.id,
      name: prize.name,
      value: prize.value,
      image: prize.image,
      code,
      wonAt: Date.now(),
    })
  );
}

function loadWin() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getPrizeById(id) {
  return PRIZES.find((p) => p.id === id) || PRIZES[0];
}

function pickRandomPrize() {
  return PRIZES[Math.floor(Math.random() * PRIZES.length)];
}

function highlightCell(index) {
  spinCells.forEach((cell, i) => {
    cell.classList.toggle("is-active", i === index);
  });
}

function clearHighlights() {
  spinCells.forEach((cell) => {
    cell.classList.remove("is-active", "is-winner");
  });
}

function ensureConfettiCanvas() {
  let canvas = document.getElementById("confetti-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "confetti-canvas";
    canvas.className = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
  }
  return canvas;
}

function stopConfetti() {
  if (confettiFrame) {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = null;
  }
  const canvas = document.getElementById("confetti-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }
}

function launchConfetti() {
  const canvas = ensureConfettiCanvas();
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const colors = ["#facc15", "#fde047", "#ffffff", "#ef4444", "#22c55e", "#3b82f6"];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    spin: (Math.random() - 0.5) * 12,
    speedY: 2 + Math.random() * 4,
    speedX: (Math.random() - 0.5) * 3,
    opacity: 1,
  }));

  let frame = 0;
  const maxFrames = 180;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.spin;
      if (frame > maxFrames - 40) {
        p.opacity = Math.max(0, p.opacity - 0.025);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < maxFrames) {
      confettiFrame = requestAnimationFrame(draw);
    } else {
      stopConfetti();
    }
  }

  stopConfetti();
  draw();
}

function showModal(prize, code, { withConfetti = false } = {}) {
  modalImg.src = prize.image;
  modalImg.alt = prize.name;
  modalTitle.textContent = prize.name;
  modalValue.textContent = prize.value;

  if (prize.isRetry) {
    stopConfetti();
    modalCongrats.hidden = true;
    modalSignature.hidden = true;
    modalRetryMsg.hidden = false;
    modalCodeBlock.hidden = true;
    modalClaim.hidden = true;
    modalRetryBtn.hidden = false;
    modalValue.hidden = true;
  } else {
    modalCongrats.hidden = false;
    modalSignature.hidden = false;
    modalRetryMsg.hidden = true;
    modalCodeBlock.hidden = false;
    modalClaim.hidden = false;
    modalRetryBtn.hidden = true;
    modalValue.hidden = false;
    modalCode.textContent = code;
    modalClaim.href = buildWhatsAppUrl(prize, code);
    if (withConfetti) launchConfetti();
  }

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function hideModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";
  stopConfetti();
  resetSpinBtnAfterModal();
}

function restoreSavedWin() {
  const saved = loadWin();
  if (!saved) return;

  const prize = getPrizeById(saved.prizeId);
  const idx = PRIZES.findIndex((p) => p.id === saved.prizeId);
  if (idx >= 0) spinCells[idx]?.classList.add("is-winner");

  hasSpunOnce = true;
  btnSpin.disabled = true;
  setSpinBtnLabel("Prize claimed — check WhatsApp");
  showModal(
    { ...prize, image: saved.image || prize.image },
    saved.code,
    { withConfetti: false }
  );
}

function runSpinAnimation(targetIndex) {
  return new Promise((resolve) => {
    const totalSteps = 28 + targetIndex;
    let step = 0;
    let speed = 55;

    function tick() {
      highlightCell(step % PRIZES.length);
      step++;

      if (step >= totalSteps) {
        highlightCell(targetIndex);
        spinCells[targetIndex]?.classList.add("is-winner");
        setTimeout(resolve, 400);
        return;
      }

      if (step > totalSteps - 8) speed += 18;
      setTimeout(tick, speed);
    }

    tick();
  });
}

async function handleSpin() {
  if (isSpinning || btnSpin.disabled) return;
  if (loadWin()) {
    restoreSavedWin();
    return;
  }

  isSpinning = true;
  btnSpin.disabled = true;
  setSpinBtnLabel("Arrow is turning", true);
  clearHighlights();

  const winner = pickRandomPrize();
  const targetIndex = PRIZES.findIndex((p) => p.id === winner.id);
  const code = winner.isRetry ? null : generateClaimCode();

  await runSpinAnimation(targetIndex);

  hasSpunOnce = true;
  btnSpin.classList.remove("is-spinning");

  if (winner.isRetry) {
    isSpinning = false;
    btnSpin.disabled = false;
    setSpinBtnLabel("Spin again! Elon has more to give away!");
    showModal(winner, null);
    return;
  }

  saveWin(winner, code);
  isSpinning = false;
  btnSpin.disabled = true;
  setSpinBtnLabel("Prize claimed — check WhatsApp");
  showModal(winner, code, { withConfetti: true });
}

function init() {
  renderSpinGrid();
  setSpinBtnLabel("SPIN NOW");

  btnSpin?.addEventListener("click", handleSpin);

  btnScrollSpin?.addEventListener("click", () => {
    document.getElementById("spin-section")?.scrollIntoView({ behavior: "smooth" });
  });

  modalClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideModal();
  });

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) hideModal();
  });

  modalRetryBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    hideModal();
    clearHighlights();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay && !modalOverlay.hidden) hideModal();
  });
}

init();
