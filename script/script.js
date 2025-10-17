let index = 0;
let slides;
let totalSlides;

function updateSlider() {
  slides.style.transform = `translateX(-${index * 100}%)`;
}

function next() {
  index = (index + 1) % totalSlides;
  updateSlider();
}

function prev() {
  index = (index - 1 + totalSlides) % totalSlides;
  updateSlider();
}

document.addEventListener("DOMContentLoaded", () => {
  slides = document.querySelector(".slides");
  totalSlides = document.querySelectorAll(".slide").length;
  updateSlider();
});
