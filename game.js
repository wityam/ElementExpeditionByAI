'use strict';

const ELEMENTS = [
  { number: 1, symbol: 'H', name: 'Hydrogen', fact: 'The lightest element—and the most common one in the universe.' },
  { number: 2, symbol: 'He', name: 'Helium', fact: 'Helium is so light that it can float upward in air.' },
  { number: 3, symbol: 'Li', name: 'Lithium', fact: 'Lithium is the lightest metal.' },
  { number: 4, symbol: 'Be', name: 'Beryllium', fact: 'Beryllium is a strong, lightweight metal.' },
  { number: 5, symbol: 'B', name: 'Boron', fact: 'Boron is found in materials such as heat-resistant glass.' },
  { number: 6, symbol: 'C', name: 'Carbon', fact: 'Carbon is part of every known living thing.' },
  { number: 7, symbol: 'N', name: 'Nitrogen', fact: 'Nitrogen makes up most of the air around us.' },
  { number: 8, symbol: 'O', name: 'Oxygen', fact: 'Oxygen makes up about one-fifth of Earth’s atmosphere.' },
  { number: 9, symbol: 'F', name: 'Fluorine', fact: 'Fluorine is the most reactive nonmetal.' },
  { number: 10, symbol: 'Ne', name: 'Neon', fact: 'Neon can glow brightly in signs when electricity passes through it.' },
  { number: 11, symbol: 'Na', name: 'Sodium', fact: 'Sodium is one of the elements in table salt.' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', fact: 'Magnesium burns with a very bright white light.' },
  { number: 13, symbol: 'Al', name: 'Aluminum', fact: 'Aluminum is a lightweight metal used in cans and aircraft.' },
  { number: 14, symbol: 'Si', name: 'Silicon', fact: 'Silicon is used in computer chips and is common in rocks.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', fact: 'Phosphorus is important for living things, including our bones.' },
  { number: 16, symbol: 'S', name: 'Sulfur', fact: 'Sulfur is a yellow element found near some volcanoes.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', fact: 'Chlorine compounds help disinfect many swimming pools.' },
  { number: 18, symbol: 'Ar', name: 'Argon', fact: 'Argon is an unreactive gas found in the air.' },
  { number: 19, symbol: 'K', name: 'Potassium', fact: 'Potassium is an essential element in many foods, including bananas.' },
  { number: 20, symbol: 'Ca', name: 'Calcium', fact: 'Calcium helps make bones and teeth strong.' }
];

const TOTAL_QUESTIONS = 10;
const LETTERS = ['A', 'B', 'C', 'D'];
const state = { questions: [], index: 0, score: 0, correct: 0, streak: 0, bestStreak: 0, answered: false, startedAt: 0, previousView: 'home' };
const $ = (id) => document.getElementById(id);
const views = { home: $('home-view'), quiz: $('quiz-view'), study: $('study-view'), results: $('results-view') };

function showView(name) {
  Object.entries(views).forEach(([key, view]) => { view.hidden = key !== name; });
  if (name === 'study') $('study-title').focus();
  if (name === 'quiz') $('quiz-title').focus();
  if (name === 'results') $('results-title').focus();
  if (name === 'home') $('start-button').focus();
}

function shuffled(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function makeSession() {
  const selected = shuffled(ELEMENTS).slice(0, TOTAL_QUESTIONS);
  return selected.map((element, index) => {
    const type = ['name', 'symbol', 'number'][index % 3];
    const distractors = shuffled(ELEMENTS.filter((candidate) => candidate.number !== element.number)).slice(0, 3);
    const choices = shuffled([element, ...distractors]);
    return { element, type, choices };
  });
}

function startGame() {
  state.questions = makeSession();
  state.index = 0;
  state.score = 0;
  state.correct = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.answered = false;
  showView('quiz');
  renderQuestion();
}

function getClue(question) {
  if (question.type === 'name') return { label: 'SYMBOL SCAN', text: 'Which element uses the symbol…', prompt: question.element.symbol };
  if (question.type === 'symbol') return { label: 'NAME MATCH', text: 'What is the chemical symbol for…', prompt: question.element.name };
  return { label: 'NUMBER TRACE', text: 'Which element has atomic number…', prompt: String(question.element.number) };
}

function optionLabel(element, type) {
  if (type === 'name') return element.name;
  if (type === 'symbol') return element.symbol;
  return `${element.number} — ${element.name}`;
}

function renderQuestion() {
  const question = state.questions[state.index];
  if (!question) return finishGame();
  state.answered = false;
  const clue = getClue(question);
  $('question-count').innerHTML = `${String(state.index + 1).padStart(2, '0')} <i>/ ${TOTAL_QUESTIONS}</i>`;
  $('score-value').textContent = String(state.score).padStart(3, '0');
  $('progress-fill').style.width = `${(state.index / TOTAL_QUESTIONS) * 100}%`;
  $('quiz-view').querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(state.index));
  $('clue-type').textContent = clue.label;
  $('clue-text').textContent = clue.text;
  $('clue-prompt').textContent = clue.prompt;
  $('streak-display').textContent = `✦  ${state.streak} streak`;
  $('feedback').textContent = '';
  $('feedback').className = 'feedback';
  $('next-button').disabled = true;
  $('next-button').textContent = 'Lock in answer →';
  $('answer-options').replaceChildren();
  state.startedAt = Date.now();
  question.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.dataset.number = String(choice.number);
    button.setAttribute('aria-pressed', 'false');
    const letter = document.createElement('span');
    letter.className = 'option-letter';
    letter.textContent = LETTERS[index];
    const label = document.createElement('span');
    label.className = 'option-label';
    label.textContent = optionLabel(choice, question.type);
    button.append(letter, label);
    button.addEventListener('click', () => submitAnswer(choice.number));
    $('answer-options').append(button);
  });
}

