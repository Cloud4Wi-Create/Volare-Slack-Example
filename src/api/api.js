import Vue from 'vue';

export function loadSettings(callback) {
    return Vue.http.get('./settings?tenantId=' + window.tenantId + '&venueId=' + window.venueId)
      .then(r => callback(r.body));
};

export function saveSettings(settings) {
  return Vue.http.post('./?tenantId=' + window.tenantId + '&venueId=' + window.venueId, settings)
          .then(r => console.log("success"), error => console.log(error));
};