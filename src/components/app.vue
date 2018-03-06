<template>
  <div id="app" class="container-fluid">
    <Auth></Auth>
    <div class='card mt-3'>
      <div class="card-header d-flex flex-row justify-content-between align-items-center">
        <h3>Settings</h3>
        <div class="buttons">
          <a href="#" :class="saveButtonClass" @click="save">Save</a>
          <a href="#" class="btn" @click="load">Reset</a>
        </div>
      </div>
      <div class="card-body row full-height">
        <ul class="list-group col-md-6 full-height pl-3">
          <li class="list-group-item">
            <h5 class="text-muted">Personalize Notification</h5>
          </li>
          <Item label="pretext" title="Post Message"></Item>
          <Item label="title" title="Inner Message"></Item>
          <Item label="fallback" title="Notification Message"></Item>
          <Item label="color" title="Color" type="color"></Item>
          <Item label="timeout" title="User Presence Timeout" type="number"></Item>
        </ul>
        <Fields></Fields>
      </div>
    </div>
  </div>
</template>

<script>
import Item from './item.vue';
import Fields from './fields.vue';
import Auth from './auth.vue';

export default {
  components: {
    Item,
    Fields,
    Auth
  },
  computed: {
    saveButtonClass() {
      if (this.$store.state.changed) {
        return "btn btn";
      } else {
        return "btn btn-success";
      }
    }
  },
  methods: {
    save() {
      this.$store.dispatch('save');
    },
    load() {
      this.$store.dispatch('load');
    }
  }
};
</script>

<style>

</style>
