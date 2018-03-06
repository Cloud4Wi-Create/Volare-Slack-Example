/*jshint esversion: 6 */

import * as mutations from './mutation-types';
import { loadSettings, saveSettings } from '../api/api';

export default {
  addField({ commit }, payload) {
    commit(mutations.ADD_FIELD, payload);
  },
  removeField({ commit }, payload) {
    commit(mutations.REMOVE_FIELD, payload);
  },
  updateField({ commit }, payload) {
    commit(mutations.UPDATE_FIELD, payload);
  },
  updateFieldTitle({ commit }, payload) {
    commit(mutations.UPDATE_FIELD_TITLE, payload);
  },
  updateFieldValue({ commit }, payload) {
    commit(mutations.UPDATE_FIELD_VALUE, payload);
  },
  updateItem({ commit }, payload) {
    commit(mutations.UPDATE_ITEM, payload);
  },
  save({ commit, state }) {
    let toBeSaved = JSON.parse(JSON.stringify(state));
    delete toBeSaved.changed;
    saveSettings(toBeSaved).then(r => commit(mutations.SETCHANGED, false));
  },
  load({ commit }) {
    loadSettings(newState => {
      commit(mutations.UPDATE_STATE, newState);
      console.log(newState);
    });
  }
};
