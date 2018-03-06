<template>
  <div id="events">
  </div>
</template>

<script>
export default {
  computed: {
    Events() {
      return Object.keys(this.$store.state.fields);
    }
  },
  methods: {
    setEvents() {
        this.$store.dispatch('updateFieldTitle', {id, title});
    }
  }
};
</script>

<style>

</style>