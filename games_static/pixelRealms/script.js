const carousel = document.getElementById("carousel");
const cards = [...document.querySelectorAll(".game-card")];

const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const randomBtn = document.getElementById("randomBtn");

let current = 0;
let autoplay;

function updateCarousel() {

  const mobile = window.innerWidth <= 768;

  cards.forEach((card, index) => {

    const offset = index - current;

    if (mobile) {

      card.style.transform =
        `translate(-50%, -50%) scale(${index === current ? 1 : 0.9})`;

      card.style.opacity =
        index === current ? "1" : "0";

      card.style.pointerEvents =
        index === current ? "auto" : "none";

    } else {

      card.style.transform =
        `translate(-50%, -50%) translateX(${offset * 95}%) scale(${index === current ? 1 : 0.85})`;

      card.style.opacity =
        index === current ? "1" : ".35";

    }

    card.style.zIndex =
      cards.length - Math.abs(offset);

  });

}

function nextSlide() {
  current = (current + 1) % cards.length;
  updateCarousel();
}

function prevSlide() {
  current =
    (current - 1 + cards.length) %
    cards.length;

  updateCarousel();
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

randomBtn.addEventListener("click", () => {

  const randomCard =
    cards[Math.floor(Math.random() * cards.length)];

  window.location.href =
    randomCard.querySelector(".play-btn").href;
});

function startAutoplay() {
  autoplay = setInterval(nextSlide, 6000);
}

function stopAutoplay() {
  clearInterval(autoplay);
}

carousel.addEventListener("mouseenter", stopAutoplay);
carousel.addEventListener("mouseleave", startAutoplay);

let startX = 0;

carousel.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

carousel.addEventListener("touchend", e => {

  const endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) {
    nextSlide();
  }

  if (endX - startX > 50) {
    prevSlide();
  }
});

updateCarousel();
startAutoplay();
window.addEventListener("resize", updateCarousel);
