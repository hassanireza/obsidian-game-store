const ARCANA = [
  {
    id: 0, name: "The Fool", roman: "0", path: "light",
    archetype: "THE WANDERER // BEGINNER'S MIND",
    glow: "rgba(180,79,255,0.4)",
    oracle: "You stand at the precipice, choom. The city stretches before you like a circuit board: infinite paths, infinite endings. The Fool doesn't fear the fall because the fall is the journey. Every flatline you've cheated, every corpo you've dodged. That's the Fool's luck keeping you breathing. Step off the edge. The net will catch you, or it won't.",
    upright: "New beginnings, spontaneity, freedom, leaping into the unknown with fearless trust.",
    reversed: "Recklessness, poor judgment, naivety weaponized against you, chaos without purpose.",
    keywords: ["FREEDOM", "CHAOS", "TRUST", "BEGINNING", "RISK"]
  },
  {
    id: 1, name: "The Magician", roman: "I", path: "power",
    archetype: "THE TECHNOMANCER // WILL MADE REAL",
    glow: "rgba(255,200,50,0.4)",
    oracle: "The Magician has all the tools: chrome arms, neural lace, a deck of tricks sharp enough to cut through corpo firewalls. But tools are nothing without will. You have what it takes to manifest anything. The question isn't capability, it's intention. What are you actually building here? Legacy or just noise?",
    upright: "Willpower, skill, manifestation, resourcefulness, mastery of available tools.",
    reversed: "Manipulation, cunning without ethics, untapped potential, deception turned inward.",
    keywords: ["MASTERY", "WILL", "SKILL", "CREATION", "POWER"]
  },
  {
    id: 2, name: "The High Priestess", roman: "II", path: "shadow",
    archetype: "THE ORACLE // HIDDEN DATA STREAM",
    glow: "rgba(68,136,255,0.5)",
    oracle: "She sits between two pillars: the visible net and the dark web beneath it. The High Priestess knows things she refuses to say out loud. The data flows through her like a current and she interprets it in silence. You already know the answer you're seeking. Stop flooding your neural interface with noise and let the quiet transmission reach you.",
    upright: "Intuition, sacred knowledge, divine feminine, the subconscious, mystery held in stillness.",
    reversed: "Secrets weaponized, hidden agendas, disconnection from inner knowing, information suppressed.",
    keywords: ["MYSTERY", "INTUITION", "SILENCE", "WISDOM", "HIDDEN"]
  },
  {
    id: 3, name: "The Empress", roman: "III", path: "light",
    archetype: "THE CREATOR // LIFE FORCE PROTOCOL",
    glow: "rgba(255,68,187,0.4)",
    oracle: "In a city of chrome and concrete, she makes things grow. The Empress doesn't conquer; she cultivates. Every fractured connection you've made, every relationship that survived the carnage of Night City: those are her gardens. She asks: what are you nurturing? What are you allowing to die from neglect? Nature always finds a way. So do you.",
    upright: "Abundance, fertility, creativity, nature, nurturing, luxury, beauty flourishing.",
    reversed: "Dependence on others, creative block, smothering, neglect, abundance withheld.",
    keywords: ["ABUNDANCE", "CREATION", "NATURE", "GROWTH", "BEAUTY"]
  },
  {
    id: 4, name: "The Emperor", roman: "IV", path: "power",
    archetype: "THE CORP KING // ORDER PROTOCOL",
    glow: "rgba(255,34,68,0.5)",
    oracle: "He built the throne and sits on it like gravity itself: immovable, structural, his will encoded into the architecture of the city. The Emperor doesn't ask for loyalty. He creates systems so airtight that loyalty becomes survival. Is the structure around you protecting you or containing you? There's a difference, and it matters which side of the desk you're sitting on.",
    upright: "Authority, structure, stability, leadership, fatherly protection, established power.",
    reversed: "Domination, rigidity, excessive control, tyranny, abuse of authority.",
    keywords: ["AUTHORITY", "STRUCTURE", "CONTROL", "POWER", "ORDER"]
  },
  {
    id: 5, name: "The Hierophant", roman: "V", path: "light",
    archetype: "THE TRADITION KEEPER // LEGACY CODE",
    glow: "rgba(200,168,75,0.5)",
    oracle: "Some say tradition is a cage. Others say it's a cathedral. The Hierophant holds the old keys: rituals, codes, unspoken agreements that have survived generations of night cycles and corpo wars. There's something worth preserving in the old ways, even in a world of perpetual upgrade. Which values have you kept beneath all the chrome? They still matter.",
    upright: "Tradition, conformity, morality, institutions, mentorship, established spiritual authority.",
    reversed: "Rebellion against rules, subversion, personal belief over dogma, challenging norms.",
    keywords: ["TRADITION", "INSTITUTION", "GUIDANCE", "CONFORMITY", "RITUAL"]
  },
  {
    id: 6, name: "The Lovers", roman: "VI", path: "light",
    archetype: "THE ALIGNMENT // HEART SIGNAL",
    glow: "rgba(255,100,150,0.5)",
    oracle: "This isn't just about who you love; it's about what you choose. The Lovers card is a crossroads disguised as a romance. Every bond you form is a mirror showing you who you are when the tactical calculations stop. The city doesn't believe in unconditional. But somewhere in your netrunner's brain there's a code you won't compromise. Choose from that place.",
    upright: "Love, harmony, relationships, values alignment, choices made from the heart.",
    reversed: "Disharmony, imbalance, misalignment of values, one-sided relationships, bad choices.",
    keywords: ["LOVE", "ALIGNMENT", "CHOICE", "UNION", "HARMONY"]
  },
  {
    id: 7, name: "The Chariot", roman: "VII", path: "power",
    archetype: "THE DRIVER // VICTORY VECTOR",
    glow: "rgba(0,200,255,0.4)",
    oracle: "Two forces pulling in opposite directions and you're holding the reins with white-knuckled chrome. The Chariot doesn't move by force alone; it moves by will, by sheer refusal to be pulled apart. You've been at war with yourself and with Night City simultaneously. Stop negotiating. Decide the direction and drive. The road opens for those who commit.",
    upright: "Control, willpower, success, determination, victory through discipline and focus.",
    reversed: "Lack of control, opposition, aggression without direction, scattered energy.",
    keywords: ["VICTORY", "CONTROL", "WILLPOWER", "DRIVE", "DISCIPLINE"]
  },
  {
    id: 8, name: "Strength", roman: "VIII", path: "light",
    archetype: "THE UNBREAKABLE // CORE INTEGRITY",
    glow: "rgba(255,150,50,0.4)",
    oracle: "Not the strength of a Gorilla Arm overhand or a Mantis Blade through corpo armor. Strength here is the quiet kind: the kind that looks a beast in the eye and doesn't blink, doesn't fight, just breathes. You've endured things that would have flatlined anyone else. That's not luck. That's something deeper in your construct. Don't mistake gentleness for weakness.",
    upright: "Courage, patience, compassion, inner strength, taming impulses with grace.",
    reversed: "Self-doubt, raw emotion, inner turmoil, weakness disguised as strength.",
    keywords: ["COURAGE", "PATIENCE", "COMPASSION", "ENDURANCE", "GRACE"]
  },
  {
    id: 9, name: "The Hermit", roman: "IX", path: "shadow",
    archetype: "THE ISOLATED // SIGNAL IN THE DARK",
    glow: "rgba(150,200,255,0.3)",
    oracle: "The Hermit climbs higher not to escape but to see. Up here, above the neon smog and corpo noise, there's something like clarity. You've been moving too fast through a city designed to keep you moving. The lantern the Hermit holds isn't illuminating the path ahead; it's illuminating what you've been carrying all along. Slow down. Look at what's in your hands.",
    upright: "Soul-searching, introspection, being alone by choice, inner guidance, withdrawal.",
    reversed: "Isolation as prison, loneliness, paranoia, withdrawal that becomes disconnection.",
    keywords: ["SOLITUDE", "INTROSPECTION", "WISDOM", "GUIDANCE", "WITHDRAWAL"]
  },
  {
    id: 10, name: "Wheel of Fortune", roman: "X", path: "light",
    archetype: "THE CYCLE // FATE ALGORITHM",
    glow: "rgba(200,168,75,0.4)",
    oracle: "The wheel doesn't care about your reputation, your eddies, or your body count. It turns. That's all it does. But here's the secret the corps don't want you to know: you're not just a passenger on the wheel. You're also the axle. Change from within: your values, your decisions, your neural patterns, and the wheel starts turning differently. Luck isn't random. It's resonance.",
    upright: "Good luck, karma, life cycles, destiny at a turning point, favorable timing.",
    reversed: "Bad luck, resistance to change, breaking cycles, clinging to what must end.",
    keywords: ["FATE", "CYCLES", "LUCK", "TURNING POINT", "KARMA"]
  },
  {
    id: 11, name: "Justice", roman: "XI", path: "shadow",
    archetype: "THE BALANCE // TRUTH PROTOCOL",
    glow: "rgba(200,168,75,0.5)",
    oracle: "In Night City, justice is a luxury item. But the card doesn't care about the city's laws; it holds a deeper ledger. Every cause you've set in motion is already generating its effect somewhere in the system. Justice here isn't punishment. It's consequence recognized. Are you seeing your situation clearly, without the distortion of what you wish were true? Truth cuts both ways.",
    upright: "Justice, fairness, truth, cause and effect, law, objectivity, accountability.",
    reversed: "Unfairness, dishonesty, corrupt systems, refusing accountability, imbalance.",
    keywords: ["JUSTICE", "TRUTH", "FAIRNESS", "BALANCE", "CAUSE"]
  },
  {
    id: 12, name: "The Hanged Man", roman: "XII", path: "shadow",
    archetype: "THE SUSPENDED // WAITING PROTOCOL",
    glow: "rgba(100,200,255,0.3)",
    oracle: "He's not stuck. He chose this. The Hanged Man is suspended between worlds: between who he was and who he's becoming. He's looking at everything from upside down because that's the only way to see what's been invisible. Your situation isn't moving because it's not supposed to yet. This pause is processing. What are you seeing differently from this angle?",
    upright: "Pause, surrender, letting go, new perspectives, sacrifice for enlightenment.",
    reversed: "Delays, resistance to sacrifice, stalling, martyrdom without transformation.",
    keywords: ["SURRENDER", "PAUSE", "PERSPECTIVE", "SACRIFICE", "WAITING"]
  },
  {
    id: 13, name: "Death", roman: "XIII", path: "shadow",
    archetype: "THE ENDING // TRANSFORMATION ENGINE",
    glow: "rgba(150,50,200,0.5)",
    oracle: "Not flatline. Never just flatline. Death in the arcana is the great transformer: it walks through the door and something that was no longer is, and something that couldn't exist before now can. What version of yourself is being dismantled right now? That identity you've been clinging to: the old name, the old story. It's already gone. You're just watching the corpse. Walk away from it.",
    upright: "Endings that are necessary, transformation, transition, new beginnings born of death.",
    reversed: "Resistance to change, inability to move on, stagnation, clinging to what's dead.",
    keywords: ["TRANSFORMATION", "ENDING", "RELEASE", "CHANGE", "REBIRTH"]
  },
  {
    id: 14, name: "Temperance", roman: "XIV", path: "light",
    archetype: "THE ALCHEMIST // BALANCE SYNTHESIS",
    glow: "rgba(100,255,200,0.3)",
    oracle: "Pour between the cups: this world to that world, hot to cold, chrome to flesh. Temperance isn't moderation for its own sake. It's alchemy. The angel blends opposites until something new and impossible emerges. You've been treating your contradictions as problems. They're actually the raw materials. The synthesis of all your broken pieces is where your actual power lives.",
    upright: "Balance, moderation, patience, purpose, synthesis, finding the middle path.",
    reversed: "Imbalance, excess, lack of long-term vision, extremes without integration.",
    keywords: ["BALANCE", "ALCHEMY", "PATIENCE", "SYNTHESIS", "MODERATION"]
  },
  {
    id: 15, name: "The Devil", roman: "XV", path: "shadow",
    archetype: "THE ENSLAVER // ADDICTION PROTOCOL",
    glow: "rgba(255,50,50,0.5)",
    oracle: "Look at the chains. Now look closer: they're loose. They always were. The Devil doesn't lock the cage. You lock it. The addiction, the toxic pattern, the corpo contract you know is killing you. These are chains you can remove. The Devil's power is the belief that you can't. Night City was built to make you need things you don't actually need. What belief is your cage?",
    upright: "Bondage, addiction, materialism, shadow self, sexuality, seduction of the harmful.",
    reversed: "Releasing limiting beliefs, breaking free, reclaiming power, detachment from addiction.",
    keywords: ["BONDAGE", "SHADOW", "ADDICTION", "MATERIALISM", "POWER"]
  },
  {
    id: 16, name: "The Tower", roman: "XVI", path: "shadow",
    archetype: "THE COLLAPSE // SYSTEM CRASH",
    glow: "rgba(255,100,30,0.5)",
    oracle: "Everything you built on a false foundation is coming down. The explosion, the breach, the betrayal: this is what Tower energy feels like when it arrives. And it always arrives. The ground clearing is violent but necessary. When the smoke settles and the servers are fried, the foundation that remains is real. Build on that. Only on that. Nothing else will hold.",
    upright: "Sudden upheaval, chaos, revelation, destruction of the old to make way for truth.",
    reversed: "Averting disaster, fear of change, delaying an inevitable collapse.",
    keywords: ["UPHEAVAL", "COLLAPSE", "REVELATION", "CHAOS", "BREAKTHROUGH"]
  },
  {
    id: 17, name: "The Star", roman: "XVII", path: "light",
    archetype: "THE HOPE SIGNAL // RENEWAL TRANSMISSION",
    glow: "rgba(100,200,255,0.4)",
    oracle: "After the Tower falls, she appears, kneeling at the water's edge under an open sky, pouring hope back into the world without fear of running dry. The Star is the quiet that follows catastrophe. You've been in the dark long enough that you forgot stars were up there. They still are. This card is a frequency; tune into it. Healing isn't passive. It's choosing to believe in something gentle.",
    upright: "Hope, renewal, serenity, inspiration, faith restored, blessings after hardship.",
    reversed: "Hopelessness, despair, faithlessness, disconnection from one's spiritual core.",
    keywords: ["HOPE", "RENEWAL", "FAITH", "HEALING", "INSPIRATION"]
  },
  {
    id: 18, name: "The Moon", roman: "XVIII", path: "shadow",
    archetype: "THE ILLUSION // DEEP SUBCONSCIOUS",
    glow: "rgba(100,80,200,0.5)",
    oracle: "Nothing is what it looks like right now. The Moon distorts: it makes shadows into threats and threats into shadows and you can't tell the difference at 3am on a rain-slicked Night City street. The unconscious is running the operation and you think you're making rational decisions. You're not. Slow down. What are you afraid of that you haven't named yet? Name it. The unnamed fear has all the power.",
    upright: "Illusion, fear, the unconscious mind, confusion, things hidden beneath the surface.",
    reversed: "Release of fear, repressed emotions surfacing, confusion clearing, truth emerging.",
    keywords: ["ILLUSION", "FEAR", "UNCONSCIOUS", "CONFUSION", "DREAMS"]
  },
  {
    id: 19, name: "The Sun", roman: "XIX", path: "light",
    archetype: "THE RADIANCE // JOY SIGNAL",
    glow: "rgba(255,200,50,0.5)",
    oracle: "Rare thing in Night City: genuine joy, uncut, not manufactured by a braindance. The Sun doesn't require anything from you. It just shines. And right now it's shining on you. This is a moment of clarity, of vitality, of everything clicking into alignment. Don't be suspicious of it. You've earned stretches of light between the firefights. Let yourself feel this without waiting for it to end.",
    upright: "Positivity, fun, warmth, success, vitality, clarity, radiance without effort.",
    reversed: "Inner child blocked, excessive positivity masking pain, temporary clouds.",
    keywords: ["JOY", "SUCCESS", "VITALITY", "CLARITY", "RADIANCE"]
  },
  {
    id: 20, name: "Judgement", roman: "XX", path: "power",
    archetype: "THE RECKONING // FINAL CALL",
    glow: "rgba(255,150,80,0.4)",
    oracle: "The horn sounds and the dead rise, not to haunt you, but to be accounted for. Judgement isn't punishment. It's the moment you finally hear the full transmission of your life and say: yes, this is what I've done. Yes, this is what I am. The absolution you're looking for isn't external. The decision has already been made. You're just being asked to accept it: to hear your own calling and answer it.",
    upright: "Reflection, reckoning, inner calling, self-evaluation, awakening to purpose.",
    reversed: "Self-doubt, refusal of the call, harsh self-judgment, fear of reckoning.",
    keywords: ["RECKONING", "AWAKENING", "CALLING", "ABSOLUTION", "REFLECTION"]
  },
  {
    id: 21, name: "The World", roman: "XXI", path: "light",
    archetype: "THE COMPLETION // INTEGRATION PROTOCOL",
    glow: "rgba(200,168,75,0.6)",
    oracle: "You made it, through every corpo ambush, every flatline scare, every betrayal and every glitch in the construct. The World is completion, but not ending. It's the moment before the next beginning when you're whole: fully integrated, all the shards of yourself finally running the same OS. You've become something the city tried to prevent: a person who can't be owned. That's the rarest achievement in Night City.",
    upright: "Completion, integration, accomplishment, wholeness, travel, fulfillment.",
    reversed: "Seeking shortcuts to completion, loose ends, feeling incomplete despite achieving.",
    keywords: ["COMPLETION", "INTEGRATION", "ACHIEVEMENT", "WHOLENESS", "CYCLE"]
  }
];

