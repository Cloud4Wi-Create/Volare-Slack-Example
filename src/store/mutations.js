/*jshint esversion: 6 */

import * as mutations from './mutation-types';
import Vue from 'vue';

export default {
  [mutations.ADD_FIELD](state, payload) {
    let i = Object.keys(state.fields).length;
    Vue.set(state.fields, i, payload.field);
    Vue.set(state.fields[i], "id", i);
    Vue.set(state, 'changed', true);
  },
  [mutations.REMOVE_FIELD](state, payload) {
    let newFields = {};
    let i = 0;
    for (let id in state.fields) {
      if (id != payload.id) {
        newFields[i] = state.fields[id];
        newFields[i].id = i;
        i++;
      }
    }
    Vue.set(state, "fields", newFields);
    Vue.set(state, 'changed', true);
  },
  [mutations.UPDATE_FIELD](state, payload) {
    Vue.set(state.fields, payload.id, payload.field);
    Vue.set(state.fields[payload.id], "id", payload.id);
    Vue.set(state, 'changed', true);
  },
  [mutations.UPDATE_FIELD_TITLE](state, payload) {
    Vue.set(state.fields[payload.id], "title", payload.title);
    Vue.set(state, 'changed', true);
  },
  [mutations.UPDATE_FIELD_VALUE](state, payload) {
    Vue.set(state.fields[payload.id], "value", payload.value);
    Vue.set(state, 'changed', true);
  },
  [mutations.UPDATE_ITEM](state, payload) {
    Vue.set(state, payload.key, payload.value);
    Vue.set(state, 'changed', true);
  },
  [mutations.UPDATE_STATE](state, newState) {
    for (let key in newState) {
      console.log(key + " " + newState[key]);
      Vue.set(state, key, newState[key]);
    }
    Vue.set(state, 'changed', false);
  },
  [mutations.SETCHANGED](state, payload) {
    Vue.set(state, 'changed', payload);
  }
};
