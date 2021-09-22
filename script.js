'use-strict';

// Selections
const baseList = document.querySelector('.base-list');
const outputList = document.querySelector('.output-list');
const baseInput = document.querySelector('.base-input');
const output = document.querySelector('.output-field');
const outputParagraph = document.querySelector('.exchange-rate');
const swapBtn = document.querySelector('.swap');
// Data container
const data = {};
// Fetch data
async function getData(curr) {
  try {
    const url = `https://open.er-api.com/v6/latest/${curr}`;
    const request = await Promise.race([fetch(url), timeout(5)]);
    console.log(request);
    const response = await request.json();
    if (response.result === 'error') {
      throw new Error('Unknown Currency Code');
    }
    console.log(response);
    // Copy response rates to data object
    data.rates = response.rates;
    console.log(data.rates);
    const pair = outputList.value;
    const fixed = response.rates[curr]; // Default selected currency value, always 1
    baseInput.value = baseInput.value || fixed;
    output.value = (baseInput.value * fixed * response.rates[pair]).toFixed(2);
    displayRate(curr, data, pair);
  } catch (err) {
    console.error(err);
    errorMessage(outputParagraph, err);
  }
}

function calcRate(baseInp, obj, pair) {
  const result = +baseInp.value * obj.rates[pair];
  return (output.value = result.toFixed(2));
}

function displayRate(currency, obj, pair) {
  outputParagraph.textContent = `1 ${currency} = ${obj.rates[pair]} ${pair}`;
}

function onOutputListChange(obj) {
  const newCurrency = outputList.value;
  output.value = +baseInput.value * obj.rates[newCurrency];
  displayRate(baseList.value, data, outputList.value);
}
function swapPair() {
  const base = baseList.value;
  const pair = outputList.value;
  baseList.value = pair;
  outputList.value = base;
  console.log(output.value, baseInput.value);
  const baseAmount = baseInput.value;
  const outputAmount = output.value;
  baseInput.value = outputAmount;
  output.value = baseAmount;
  getData(baseList.value);
  displayRate(baseList.value, data, outputList.value);
}
// Listeners
// Get default data on start, for USD
window.addEventListener('load', function () {
  // Remove long labels from currency lists(example: JPY instead Japanese Yen)
  const currencyList = document.querySelectorAll('option');
  currencyList.forEach(el => (el.label = ''));
  // API Call
  getData('USD');
});

baseList.addEventListener('change', function () {
  getData(baseList.value);
});

baseInput.addEventListener('change', function () {
  calcRate(baseInput, data, outputList.value);
});

outputList.addEventListener('change', function () {
  onOutputListChange(data);
});

output.addEventListener('change', calcRateReversed);

swapBtn.addEventListener('click', swapPair);

function calcRateReversed() {
  const parsedRate = outputParagraph.textContent
    .split('=')[1]
    .split(' ')
    .filter(el => el == +el)
    .filter(el => el)
    .map(el => +el);
  return (baseInput.value = (+output.value / parsedRate[0]).toFixed(2));
}
function errorMessage(el, error) {
  el.innerHTML = '';
  el.textContent = `${error.message}! Try again!`;
}
function timeout(sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('Request took too long'));
    }, sec * 1000);
  });
}
