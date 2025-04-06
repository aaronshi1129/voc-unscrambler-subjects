import {
  vocabulary,
  vocabularyCategories
} from './vocabulary.js';

let currentWord = '';
let score = 0;
let letterCards = []; // Store original letter cards
let selectedLetters = []; // Store selected letter cards
let timeLeft = 0;
let timerInterval;
let gameStarted = false;
let customVocabulary = []; // Add custom vocabulary
let vocabularySource = 'builtin'; // Default to built-in vocabulary
let selectedCategory = 'school'; // Default category

const letterCardsContainer = document.getElementById('letter-cards');
const selectedLettersContainer = document.getElementById('selected-letters');
const submitGuessButton = document.getElementById('submit-guess');
const messageDisplay = document.getElementById('message');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('time');
const congratulationsDisplay = document.getElementById('congratulations');
const startGameButton = document.getElementById('start-game');
const finalCongratulationsDisplay = document.getElementById('finalCongratulations');
const finalMessageDisplay = document.getElementById('finalMessage');
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiAnimation;
const skipWordButton = document.getElementById('skip-word');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const vocabularyTextarea = document.getElementById('vocabulary-textarea');
const saveSettingsButton = document.getElementById('save-settings');
const closeSettingsButton = document.getElementById('close-settings');
const vocabularySourceSelect = document.getElementById('vocabulary-source');
const categoriesSelect = document.getElementById('categories-select'); // New category selector

// Load custom vocabulary from local storage
function loadCustomVocabulary() {
  const storedVocabulary = localStorage.getItem('customVocabulary');
  if (storedVocabulary) {
    customVocabulary = JSON.parse(storedVocabulary);
  }
}

// Save custom vocabulary to local storage
function saveCustomVocabulary() {
  localStorage.setItem('customVocabulary', JSON.stringify(customVocabulary));
}

// Load vocabulary source and category from local storage
function loadVocabularySettings() {
  const storedSource = localStorage.getItem('vocabularySource');
  if (storedSource) {
    vocabularySource = storedSource;
    vocabularySourceSelect.value = storedSource;
  }
  
  const storedCategory = localStorage.getItem('selectedCategory');
  if (storedCategory) {
    selectedCategory = storedCategory;
    if (categoriesSelect) {
      categoriesSelect.value = storedCategory;
    }
  }
}

// Save vocabulary source and category to local storage
function saveVocabularySettings() {
  localStorage.setItem('vocabularySource', vocabularySource);
  localStorage.setItem('selectedCategory', selectedCategory);
}

// Populate categories dropdown
function populateCategoriesDropdown() {
  if (categoriesSelect) {
    categoriesSelect.innerHTML = '';
    Object.keys(vocabularyCategories).forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
      categoriesSelect.appendChild(option);
    });
    categoriesSelect.value = selectedCategory;
  }
}

// Initialize custom vocabulary and vocabulary settings
loadCustomVocabulary();
loadVocabularySettings();
populateCategoriesDropdown();

function getRandomWord() {
  let wordList;
  
  if (vocabularySource === 'custom' && customVocabulary.length > 0) {
    wordList = customVocabulary;
  } else {
    // Use the selected category
    wordList = vocabularyCategories[selectedCategory] || vocabularyCategories.school;
  }
  
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// The rest of the script.js remains unchanged
function scrambleWord(word) {
  const wordArray = word.split('');
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }
  return wordArray;
}

function displayLetterCards(letters) {
  letterCardsContainer.innerHTML = '';
  letterCards = letters.map((letter, index) => {
    const card = document.createElement('div');
    card.classList.add('letter-card');
    card.textContent = letter;
    card.dataset.letter = letter; 
    card.addEventListener('click', moveLetter);
    letterCardsContainer.appendChild(card);
    return card;
  });
}

function moveLetter(event) {
  const card = event.target;
  const letter = card.dataset.letter;

  if (card.parentNode.id === 'letter-cards') {
    selectedLettersContainer.appendChild(card);
    selectedLetters.push(card); 
  } else {
    letterCardsContainer.appendChild(card);
    selectedLetters = selectedLetters.filter(c => c !== card); 
  }
}

function startGame() {
  gameStarted = true;
  submitGuessButton.style.display = 'inline-block';
  submitGuessButton.disabled = false;
  skipWordButton.style.display = 'inline-block'; 
  settingsButton.style.display = 'none'; 
  currentWord = getRandomWord();
  const scrambledLetters = scrambleWord(currentWord);
  displayLetterCards(scrambledLetters);
  letterCardsContainer.classList.add('animate__animated', 'animate__fadeIn');
  selectedLettersContainer.innerHTML = ''; 
  selectedLetters = [];
  document.getElementById('toggle-directions').style.display = 'none'; 

  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
  startGameButton.style.display = 'none';
  messageDisplay.textContent = '';
}

