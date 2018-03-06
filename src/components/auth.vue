<template>
  <div class="card mt-3">
    <div class="card-header">
      <h3>Connect Your Slack Account</h3>
    </div>
      <div class="card-body" v-if="!channel">
        <a target="_blank" :href="addToSlack" :onclick="save"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
      </div>
      <div class="card-body d-flex flex-row justify-content-between align-items-center" v-else>
        <span>Posting to Channel: {{ channel }}</span> <a class="btn btn-cancel" v-on:click="deleteAuth">Remove Integration <i class="demo-icon icon-trash"></i></a>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      channel: window.channel,
      addToSlack: './auth/new' + '?tenantId=' + window.tenantId + '&venueId=' + window.venueId
    };
  },
  methods: {
    deleteAuth() {
      this.$http.delete('./auth'+ '?tenantId=' + window.tenantId + '&venueId=' + window.venueId).then(r => {
        this.$http.get('./auth/channel'+ '?tenantId=' + window.tenantId + '&venueId=' + window.venueId).then(r => {
          console.log(r);
          this.channel = r.body.channel;
        }, e => console.log(e));
      }, e => console.log(e));
    },
    save() {
      this.$store.dispatch('save');
    },
  },
  mounted() {
    window.addEventListener('focus', e => {
      this.$http.get('./auth/channel'+ '?tenantId=' + window.tenantId + '&venueId=' + window.venueId).then(r => {
        this.channel = r.body.channel;
      }, e => console.log(e));
    });
  }
}
</script>

<style>
</style>