const PATH_FILTERS = {
  all: () => true,
  light: c => c.path === "light",
  shadow: c => c.path === "shadow",
  power: c => c.path === "power"
};

let currentFilter = "all";
let spreadCards = [];

function getRomanForDisplay(n) { return n; }

function buildRain() {
  const container = document.getElementById("rain");
  for (let i = 0; i < 80; i++) {
    const drop = document.createElement("div");
    drop.className = "rain-drop";
    drop.style.left = Math.random() * 100 + "%";
    drop.style.height = (Math.random() * 60 + 20) + "px";
    drop.style.animationDuration = (Math.random() * 1.5 + 0.8) + "s";
    drop.style.animationDelay = (Math.random() * 3) + "s";
    drop.style.opacity = Math.random() * 0.4 + 0.1;
    container.appendChild(drop);
  }
}

function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? "200,168,75" : "180,79,255"
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function buildArcanaGrid() {
  const grid = document.getElementById("arcana-grid");
  grid.innerHTML = "";

  const filtered = ARCANA.filter(PATH_FILTERS[currentFilter]);

  filtered.forEach((card, i) => {
    const el = document.createElement("div");
    el.className = "arcana-card";
    el.style.animationDelay = (i * 0.04) + "s";
    el.dataset.id = card.id;

    const glowColor = card.glow;

    el.innerHTML = `
      <div class="arcana-card-frame">
        <img src="cards/${card.name}.webp" alt="${card.name}" loading="lazy" onerror="this.parentElement.classList.add('img-error')">
        <div class="arcana-card-overlay">
          <div class="arcana-card-number">${card.roman}</div>
          <div class="arcana-card-name">${card.name.toUpperCase()}</div>
        </div>
      </div>
      <div class="arcana-card-glow" style="background: radial-gradient(circle, ${glowColor} 0%, transparent 70%)"></div>
      <div class="arcana-card-label">${card.name}</div>
      <div class="arcana-card-num-label">${card.roman}</div>
    `;

    el.addEventListener("click", () => openReading(card));
    grid.appendChild(el);
  });
}

