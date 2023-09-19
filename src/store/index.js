import { createStore } from 'vuex';


export default createStore({
    state: {
        isAuthenticated: !!localStorage.getItem("token"),
    },
    mutations: {
      SET_AUTH: (state, status) => {
          state.isAuthenticated = status;
      }
    },
    actions: {
        login: ({ commit }, payload) => {
            commit("SET_AUTH", true);
        }
    },
    modules: {},
})
