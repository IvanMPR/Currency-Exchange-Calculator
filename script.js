const currencyList = document.querySelectorAll('option');
console.log(currencyList);
currencyList.forEach(el => (el.label = ''));
