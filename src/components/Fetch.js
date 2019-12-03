// Import dependencies
import axios from 'axios'
import {setupCache, setup} from 'axios-cache-adapter'
import Autocomplete from "./Autocomplete";

const cache = setupCache({
    maxAge: 15 * 60 * 1000
});

const api = axios.create({
    adapter: cache.adapter
});
//
// const api = setup({
//     baseURL: 'https://httpbin.org',
//     cache: {
//         maxAge: 15 * 60 * 1000
//     }
// });

// const instance = axios.create({
//     baseURL: 'http://localhost:8083/v2/smartfill',
//     timeout: 1000,
//     headers: {'Client-ID': 'foobarbaz'}
// });


const getSuggestions = (lang, query) => {
    if (query.length < 3) {
        return {};
    }

    return api({
        url: `http://localhost:8083/v2/smartfill?language=${lang}&query=${query}`,
        method: 'get',
        headers: {"Client-ID": "foobarbaz"}
    }).then(async (response) => {
        console.log('Request response:', response);
        const length = await cache.store.length();
        console.log('Cache store length:', length);
        return Promise.resolve(response.data);
    });
};

export default getSuggestions;