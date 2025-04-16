// utils/api.js
import axios from 'axios';

const baseURL = 'http://localhost:8080';

const ApiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default ApiClient;