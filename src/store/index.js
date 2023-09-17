import { createStore } from 'vuex';


export default createStore({
    state: {
        isAuthenticated: !!localStorage.getItem("token"),
    },
})
