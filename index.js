document.addEventListener("DOMContentLoaded", function () {
  axios
    .get("http://api.nbp.pl/api/exchangerates/tables/C")
    .then((response) => response)
    .then((data) => {
      const currencyData = data.data[0].rates;
      console.log(currencyData.map((currency) => currency.currency));
      console.log(currencyData.map((currency) => currency.code));
    });
});
