document.addEventListener("DOMContentLoaded", function () {
  let exchangeRate = 0;
  let dataTime;
  let tableCurrency = {};
  let updateButtonStatus = true;
  let giveCurrencyValue = "PLN";
  let receiveCurrencyValue = "USD";
  let giveToUpdate = true;

  const giveInput = document.getElementById("give-input");
  const receiveInput = document.getElementById("receive-input");
  const swapButton = document.getElementById("swap-button");
  const receiveCurrency = document.getElementById("receive-currency");
  const giveCurrency = document.getElementById("give-currency");
  const infoRow = document.getElementById("info-row");
  const updateButton = document.getElementById("update-button");
  const spin = document.getElementById("spin");

  const setupCurrencyValue = () => {
    giveCurrency.value = giveCurrencyValue;
    receiveCurrency.value = receiveCurrencyValue;
  };

  const afterUpdate = () => {
    updateSelector(giveCurrency);
    updateSelector(receiveCurrency);
    setupCurrencyValue();
    changeEvent();
    exchangeRateUpdate();
  };

  const updateCurrencies = () => {
    fetch("https://api.nbp.pl/api/exchangerates/tables/c/")
      .then((response) => response.json())
      .then((data) => {
        if (data[0].rates) {
          tableCurrency = data[0].rates;
          dataTime = new Date().toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          });
          infoRow.textContent = "Ostatnia aktualizacja o " + dataTime;
          infoRow.setAttribute("class", "text-gray-400 mr-2");
          afterUpdate();
        }
      })
      .catch((error) => {
        const errorAlert = document.createElement("h1");
        infoRow.textContent =
          "Błąd pobierania danych. " +
          `${dataTime ? " Ostatnia aktualizacja o " + dataTime : ""}`;
        infoRow.setAttribute("class", "text-red-500 mr-2");
        document.body.appendChild(errorAlert);
      })
      .finally(() => {
        setTimeout(() => {
          spin.setAttribute("class", "w-6 h-6 text-blue-600");
          updateButton.setAttribute("title", "Zaktualizuj");
          updateButton.classList.remove("cursor-default");
          updateButtonStatus = true;
        }, 1000);
      });
  };

  const updateSelector = (selectorName) => {
    selectorName.innerHTML =
      '<option value="PLN" title="polski złoty">PLN</option>';
    tableCurrency.forEach((element) => {
      const option = document.createElement("option");
      option.value = element.code;
      option.textContent = element.code;
      option.title = element.currency;
      selectorName.appendChild(option);
    });
  };

  const exchangeRateUpdate = () => {
    if (receiveCurrency.value === "PLN" && giveCurrency.value !== "PLN") {
      const exchangeRateValues = tableCurrency.find(
        (currency) => currency.code === giveCurrency.value
      );
      exchangeRate = 1 / exchangeRateValues.bid;
      updatePlaceholder();
    } else if (
      receiveCurrency.value !== "PLN" &&
      giveCurrency.value === "PLN"
    ) {
      const exchangeRateValues = tableCurrency.find(
        (currency) => currency.code === receiveCurrency.value
      );
      exchangeRate = exchangeRateValues.ask;
      updatePlaceholder();
    } else if (giveCurrency.value === receiveCurrency.value) {
      exchangeRate = 1;
      updatePlaceholder();
    } else {
      const exchangeRateReceive = tableCurrency.find(
        (currency) => currency.code === receiveCurrency.value
      );
      const exchangeRateGive = tableCurrency.find(
        (currency) => currency.code === giveCurrency.value
      );
      exchangeRate = exchangeRateReceive.ask / exchangeRateGive.bid;
      updatePlaceholder();
    }
  };

  const updatePlaceholder = () => {
    if (giveToUpdate === true) {
      receiveInput.placeholder = 100;
      giveInput.placeholder = (100 * exchangeRate).toFixed(2);
    } else {
      giveInput.placeholder = 100;
      receiveInput.placeholder = (100 / exchangeRate).toFixed(2);
    }
  };

  updateCurrencies();

  setInterval(() => {
    updateButtonAction();
  }, 1000 * 60 * 5);

  const changeEvent = () => {
    receiveCurrencyAction();
    giveCurrencyAction();
  };

  const giveInputAction = () => {
    if (giveInput.value >= 0.01) {
      const receiveOutput = giveInput.value / exchangeRate;
      receiveInput.value = receiveOutput.toFixed(2);
    } else {
      receiveInput.value = "";
    }
  };

  giveInput.addEventListener("keyup", function () {
    giveToUpdate = false;
    updatePlaceholder();
    giveInputAction();
  });

  const receiveInputAction = () => {
    if (receiveInput.value >= 0.01) {
      const giveOutput = receiveInput.value * exchangeRate;
      giveInput.value = giveOutput.toFixed(2);
    } else {
      giveInput.value = "";
    }
  };

  receiveInput.addEventListener("keyup", function () {
    giveToUpdate = true;
    updatePlaceholder();
    receiveInputAction();
  });

  swapButton.addEventListener("click", function () {
    const newReceiveCurrency = giveCurrency.value;
    const newGiveCurrency = receiveCurrency.value;
    receiveCurrency.value = newReceiveCurrency;
    giveCurrency.value = newGiveCurrency;
    exchangeRateUpdate();
    if (giveToUpdate === true) {
      giveInput.value = receiveInput.value;
      giveInputAction();
      giveToUpdate = false;
      updatePlaceholder();
    } else {
      receiveInput.value = giveInput.value;
      receiveInputAction();
      giveToUpdate = true;
      updatePlaceholder();
    }
  });

  const updateButtonAction = () => {
    if (updateButtonStatus) {
      updateCurrencies();
      exchangeRateUpdate();
      spin.setAttribute("class", "animate-spin w-6 h-6 text-gray-400");
      updateButton.setAttribute("title", "Aktualizacja...");
      updateButton.classList.add("cursor-default");
      updateButtonStatus = false;
    }
  };

  updateButton.addEventListener("click", updateButtonAction);

  const giveCurrencyAction = () => {
    giveCurrencyValue = giveCurrency.value;
    exchangeRateUpdate();
    giveInputAction();

    for (let i = 0; i < receiveCurrency.options.length; i++) {
      const option = receiveCurrency.options[i];
      option.style.display = option.value === giveCurrencyValue ? "none" : "";
    }
  };

  giveCurrency.addEventListener("change", function () {
    giveToUpdate = false;
    giveCurrencyAction();
  });

  const receiveCurrencyAction = () => {
    receiveCurrencyValue = receiveCurrency.value;
    exchangeRateUpdate();
    receiveInputAction();

    for (let i = 0; i < giveCurrency.options.length; i++) {
      const option = giveCurrency.options[i];
      option.style.display =
        option.value === receiveCurrencyValue ? "none" : "";
    }
  };

  receiveCurrency.addEventListener("change", function () {
    giveToUpdate = true;
    receiveCurrencyAction();
  });
});
