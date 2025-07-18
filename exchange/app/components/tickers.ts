import axios from 'axios';

export async function getTickers() {
  const response = await axios.get('https://api.backpack.exchange/api/v1/tickers');
  return response.data;
} 