function updateTimer() {
  timeLeft++;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function checkGuess() {
  const userGuess = Array.from(selectedLettersContainer.children)
    .map(card => card.dataset.letter)
    .join('')
    .toLowerCase();

  if (userGuess === currentWord.toLowerCase()) {
    messageDisplay.textContent = '👍Correct!👌';
    messageDisplay.classList.add('animate__animated', 'animate__bounce');
    score++;
    scoreDisplay.textContent = `Score: ${score}`;

    setTimeout(() => {
      messageDisplay.textContent = '';
    }, 2000);

    if (score >= 10) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const finalTimeMessage = `🎊Congratulations!🎉 You successfully unscrambled 10 words in ${String(minutes).padStart(2, '0')} minutes and ${String(seconds).padStart(2, '0')} seconds!🏅`;

      finalMessageDisplay.textContent = finalTimeMessage;
      finalCongratulationsDisplay.style.display = 'block';
      startConfetti();
      submitGuessButton.disabled = true;
      startGameButton.style.display = 'none';
      skipWordButton.style.display = 'none'; 
      clearInterval(timerInterval); 

      setTimeout(() => {
        stopConfetti();
      }, 5000); 

    } else {
      currentWord = getRandomWord();
      const scrambledLetters = scrambleWord(currentWord);
      displayLetterCards(scrambledLetters);
      letterCardsContainer.classList.add('animate__animated', 'animate__fadeIn');
      selectedLettersContainer.innerHTML = ''; 
      selectedLetters = [];
    }
  } else {
    messageDisplay.textContent = '😥Incorrect. Try again.💪';
    messageDisplay.classList.add('animate__animated', 'animate__shakeX');

    setTimeout(() => {
      messageDisplay.textContent = '';
    }, 2000);
  }

  messageDisplay.addEventListener('animationend', () => {
    messageDisplay.classList.remove('animate__animated', 'animate__bounce', 'animate__shakeX');
  });
  letterCardsContainer.addEventListener('animationend', () => {
    letterCardsContainer.classList.remove('animate__animated', 'animate__fadeIn');
  });
}

function skipWord() {
  currentWord = getRandomWord();
  const scrambledLetters = scrambleWord(currentWord);
  displayLetterCards(scrambledLetters);
  letterCardsContainer.classList.add('animate__animated', 'animate__fadeIn');
  selectedLettersContainer.innerHTML = ''; 
  selectedLetters = [];
}

function startConfetti() {
  const confettiSettings = {
    target: confettiCanvas,
    respawn: true,
    "props": ["circle", "square", "triangle", "line"],
    "colors": [
      [165, 104, 246],
      [230, 61, 135],
      [0, 199, 228],
      [253, 214, 126]
    ]
  };
  confettiAnimation = new ConfettiGenerator(confettiSettings);
  confettiAnimation.render();
}

function stopConfetti() {
  if (confettiAnimation) {
    confettiAnimation.clear();
  }
  finalCongratulationsDisplay.style.display = 'none';
}

function openSettings() {
  settingsModal.style.display = 'block';
  vocabularyTextarea.value = customVocabulary.join('\n');
}

function closeSettings() {
  settingsModal.style.display = 'none';
}

function saveSettings() {
  const newVocabulary = vocabularyTextarea.value.split('\n').filter(word => word.trim() !== '');
  customVocabulary = newVocabulary;
  vocabularySource = vocabularySourceSelect.value;
  
  // Save selected category if available
  if (categoriesSelect) {
    selectedCategory = categoriesSelect.value;
  }
  
  saveCustomVocabulary();
  saveVocabularySettings();
  closeSettings();
}

submitGuessButton.addEventListener('click', checkGuess);
startGameButton.addEventListener('click', startGame);
skipWordButton.addEventListener('click', skipWord);
settingsButton.addEventListener('click', openSettings);
saveSettingsButton.addEventListener('click', saveSettings);
closeSettingsButton.addEventListener('click', closeSettings);

// Add event listener for category selector if it exists
if (categoriesSelect) {
  categoriesSelect.addEventListener('change', function() {
    selectedCategory = this.value;
  });
}

import ConfettiGenerator from 'https://cdn.jsdelivr.net/npm/confetti-js/+esm'

vocabularySourceSelect.addEventListener('change', function() {
  const categorySelection = document.getElementById('category-selection');
  if (this.value === 'builtin') {
    categorySelection.style.display = 'block';
  } else {
    categorySelection.style.display = 'none';
  }
});

// Set initial display state
document.addEventListener('DOMContentLoaded', function() {
  const categorySelection = document.getElementById('category-selection');
  if (vocabularySourceSelect.value === 'builtin') {
    categorySelection.style.display = 'block';
  } else {
    categorySelection.style.display = 'none';
  }
  
  // Update page background based on selected category
  document.body.className = '';
  document.body.classList.add('category-' + selectedCategory);
});

// Update background when category changes
if (categoriesSelect) {
  categoriesSelect.addEventListener('change', function() {
    document.body.className = '';
    document.body.classList.add('category-' + this.value);
  });
}