function openReading(card) {
  const section = document.getElementById("reading-section");
  const overlay = document.getElementById("modal-overlay");

  document.getElementById("reading-card-img").src = "cards/" + card.name + ".webp";
  document.getElementById("reading-card-img").alt = card.name;
  document.getElementById("reading-card-number").textContent = card.roman;
  document.getElementById("reading-title").textContent = card.name.toUpperCase();
  document.getElementById("reading-archetype").textContent = card.archetype;
  document.getElementById("oracle-text").textContent = card.oracle;
  document.getElementById("aspect-light-val").textContent = card.upright;
  document.getElementById("aspect-dark-val").textContent = card.reversed;
  document.getElementById("reading-card-glow").style.background = `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`;

  const kw = document.getElementById("reading-keywords");
  kw.innerHTML = card.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join("");

  const wrap = document.getElementById("reading-card-wrap");
  wrap.style.animation = "none";
  void wrap.offsetWidth;
  wrap.style.animation = "reading-card-enter 0.8s cubic-bezier(0.34,1.56,0.64,1)";

  section.style.display = "flex";
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeReading() {
  document.getElementById("reading-section").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
  document.body.style.overflow = "";
}

function drawRandom() {
  const card = ARCANA[Math.floor(Math.random() * ARCANA.length)];
  openReading(card);
}

function openSpread() {
  document.getElementById("spread-section").style.display = "flex";
  document.getElementById("modal-overlay").style.display = "block";
  document.body.style.overflow = "hidden";
  spreadCards = [];
  resetSpreadSlots();
  document.getElementById("spread-reading").style.display = "none";
}

function closeSpread() {
  document.getElementById("spread-section").style.display = "none";
  document.getElementById("modal-overlay").style.display = "none";
  document.body.style.overflow = "";
}

function resetSpreadSlots() {
  ["spread-past", "spread-present", "spread-future"].forEach(id => {
    const slot = document.getElementById(id);
    slot.innerHTML = `<div class="slot-glow"></div><div class="slot-icon">?</div>`;
    slot.classList.remove("has-card");
  });
}

function drawSpread() {
  const shuffled = [...ARCANA].sort(() => Math.random() - 0.5);
  spreadCards = shuffled.slice(0, 3);

  const slots = [
    { id: "spread-past", card: spreadCards[0] },
    { id: "spread-present", card: spreadCards[1] },
    { id: "spread-future", card: spreadCards[2] }
  ];

  slots.forEach((slot, i) => {
    setTimeout(() => {
      const el = document.getElementById(slot.id);
      el.innerHTML = `<img src="cards/${slot.card.name}.webp" alt="${slot.card.name}" style="animation-delay:0s">`;
      el.classList.add("has-card");
    }, i * 400);
  });

  setTimeout(() => {
    showSpreadReading();
  }, 1600);
}

function showSpreadReading() {
  if (spreadCards.length < 3) return;
  const [past, present, future] = spreadCards;
  const readingEl = document.getElementById("spread-reading");

  readingEl.innerHTML = `
    <div class="spread-cards-row">
      <div class="spread-card-mini">
        <img src="cards/${past.name}.webp" alt="${past.name}">
        <div class="spread-card-mini-name">${past.name.toUpperCase()}</div>
        <div class="spread-card-mini-pos">PAST</div>
      </div>
      <div class="spread-card-mini">
        <img src="cards/${present.name}.webp" alt="${present.name}">
        <div class="spread-card-mini-name">${present.name.toUpperCase()}</div>
        <div class="spread-card-mini-pos">PRESENT</div>
      </div>
      <div class="spread-card-mini">
        <img src="cards/${future.name}.webp" alt="${future.name}">
        <div class="spread-card-mini-name">${future.name.toUpperCase()}</div>
        <div class="spread-card-mini-pos">FUTURE</div>
      </div>
    </div>
    <p class="spread-summary">
      Your past carries the energy of <strong style="color:var(--gold)">${past.name}</strong>: ${past.upright} 
      The present moment holds <strong style="color:var(--gold)">${present.name}</strong>: ${present.upright} 
      The path forward is shaped by <strong style="color:var(--gold)">${future.name}</strong>: ${future.upright}
    </p>
  `;

  readingEl.style.display = "block";
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      buildArcanaGrid();
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".lore-content, .section-header").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)";
    observer.observe(el);
  });
}

