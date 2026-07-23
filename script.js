const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzk5OHyf5XZJnSe-MvGaLPANsMaYkD5TKsDl2Hxw5E_bfwFZ-w3RpbA-TDSpCJoVs1H/exec";

const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const langButtons = [...document.querySelectorAll('.lang-btn')];
const form = document.getElementById('rsvp-form');
const guestFields = document.getElementById('guest-fields');
const companionsField = document.getElementById('companions-field');
const guestCount = form.elements.guestCount;
const companions = form.elements.companions;
const successPanel = document.getElementById('success-panel');
const formHeading = document.getElementById('form-heading');
const weddingVideo = document.getElementById('wedding-video');

let currentSlide = 0;
let currentLang = 'fr';

function showSlide(index) {
  currentSlide = Math.max(0, Math.min(slides.length - 1, index));

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide === slides.length - 1;
  document.querySelector('.viewer').scrollTop = 0;
}

function setLanguage(lang) {
  currentLang = lang;
  const isHebrew = lang === 'he';

  document.documentElement.lang = isHebrew ? 'he' : 'fr';
  document.documentElement.dir = isHebrew ? 'rtl' : 'ltr';

  langButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.lang === lang);
  });

  document.querySelectorAll('img[data-fr]').forEach(img => {
    img.src = img.dataset[lang];
  });
}

prevBtn.addEventListener('click', () => {
  showSlide(currentSlide - 1);
});

nextBtn.addEventListener('click', () => {
  showSlide(currentSlide + 1);
});

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    showSlide(Number(dot.dataset.go));
  });
});

langButtons.forEach(button => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.lang);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') {
    showSlide(currentSlide + (currentLang === 'he' ? -1 : 1));
  }

  if (event.key === 'ArrowLeft') {
    showSlide(currentSlide + (currentLang === 'he' ? 1 : -1));
  }
});

form.addEventListener('change', event => {
  if (event.target.name === 'attendance') {
    const attending = event.target.value === 'yes';

    guestFields.classList.toggle('hidden', !attending);
    guestCount.required = attending;

    if (!attending) {
      guestCount.value = '';
      companions.value = '';
      companions.required = false;
      companionsField.classList.add('hidden');
    }
  }

  if (event.target.name === 'guestCount') {
    const needsCompanions = Number(event.target.value) > 1;

    companionsField.classList.toggle('hidden', !needsCompanions);
    companions.required = needsCompanions;

    if (!needsCompanions) {
      companions.value = '';
    }
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const isAttending = form.elements.attendance.value === 'yes';
  const submitButton = form.querySelector('.submit-button');

  submitButton.disabled = true;

  const originalText = submitButton.innerHTML;

  submitButton.textContent =
    currentLang === 'he' ? 'שולח...' : 'Envoi en cours...';

  const data = {
    nom: form.elements.fullName.value,
    telephone: form.elements.phone.value,
    present: isAttending ? 'Oui' : 'Non',
    nombre: form.elements.guestCount.value,
    accompagnants: form.elements.companions.value,
    message: form.elements.message.value
  };

  try {
    await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(data)
    });

    form.classList.add('hidden');
    formHeading.classList.add('hidden');
    successPanel.classList.remove('hidden');
  } catch (error) {
    alert(
      currentLang === 'he'
        ? 'אירעה שגיאה. אנא נסו שוב.'
        : 'Une erreur est survenue. Merci de réessayer.'
    );

    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});

showSlide(0);
setLanguage('fr');
