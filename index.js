document.addEventListener("DOMContentLoaded", function () {
  let exchangeRate = 0;
  let dataTable = {};

  const giveInput = document.getElementById("give-input");
  const receiveInput = document.getElementById("receive-input");
  const swapButton = document.getElementById("swap-button");
  const receiveCurrency = document.getElementById("receive-currency");
  const giveCurrency = document.getElementById("give-currency");
  const infoRow = document.getElementById("info-row");
  const updateButton = document.getElementById("update-button");
  const spin = document.getElementById("spin");
  let updateButtonStatus = true;

  const updateCurrencies = () => {
    return new Promise((resolve, reject) => {
      fetch("https://api.nbp.pl/api/exchangerates/tables/C")
        .then((response) => response.json())
        .then((data) => {
          dataTable = data;
          const dataTime =
            new Date().getHours().toString().padStart(2, "0") +
            ":" +
            new Date().getMinutes().toString().padStart(2, "0");
          infoRow.textContent = "Last updated at " + dataTime;
          infoRow.setAttribute("class", "text-gray-400");
          setTimeout(() => {
            spin.setAttribute("class", "w-6 h-6 text-blue-600");
            updateButton.setAttribute("title", "update");
            updateButton.setAttribute("class", "p-4 cursor-pointer");
          }, 1000);
          updateButtonStatus = true;
          resolve();
        })
        .catch((error) => {
          const errorAlert = document.createElement("h1");
          infoRow.textContent = "Error";
          infoRow.setAttribute("class", "text-red-500");
          setTimeout(() => {
            spin.setAttribute("class", "w-6 h-6 text-blue-600");
            updateButton.setAttribute("title", "update");
            updateButton.setAttribute("class", "p-4 cursor-pointer");
          }, 1000);
          updateButtonStatus = true;
          document.body.appendChild(errorAlert);
          reject();
        });
    });
  };

  const updateSelector = (selectorName) => {
    const tableCurrency = dataTable[0].rates;
    tableCurrency.forEach((element) => {
      const option = document.createElement("option");
      option.value = `${element.code}`;
      option.textContent = `${element.code}`;
      option.title = `${element.currency}`;
      selectorName.appendChild(option);
    });
  };

  const exchangeRateUpdate = () => {
    if (receiveCurrency.value === "PLN" && giveCurrency.value != "PLN") {
      const exchangeRateValues = dataTable[0].rates.find(
        (currency) => currency.code === giveCurrency.value
      );
      exchangeRate = 1 / exchangeRateValues.bid;
      updatePlaceholder();
    } else if (receiveCurrency.value != "PLN" && giveCurrency.value === "PLN") {
      const exchangeRateValues = dataTable[0].rates.find(
        (currency) => currency.code === receiveCurrency.value
      );
      exchangeRate = exchangeRateValues.ask;
      updatePlaceholder();
    } else {
      const exchangeRateReceive = dataTable[0].rates.find(
        (currency) => currency.code === receiveCurrency.value
      );
      const exchangeRateGive = dataTable[0].rates.find(
        (currency) => currency.code === giveCurrency.value
      );
      exchangeRate = exchangeRateReceive.ask / exchangeRateGive.bid;
    }
  };

  const updatePlaceholder = () => {
    giveInput.placeholder = (100 * exchangeRate)
      .toFixed(2)
      .replace(/\.?0*$/, "");
  };

  updateCurrencies().then(() => {
    updateSelector(giveCurrency);
    updateSelector(receiveCurrency);
    giveCurrency.value = "PLN";
    receiveCurrency.value = "USD";
    changeEvent();
    exchangeRateUpdate();
    updatePlaceholder();
  });

  const changeEvent = () => {
    receiveCurrency.dispatchEvent(new Event("change"));
    giveCurrency.dispatchEvent(new Event("change"));
    receiveInput.dispatchEvent(new Event("keyup"));
  };

  giveInput.addEventListener("keyup", function () {
    if (giveInput.value >= 0.01) {
      const receiveOutput = giveInput.value / exchangeRate;
      receiveInput.value = receiveOutput.toFixed(2).replace(/\.?0*$/, "");
    } else {
      receiveInput.value = "";
    }
  });

  receiveInput.addEventListener("keyup", function () {
    if (receiveInput.value >= 0.01) {
      const giveOutput = receiveInput.value * exchangeRate;
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
    changeEvent();
  });

  updateButton.addEventListener("click", function () {
    if (updateButtonStatus) {
      updateCurrencies();
      exchangeRateUpdate();
      updatePlaceholder();
      spin.setAttribute("class", "animate-spin w-6 h-6 text-gray-400");
      updateButton.setAttribute("title", "updating...");
      updateButton.setAttribute("class", "p-4 cursor-default");
      updateButtonStatus = false;
    }
  });

  giveCurrency.addEventListener("change", function () {
    const selectedValue = giveCurrency.value;
    exchangeRateUpdate();
    updatePlaceholder();
    receiveInput.dispatchEvent(new Event("keyup"));

    for (let i = 0; i < receiveCurrency.options.length; i++) {
      const option = receiveCurrency.options[i];
      option.style.display = option.value === selectedValue ? "none" : "";
    }
  });

  receiveCurrency.addEventListener("change", function () {
    const selectedValue = receiveCurrency.value;
    exchangeRateUpdate();
    updatePlaceholder();
    receiveInput.dispatchEvent(new Event("keyup"));

    for (let i = 0; i < giveCurrency.options.length; i++) {
      const option = giveCurrency.options[i];
      option.style.display = option.value === selectedValue ? "none" : "";
    }
  });
});
