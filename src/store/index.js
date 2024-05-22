import { createStore } from 'vuex';

export default createStore({
    state: {
        isAuthenticated: !!localStorage.getItem('token')
    },
    mutations: {
        SET_AUTH(state, payload) {
            state.isAuthenticated = payload;
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
        }
    },
    modules: {}
});