function initGlitchEffect() {
  const title = document.querySelector(".title-main");
  if (!title) return;

  setInterval(() => {
    if (Math.random() > 0.92) {
      title.style.textShadow = `${Math.random() * 4 - 2}px 0 rgba(255,34,68,0.5), ${Math.random() * 4 - 2}px 0 rgba(68,136,255,0.5)`;
      setTimeout(() => {
        title.style.textShadow = "";
      }, 80 + Math.random() * 100);
    }
  }, 2000);
}

function initCardParallax() {
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const leftCard = document.querySelector(".showcase-card-left");
    const rightCard = document.querySelector(".showcase-card-right");

    if (leftCard) leftCard.style.transform = `rotate(-12deg) translateX(${-20 + x * 10}px) translateY(${y * 8}px) scale(0.8)`;
    if (rightCard) rightCard.style.transform = `rotate(12deg) translateX(${20 + x * 10}px) translateY(${y * 8}px) scale(0.8)`;
  });
}

function initTypewriterEffect() {
  const text = document.querySelector(".hero-subtitle");
  if (!text) return;
  const content = text.textContent;
  text.textContent = "";
  text.style.opacity = "1";
  let i = 0;
  const timer = setTimeout(function type() {
    if (i < content.length) {
      text.textContent += content[i++];
      setTimeout(type, 20 + Math.random() * 15);
    }
  }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
  buildRain();
  initParticles();
  buildArcanaGrid();
  initFilters();
  initScrollAnimations();
  initGlitchEffect();
  initCardParallax();
  initTypewriterEffect();

  document.getElementById("draw-btn").addEventListener("click", drawRandom);

  document.getElementById("spread-btn").addEventListener("click", openSpread);

  document.getElementById("reading-close").addEventListener("click", closeReading);

  document.getElementById("draw-again").addEventListener("click", () => {
    closeReading();
    setTimeout(drawRandom, 300);
  });

  document.getElementById("view-spread").addEventListener("click", () => {
    closeReading();
    setTimeout(openSpread, 300);
  });

  document.getElementById("spread-close").addEventListener("click", closeSpread);

  document.getElementById("spread-draw-btn").addEventListener("click", drawSpread);

  document.getElementById("modal-overlay").addEventListener("click", () => {
    closeReading();
    closeSpread();
  });

  document.querySelectorAll(".arcana-card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.zIndex = "10";
    });
    card.addEventListener("mouseleave", () => {
      card.style.zIndex = "";
    });
  });

  document.querySelectorAll(".arcana-grid").forEach(grid => {
    grid.addEventListener("mousemove", (e) => {
      const cards = grid.querySelectorAll(".arcana-card");
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const dist = Math.sqrt(x * x + y * y);
        if (dist < 200) {
          const frame = card.querySelector(".arcana-card-frame img");
          if (frame) {
            frame.style.filter = `brightness(1.1) saturate(1.3)`;
          }
        }
      });
    });
  });
});