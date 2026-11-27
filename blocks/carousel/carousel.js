function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = Number(slide.dataset.slideIndex);

  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-slide').forEach((item, index) => {
    item.setAttribute('aria-hidden', index !== slideIndex);

    item.querySelectorAll('a').forEach((link) => {
      if (index !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  block.querySelectorAll('.carousel-slide-indicator button')
    .forEach((button, index) => {
      if (index === slideIndex) {
        button.disabled = true;
        button.setAttribute('aria-current', 'true');
      } else {
        button.disabled = false;
        button.removeAttribute('aria-current');
      }
    });
}

function showSlide(block, slideIndex = 0) {
  const slides = [...block.querySelectorAll('.carousel-slide')];

  if (!slides.length) return;

  let index = slideIndex;

  if (index < 0) {
    index = slides.length - 1;
  }

  if (index >= slides.length) {
    index = 0;
  }

  const activeSlide = slides[index];

  updateActiveSlide(activeSlide);

  block.querySelector('.carousel-slides').scrollTo({
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  const indicators = block.querySelectorAll('.carousel-slide-indicator button');

  indicators.forEach((button) => {
    button.addEventListener('click', (event) => {
      const slide = Number(event.currentTarget.parentElement.dataset.targetSlide);

      showSlide(block, slide);
    });
  });

  const prev = block.querySelector('.slide-prev');
  const next = block.querySelector('.slide-next');

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(
        block,
        Number(block.dataset.activeSlide) - 1,
      );
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(
        block,
        Number(block.dataset.activeSlide) + 1,
      );
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          updateActiveSlide(entry.target);
        }
      });
    },
    {
      threshold: 0.6,
    },
  );

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    observer.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');

  slide.classList.add('carousel-slide');
  slide.dataset.slideIndex = slideIndex;

  slide.id = `carousel-${carouselId}-slide-${slideIndex}`;

  row.querySelectorAll(':scope > div').forEach((column, index) => {
    column.classList.add(
      `carousel-slide-${index === 0 ? 'image' : 'content'}`,
    );

    slide.append(column);
  });

  return slide;
}

let carouselId = 0;

export default function decorate(block) {
  carouselId += 1;

  block.id = `carousel-${carouselId}`;

  const rows = [...block.querySelectorAll(':scope > div')];

  const isSingleSlide = rows.length <= 1;

  block.setAttribute('role', 'region');

  block.setAttribute(
    'aria-roledescription',
    'Carousel',
  );

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  rows.forEach((row, index) => {
    slidesWrapper.append(
      createSlide(row, index, carouselId),
    );

    row.remove();
  });

  container.append(slidesWrapper);

  block.innerHTML = '';
  block.append(container);

  if (!isSingleSlide) {
    const indicatorsNav = document.createElement('nav');

    indicatorsNav.setAttribute(
      'aria-label',
      'Carousel slide controls',
    );

    const indicators = document.createElement('ol');
    indicators.className = 'carousel-slide-indicators';

    rows.forEach((_, index) => {
      const indicator = document.createElement('li');

      indicator.className = 'carousel-slide-indicator';
      indicator.dataset.targetSlide = index;

      indicator.innerHTML = `
        <button
          type="button"
          aria-label="Slide ${index + 1}">
        </button>
      `;

      indicators.append(indicator);
    });

    indicatorsNav.append(indicators);
    block.append(indicatorsNav);

    const navigation = document.createElement('div');
    navigation.className = 'carousel-navigation-buttons';

    navigation.innerHTML = `
      <button
        type="button"
        class="slide-prev"
        aria-label="Previous Slide">
      </button>

      <button
        type="button"
        class="slide-next"
        aria-label="Next Slide">
      </button>
    `;

    container.append(navigation);

    bindEvents(block);
  }

  block.dataset.activeSlide = 0;

  const firstSlide = block.querySelector('.carousel-slide');

  if (firstSlide) {
    updateActiveSlide(firstSlide);
  }

  // Optional Auto Play
  setInterval(() => {
    if (block.querySelectorAll('.carousel-slide').length > 1) {
      showSlide(
        block,
        Number(block.dataset.activeSlide) + 1,
      );
    }
  }, 2000);
}
