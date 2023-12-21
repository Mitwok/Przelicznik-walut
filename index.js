document.addEventListener("DOMContentLoaded", function () {
  let exchangeRate;
  const giveInput = document.getElementById("give-input");
  const receiveInput = document.getElementById("receive-input");
  const swapButton = document.getElementById("swap-button");
  const receiveCurrency = document.getElementById("receive-currency");
  const giveCurrency = document.getElementById("give-currency");
  const storageData = localStorage.getItem("tableData");

  const updateCurrencies = () => {
    fetch("http://api.nbp.pl/api/exchangerates/tables/C")
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("tableData", JSON.stringify(data));
      })
      .catch((error) => console.error("Ошибка при получении данных:", error));
  };

  const updateSelector = (selectorName) => {
    if (storageData) {
      const tableData = JSON.parse(storageData);
      const tableCurrency = tableData[0].rates;

      tableCurrency.forEach((element) => {
        const option = document.createElement("option");
        option.value = `${element.code}`;
        option.textContent = `${element.code}`;
        option.title = `${element.currency}`;
        selectorName.appendChild(option);
      });
    }
  };

  updateCurrencies();
  updateSelector(giveCurrency);
  updateSelector(receiveCurrency);

  // fetch("http://api.nbp.pl/api/exchangerates/tables/C")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     const currencyData = data[0].rates;
  //     console.log(currencyData.map((currency) => currency.currency));
  //     console.log(currencyData.map((currency) => currency.code));
  //     console.log(currencyData.map((currency) => currency));

  //     const ExchangeData = currencyData.find(
  //       (item) => item.code === giveCurrency.value
  //     );
  //     exchangeBid = ExchangeData ? ExchangeData.bid : null;
  //     exchangeAsk = ExchangeData ? ExchangeData.ask : null;
  //   });

  exchangeRate = 4.2;

  receiveInput.placeholder = 100 * exchangeRate;

  giveInput.addEventListener("keyup", function () {
    if (giveInput.value >= 0.01) {
      const receiveOutput = giveInput.value * exchangeRate;
      receiveInput.value = receiveOutput.toFixed(2).replace(/\.?0*$/, "");
    } else {
      receiveInput.value = "";
    }
  });

  receiveInput.addEventListener("keyup", function () {
    if (receiveInput.value >= 0.01) {
      const giveOutput = receiveInput.value / exchangeRate;
      giveInput.value = giveOutput.toFixed(2).replace(/\.?0*$/, "");
    } else {
      giveInput.value = "";
    }
  });

  swapButton.addEventListener("click", function () {
    const newReceiveCurrency = giveCurrency.value;
    const newGiveCurrency = receiveCurrency.value;
    giveCurrency.value = newGiveCurrency;
    receiveCurrency.value = newReceiveCurrency;
  });
});
