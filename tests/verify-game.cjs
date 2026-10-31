'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class MockElement {
  constructor(id = '') {
    this.id = id; this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {};
    this.style = {}; this.hidden = false; this.disabled = false; this.value = ''; this._textContent = '';
    this.className = ''; this.classList = {
      add: (...names) => { this.className = `${this.className} ${names.join(' ')}`.trim(); },
      toggle: (name, on) => { if (on) this.classList.add(name); else this.className = this.className.split(' ').filter((part) => part !== name).join(' '); }
    };
  }
  get textContent() { return this.children.length ? this.children.map((child) => child.textContent).join('') : this._textContent; }
  set textContent(value) { this.children = []; this._textContent = String(value); }
  addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
  dispatch(type, event = {}) { (this.listeners[type] || []).forEach((callback) => callback({ target: this, key: '', ...event })); }
  click() { if (!this.disabled) this.dispatch('click'); }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  focus() { this.focused = true; }
  querySelectorAll(selector) { return selector === 'button' ? this.children : []; }
}

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const source = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => [match[1], new MockElement(match[1])]));
const answerOptions = elements.get('answer-options');
const quizView = elements.get('quiz-view');
quizView.querySelector = (selector) => selector === '[role="progressbar"]' ? progress : null;
const progress = new MockElement('progress');
const document = {
  getElementById: (id) => elements.get(id) || null,
  createElement: () => new MockElement(),
  querySelectorAll: (selector) => selector === '.answer-option' ? answerOptions.children : [],
  addEventListener(type, callback) { this.listeners ||= {}; (this.listeners[type] ||= []).push(callback); }
};
const context = vm.createContext({ document, Date, Math, String, Number, Object, Array, console });
vm.runInContext(source, context, { filename: 'game.js' });
const data = vm.runInContext('ELEMENTS', context);
assert.equal(data.length, 20, 'exactly 20 elements are in the reference set');
assert.deepEqual(Array.from(data, (item) => item.number), Array.from({ length: 20 }, (_, i) => i + 1));
assert.equal(new Set(data.map((item) => item.symbol)).size, 20, 'symbols are unique');
assert.equal(new Set(data.map((item) => item.name)).size, 20, 'names are unique');
assert.match(html, /<main\b/); assert.match(html, /aria-live="polite"/); assert.match(css, /prefers-reduced-motion/);
assert.doesNotMatch(css, /https?:\/\//, 'no remote stylesheet or asset dependency');

// Play a full all-correct run, checking unique choices, feedback, score, streak, and terminal state.
elements.get('start-button').click();
assert.equal(elements.get('quiz-view').hidden, false);
assert.equal(elements.get('home-view').hidden, true);
assert.equal(elements.get('quiz-title').focused, true, 'focus moves to the quiz heading');
for (let question = 0; question < 10; question += 1) {
  assert.equal(answerOptions.children.length, 4, 'each clue has four choices');
  assert.equal(new Set(answerOptions.children.map((button) => button.dataset.number)).size, 4, 'choices are unique');
  const clueType = elements.get('clue-type').textContent;
  const prompt = elements.get('clue-prompt').textContent;
  const correct = data.find((element) => clueType === 'SYMBOL SCAN' ? element.symbol === prompt : clueType === 'NAME MATCH' ? element.name === prompt : String(element.number) === prompt);
  assert.ok(correct, 'clue points to a real element');
  const answer = answerOptions.children.find((button) => Number(button.dataset.number) === correct.number);
  answer.click();
  assert.equal(elements.get('next-button').disabled, false);
  assert.match(elements.get('feedback').textContent, /Correct!/);
  elements.get('next-button').click();
}
assert.equal(elements.get('results-view').hidden, false, '10 answers reach results');
assert.equal(elements.get('results-title').focused, true, 'focus moves to the results heading');
assert.equal(elements.get('final-accuracy').textContent, '10 / 10');
assert.equal(Number(elements.get('final-score').textContent) >= 1000, true);
assert.equal(elements.get('final-streak').textContent, '10');

// Search filters the study cards and a wrong answer does not reduce the score.
elements.get('results-study-button').click();
assert.equal(elements.get('study-title').focused, true, 'focus moves to the study heading');
elements.get('element-search').value = 'oxygen';
elements.get('element-search').dispatch('input', { target: elements.get('element-search') });
assert.equal(elements.get('element-grid').children.length, 1);
assert.equal(elements.get('element-grid').children[0].children[2].textContent, 'Oxygen');
elements.get('study-back-button').click();
elements.get('replay-button').click();
const wrongQuestion = data.find((element) => elements.get('clue-prompt').textContent === element.symbol || elements.get('clue-prompt').textContent === element.name || String(element.number) === elements.get('clue-prompt').textContent);
const wrongChoice = answerOptions.children.find((button) => Number(button.dataset.number) !== wrongQuestion.number);
wrongChoice.click();
assert.match(elements.get('feedback').textContent, /Not quite/);
assert.equal(elements.get('score-value').textContent, '000');
assert.equal(elements.get('streak-display').textContent, '✦  0 streak');
console.log('PASS: 20-element data, structure, ten-question session, feedback, score/streak, replay, study search, and wrong-answer behavior.');
