import { createStore } from 'vuex';

export default createStore({
    state: {
        isAuthenticated: !!localStorage.getItem('token'),
        images: []
    },
    mutations: {
        SET_AUTH(state, payload) {
            state.isAuthenticated = payload;
        },
        setImages(state, images) {
            state.images = images;
        }

    },
    actions: {
        login({ commit }, token) {
            localStorage.setItem('token', token);
            commit('SET_AUTH', true);
        },
        logout({ commit }) {
            localStorage.removeItem('token');
            commit('SET_AUTH', false);
        },
        async fetchImages({ commit }) {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/listImages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            commit('setImages', data.images);
        },
        async fetchSharedImages({ commit }, userId) {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/listSharedImages/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            commit('setImages', data.images);
        }

    },
    getters: {
        images: state => state.images
    },
    modules: {}
});
