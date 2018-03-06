<template>
    <li class="list-group-item">
      <div class="row align-items-center">
        <label class="col-5 col-form-label" :for="this.label">{{ this.title }}</label>
        <input class="form-control form-control-sm col-6" :type="inputType"
                :value="value"
                @input="updateValue"
                min="0"
                max="1440">
      </div>
    </li>
</template>

<script>
export default {
    props: ['label', 'title', 'type'],
    computed: {
        inputType() {
            return this.type ? this.type : 'text';
        },
        value() {
            return this.$store.state[this.label]
        }
    },
    methods: {
        updateValue(e) {
            this.$store.dispatch('updateItem', { key: this.label, value: e.target.value });
        }
    }
};
</script>

<style>
</style>