function submitAnswer(number) {
  if (state.answered) return;
  state.answered = true;
  const question = state.questions[state.index];
  const isCorrect = number === question.element.number;
  const speedBonus = isCorrect ? Math.max(0, Math.min(50, Math.floor((15000 - (Date.now() - state.startedAt)) / 500))) : 0;
  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.score += 100 + speedBonus;
  } else {
    state.streak = 0;
  }
  document.querySelectorAll('.answer-option').forEach((button) => {
    const isAnswer = Number(button.dataset.number) === question.element.number;
    const isSelected = Number(button.dataset.number) === number;
    button.disabled = true;
    if (isAnswer) button.classList.add('correct');
    else if (isSelected) button.classList.add('incorrect');
    button.setAttribute('aria-pressed', String(isSelected));
  });
  const feedback = $('feedback');
  feedback.classList.toggle('is-wrong', !isCorrect);
  const title = document.createElement('span');
  title.className = 'feedback-title';
  title.textContent = isCorrect ? `Correct! +${100 + speedBonus} points.` : `Not quite — the answer is ${question.element.name}.`;
  const detail = document.createElement('span');
  detail.textContent = ` ${question.element.name} (${question.element.symbol}), atomic number ${question.element.number}. ${question.element.fact}`;
  feedback.replaceChildren(title, detail);
  $('streak-display').textContent = `✦  ${state.streak} streak`;
  $('score-value').textContent = String(state.score).padStart(3, '0');
  $('next-button').disabled = false;
  $('next-button').textContent = state.index === TOTAL_QUESTIONS - 1 ? 'See results →' : 'Next question →';
  $('next-button').focus();
}

function nextQuestion() {
  if (!state.answered) return;
  state.index += 1;
  renderQuestion();
}

function finishGame() {
  $('progress-fill').style.width = '100%';
  $('quiz-view').querySelector('[role="progressbar"]').setAttribute('aria-valuenow', String(TOTAL_QUESTIONS));
  $('final-score').textContent = String(state.score);
  $('final-accuracy').textContent = `${state.correct} / ${TOTAL_QUESTIONS}`;
  $('final-streak').textContent = String(state.bestStreak);
  $('results-message').textContent = state.correct === TOTAL_QUESTIONS ? 'Perfect run! You know your elements.' : state.correct >= 7 ? 'You made it through the first 20—and learned along the way.' : 'Every question is a step forward. Ready for another round?';
  showView('results');
}

function renderElements(filter = '') {
  const query = filter.trim().toLowerCase();
  const matches = ELEMENTS.filter((element) => `${element.number} ${element.symbol} ${element.name}`.toLowerCase().includes(query));
  const grid = $('element-grid');
  grid.replaceChildren();
  matches.forEach((element) => {
    const card = document.createElement('article');
    card.className = 'element-card';
    card.setAttribute('aria-label', `${element.name}, symbol ${element.symbol}, atomic number ${element.number}`);
    const number = document.createElement('span');
    number.className = 'atomic-number';
    number.textContent = String(element.number).padStart(2, '0');
    const symbol = document.createElement('strong');
    symbol.className = 'symbol';
    symbol.textContent = element.symbol;
    const name = document.createElement('span');
    name.className = 'element-name';
    name.textContent = element.name;
    card.append(number, symbol, name);
    grid.append(card);
  });
  $('no-results').hidden = matches.length > 0;
  grid.setAttribute('aria-label', `${matches.length} elements found`);
}

function openStudy() {
  state.previousView = views.quiz.hidden ? 'home' : 'quiz';
  $('study-back-button').textContent = state.previousView === 'quiz' ? '← Back to game' : '← Back';
  $('element-search').value = '';
  renderElements();
  showView('study');
}

$('start-button').addEventListener('click', startGame);
$('replay-button').addEventListener('click', startGame);
$('home-study-button').addEventListener('click', openStudy);
$('quiz-study-button').addEventListener('click', openStudy);
$('results-study-button').addEventListener('click', () => { state.previousView = 'results'; $('element-search').value = ''; renderElements(); $('study-back-button').textContent = '← Back to results'; showView('study'); });
$('study-back-button').addEventListener('click', () => showView(state.previousView));
$('element-search').addEventListener('input', (event) => renderElements(event.target.value));
$('next-button').addEventListener('click', nextQuestion);
$('quit-button').addEventListener('click', () => showView('home'));

document.addEventListener('keydown', (event) => {
  if (views.quiz.hidden || state.answered || !['a', 'b', 'c', 'd'].includes(event.key.toLowerCase())) return;
  const option = $('answer-options').querySelectorAll('button')[event.key.toLowerCase().charCodeAt(0) - 97];
  if (option) option.click();
});

renderElements();
