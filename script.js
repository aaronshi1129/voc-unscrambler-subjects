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

let customVocabularySets = {}; // Store multiple custom vocabulary sets
let currentCustomSet = ''; // Track current selected custom set

// Load custom vocabulary sets from local storage
function loadCustomVocabularySets() {
  const storedSets = localStorage.getItem('customVocabularySets');
  if (storedSets) {
    customVocabularySets = JSON.parse(storedSets);
  }
}

// Save custom vocabulary sets to local storage
function saveCustomVocabularySets() {
  localStorage.setItem('customVocabularySets', JSON.stringify(customVocabularySets));
}

// Update the settings modal functions
function openSettings() {
  settingsModal.style.display = 'block';
  // Populate vocabulary sets dropdown
  const setsSelect = document.getElementById('vocabulary-sets-select');
  setsSelect.innerHTML = '';
  Object.keys(customVocabularySets).forEach(setName => {
    const option = document.createElement('option');
    option.value = setName;
    option.textContent = setName;
    setsSelect.appendChild(option);
  });
  // Add "New Set" option
  const newOption = document.createElement('option');
  newOption.value = '';
  newOption.textContent = '-- Create New Set --';
  setsSelect.appendChild(newOption);
  setsSelect.value = currentCustomSet || '';
  
  // Update textarea with current set content
  vocabularyTextarea.value = currentCustomSet ? customVocabularySets[currentCustomSet].join('\n') : '';
}

function saveSettings() {
  const newVocabulary = vocabularyTextarea.value.split('\n').filter(word => word.trim() !== '');
  vocabularySource = vocabularySourceSelect.value;
  
  // Save selected category if available
  if (categoriesSelect) {
    selectedCategory = categoriesSelect.value;
  }
  
  // Save custom vocabulary set if in custom mode
  if (vocabularySource === 'custom') {
    const setNameInput = document.getElementById('vocabulary-set-name');
    const setName = setNameInput.value.trim();
    if (setName) {
      customVocabularySets[setName] = newVocabulary;
      currentCustomSet = setName;
      saveCustomVocabularySets();
    }
  }
  
  saveVocabularySettings();
  closeSettings();
}

vocabularySourceSelect.addEventListener('change', function() {
  const categorySelection = document.getElementById('category-selection');
  const customVocabularySelection = document.getElementById('custom-vocabulary-selection');
  
  if (this.value === 'builtin') {
    categorySelection.style.display = 'block';
    customVocabularySelection.style.display = 'none';
  } else {
    categorySelection.style.display = 'none';
    customVocabularySelection.style.display = 'block';
  }
});

// Initialize the modal display
document.addEventListener('DOMContentLoaded', function() {
  const categorySelection = document.getElementById('category-selection');
  const customVocabularySelection = document.getElementById('custom-vocabulary-selection');
  
  if (vocabularySourceSelect.value === 'builtin') {
    categorySelection.style.display = 'block';
    customVocabularySelection.style.display = 'none';
  } else {
    categorySelection.style.display = 'none';
    customVocabularySelection.style.display = 'block';
  }
  
  // Update page background based on selected category
  document.body.className = '';
  document.body.classList.add('category-' + selectedCategory);
});

// Update getRandomWord function
function getRandomWord() {
  let wordList;
  
  if (vocabularySource === 'custom' && currentCustomSet && customVocabularySets[currentCustomSet] && customVocabularySets[currentCustomSet].length > 0) {
    wordList = customVocabularySets[currentCustomSet];
  } else {
    // Use the selected category
    wordList = vocabularyCategories[selectedCategory] || vocabularyCategories.school;
  }
  
  if (!wordList || wordList.length === 0) {
    wordList = vocabularyCategories.school; // Fallback to default
  }
  
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// Add back to home function
function backToHome() {
  // Reset game state
  gameStarted = false;
  score = 0;
  timeLeft = 0;
  clearInterval(timerInterval);
  timerInterval = null;
  
  // Update UI
  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.textContent = '00:00';
  messageDisplay.textContent = '';
  letterCardsContainer.innerHTML = '';
  selectedLettersContainer.innerHTML = '';
  selectedLetters = [];
  letterCards = [];
  
  // Show/hide buttons
  startGameButton.style.display = 'inline-block';
  submitGuessButton.style.display = 'none';
  skipWordButton.style.display = 'none';
  backToHomeButton.style.display = 'none';
  settingsButton.style.display = 'inline-block';
  document.getElementById('toggle-directions').style.display = 'inline-block';
  
  // Hide congratulations
  finalCongratulationsDisplay.style.display = 'none';
  stopConfetti();
}

// Add back to home button to the UI
const backToHomeButton = document.createElement('button');
backToHomeButton.id = 'back-to-home';
backToHomeButton.textContent = 'Back to Home';
backToHomeButton.style.display = 'none';
backToHomeButton.addEventListener('click', backToHome);
document.querySelector('.container').insertBefore(backToHomeButton, document.getElementById('toggle-directions'));

function startGame() {
  gameStarted = true;
  submitGuessButton.style.display = 'inline-block';
  submitGuessButton.disabled = false;
  skipWordButton.style.display = 'inline-block'; 
  backToHomeButton.style.display = 'inline-block';
  settingsButton.style.display = 'none';
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
      backToHomeButton.style.display = 'inline-block';
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