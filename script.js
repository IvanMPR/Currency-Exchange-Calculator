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
    const response = await request.json();
    if (response.result === 'error') {
      throw new Error('Unknown Currency Code');
    }
    // Copy response rates to data object
    data.rates = response.rates;
    const pair = outputList.value;
    const fixed = response.rates[curr]; // Default selected value for every base currency, always 1
    baseInput.value = baseInput.value || fixed; // If empty, input will be 1, otherwise input value
    output.value = (baseInput.value * fixed * response.rates[pair]).toFixed(2);
    displayRate(curr, data, pair);
  } catch (err) {
    errorMessage(outputParagraph, err);
  }
}
// Calc values between inputs without calling the API
function calcRate(baseInp, obj, pair) {
  const result = +baseInp.value * obj.rates[pair];
  // If base input is negative value, return and clear output field
  if (+baseInp.value < 0) {
    output.value = '';
    return;
  }
  return (output.value = result.toFixed(2));
}
// Display conversion rate for current pair
function displayRate(currency, obj, pair) {
  outputParagraph.textContent = `1 ${currency} = ${obj.rates[pair]} ${pair}`;
}
// Calculate and display new value when output list change value(currency)
function onOutputListChange(obj) {
  const newCurrency = outputList.value;
  output.value = (+baseInput.value * obj.rates[newCurrency]).toFixed(2);
  displayRate(baseList.value, data, outputList.value);
}
// Swap button function.
function swapPair() {
  // swap currencies
  const base = baseList.value;
  const pair = outputList.value;
  baseList.value = pair;
  outputList.value = base;
  // swap input values
  const baseAmount = baseInput.value;
  const outputAmount = output.value;
  baseInput.value = outputAmount;
  output.value = baseAmount;
  // call API with new base currency
  getData(baseList.value);
  // display new conversion rate between base and pair currencies
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
  // prevent Firefox not displaying default usd eur values after page refresh
  baseList.value = 'USD';
  outputList.value = 'EUR';
});
// Call API on change for baseList
baseList.addEventListener('change', function () {
  getData(baseList.value);
});
// Calculate and display amount between currencies
baseInput.addEventListener('change', function () {
  calcRate(baseInput, data, outputList.value);
});
// Calc and display value when different currency is picked from output list
outputList.addEventListener('change', function () {
  onOutputListChange(data);
});
// Reversed process, calc input value on output value change
output.addEventListener('change', calcRateReversed);
// Swap values
swapBtn.addEventListener('click', swapPair);
// Parse conversion rate from output paragraph(1 USD = 0.95 EUR.  Get 0.95 from string )
function calcRateReversed() {
  const parsedRate = outputParagraph.textContent
    .split('=')[1]
    .split(' ')
    .filter(el => el == +el)
    .filter(el => el)
    .map(el => +el);
  // If output value is negative, return and clear baseInput field
  if (+output.value < 0) {
    baseInput.value = '';
    return;
  }
  return (baseInput.value = (+output.value / parsedRate[0]).toFixed(2));
}
// Render message on error
function errorMessage(el, error) {
  el.innerHTML = '';
  el.textContent = `${error.message}! Try again!`;
}
// Reject if request took too long
function timeout(sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error('Request took too long'));
    }, sec * 1000);
  });
}
