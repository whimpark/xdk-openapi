<template>
  <div class="tx-field-input  tx-field">
    <div class="tx-field-input__label  tx-field-label" v-if="label">{{label}}</div>
    <el-input v-model.trim="entity[name]" :placeholder="placeholder" @keyup.enter.native="$emit('done')"></el-input>
  </div>
</template>

<script>
export default {
  props: {
    entity: {
      type: Object,
      default: () => {
        return {};
      }
    },

    name: {
      type: String,
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    }
  },
  data() {
    return {};
  }
};
</script>


<style lang="scss">
.tx-field-input {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  &__label {
    white-space: nowrap;
    margin: 0px 10px;
  }
}
</style>


