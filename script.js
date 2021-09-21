'use-strict';

// Selection
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
    const request = await fetch(url);
    const response = await request.json();
    console.log(response);
    // Copy response rates to data object
    data.rates = response.rates;
    console.log(data.rates);
    const pair = outputList.value;
    const fixed = response.rates[curr]; // Default selected currency value, always 1
    baseInput.value = baseInput.value || fixed;
    output.value = baseInput.value * fixed * response.rates[pair];
    displayRate(curr, data, pair);
  } catch (err) {
    console.error(err);
  }
}

function calcRate(baseInp, obj, pair) {
  const result = +baseInp.value * obj.rates[pair];
  return (output.value = result);
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
  // Remove long labels from currency lists(two lines below leaves JPY instead Japanese Yen)
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

swapBtn.addEventListener('click', swapPair);
