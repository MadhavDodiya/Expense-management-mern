const axios = require('axios');

// Currency conversion function
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const exchangeRates = response.data.rates;

    if (!exchangeRates[toCurrency]) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const convertedAmount = amount * exchangeRates[toCurrency];
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Currency conversion error:', error);
    return amount; // Return original amount if conversion fails
  }
};

// Get country currency mapping
const getCountryCurrency = async (countryName) => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
    const countries = response.data;

    const country = countries.find(c => 
      c.name.common.toLowerCase() === countryName.toLowerCase() ||
      c.name.official.toLowerCase() === countryName.toLowerCase()
    );

    if (country && country.currencies) {
      const currencyCode = Object.keys(country.currencies)[0];
      return currencyCode;
    }

    return 'USD'; // Default currency
  } catch (error) {
    console.error('Get country currency error:', error);
    return 'USD';
  }
};

// Get all supported currencies
const getSupportedCurrencies = async () => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const currencies = Object.keys(response.data.rates);
    return ['USD', ...currencies.filter(c => c !== 'USD')].slice(0, 50); // Limit to 50 currencies
  } catch (error) {
    console.error('Get currencies error:', error);
    return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY']; // Fallback currencies
  }
};

module.exports = {
  convertCurrency,
  getCountryCurrency,
  getSupportedCurrencies
};
