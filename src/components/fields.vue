<template>
    <ul class="list-group col-md-6 full-height">
        <li class="list-group-item"><h5 class="text-muted">Configure Notification Content</h5></li>
        <li class="list-group-item" v-for="field in fields" :key="field.id">
            <div class="form-group row">
              <label class="col-3 col-form-label" :for="field.title">Label</label>
              <input class="form-control col-7" :name="field.title" :value="field.title" @input="e => updateTitle(e.target.value, field.id)" :key="field.id">
              <a class="trash-button absolute top-right" @click="e => removeField(field.id)"><i class="demo-icon icon-trash"></i></a>
            </div>
            <div class="row">
              <label class="col-3 col-form-label" for="value">Value</label>
              <select class="form-control col-7" name="value" @input="e => updateValue(e.target.value, field.id)">
                  <option v-for="option in options" 
                      :value="option"
                      v-bind:key="option"
                      :selected="field.value === option ? 'selected' : false">
                      {{ option }}
                  </option>
              </select>
            </div>
        </li>
        <li class="list-group-item">
            <a class="btn btn-outline-primary btn-sm btn-block" href="#" @click="addField">Add</a>
        </li>
    </ul>
</template>

<script>
import { mapGetters } from 'vuex';
import Options from '../options';

export default {
    computed: {
        fieldIds() {
            return Object.keys(this.$store.state.fields);
        },
        fields() {
            return this.$store.state.fields;
        },
        options() {
            return Options;
        }
    },
    methods: {
        updateTitle(title, id) {
            this.$store.dispatch('updateFieldTitle', {id, title});
        },
        updateValue(value, id) {
            this.$store.dispatch('updateFieldValue', {id, value});
        },
        addField() {
            this.$store.dispatch('addField', {
                field: {
                    id: -1,
                    title: "",
                    value: ""
                }
            });
        },
        removeField(id) {
            this.$store.dispatch('removeField', { id });
        }
    }
};
</script>

<style>

</style>
