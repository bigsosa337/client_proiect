export const url = 'http://localhost:3000/';

export const globalRequestParameters = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
};

export function sortByName(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}
