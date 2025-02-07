const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const lastUpdate = document.getElementById("last-update");
const loader = document.getElementById("loader");
const loaderText = document.getElementById("loader-text");
const container = document.querySelector(".container");

const cryptoElements = {
    btc: document.getElementById("btc"),
    eth: document.getElementById("eth"),
    xrp: document.getElementById("xrp"),
    usdt: document.getElementById("usdt"),
    sol: document.getElementById("sol"),
    doge: document.getElementById("doge"),
    trump: document.getElementById("trump"),
    ton: document.getElementById("ton")
};

let exchangeRates = {}; // Aquí guardaremos los valores actualizados

// Loader con efecto de máquina de escribir
const text = "</bondar>";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        loaderText.innerHTML += text.charAt(index);
        index++;
        setTimeout(typeWriter, 150);
    } else {
        setTimeout(() => {
            loader.style.display = "none"; // Oculta el loader al terminar
            container.classList.remove("hidden");
        }, 500);
    }
}

typeWriter();

// Obtener tasas de cambio y actualizar precios en tiempo real
async function fetchExchangeRates() {
    try {
        const forexResponse = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const forexData = await forexResponse.json();
        const usdToPen = forexData.rates.PEN;

        const binanceResponse = await fetch("https://api.binance.com/api/v3/ticker/price");
        const binanceData = await binanceResponse.json();

        exchangeRates = {
            BTC: parseFloat(binanceData.find(item => item.symbol === "BTCUSDT").price),
            ETH: parseFloat(binanceData.find(item => item.symbol === "ETHUSDT").price),
            XRP: parseFloat(binanceData.find(item => item.symbol === "XRPUSDT").price),
            USDT: 1,
            SOL: parseFloat(binanceData.find(item => item.symbol === "SOLUSDT").price),
            DOGE: parseFloat(binanceData.find(item => item.symbol === "DOGEUSDT").price),
            TRUMP: parseFloat(binanceData.find(item => item.symbol === "TRUMPUSDT").price),
            TON: parseFloat(binanceData.find(item => item.symbol === "TONUSDT").price)
        };

        // Si el usuario selecciona Soles (PEN), convertimos los precios
        if (currencySelect.value === "PEN") {
            for (let key in exchangeRates) {
                exchangeRates[key] /= usdToPen;
            }
        }

        lastUpdate.innerText = new Date().toLocaleTimeString();
        updateConversion(); // Llamamos a la función para actualizar los valores en la pantalla
    } catch (error) {
        console.error("Error obteniendo tasas de cambio:", error);
    }
}

// Formatear los números correctamente (2 decimales para valores grandes, 6 para pequeños)
function formatNumber(value) {
    return value >= 1 ? value.toFixed(2) : value.toFixed(6);
}

// Actualizar los valores convertidos
function updateConversion() {
    const value = parseFloat(amountInput.value) || 0;
    for (let key in cryptoElements) {
        cryptoElements[key].innerText = formatNumber(value / exchangeRates[key.toUpperCase()]);
    }
}

// Llamar a la API al cargar la página y actualizar cada 5 minutos
fetchExchangeRates();
setInterval(fetchExchangeRates, 300000); // 300,000 ms = 5 minutos

// Detectar cambios en la cantidad ingresada o la moneda seleccionada
[amountInput, currencySelect].forEach(input => input.addEventListener("input", updateConversion));

// Actualizar los valores de conversión al cambiar entre Soles y Dólares
currencySelect.addEventListener("change", fetchExchangeRates);
