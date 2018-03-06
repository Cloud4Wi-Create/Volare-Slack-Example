import Vue from 'vue';
import Vuex from 'vuex';

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

Vue.use(Vuex);

let state = {
    title: "",
    pretext: "User has logged in",
    fallback: "User has logged in",
    color: "#000055",
    timeout: 10,
    fields: {
        0: { id: 0, title: "Name", value: "fullName" },
        1: { id: 1, title: "Email", value: "email" },
        2: { id: 2, title: "Event Type", value: "event" }
    },
    changed: false
};

if(window.settings.title !== undefined) {
  state = JSON.parse(JSON.stringify(window.settings));
  state.changed = false;
}

export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations
});
