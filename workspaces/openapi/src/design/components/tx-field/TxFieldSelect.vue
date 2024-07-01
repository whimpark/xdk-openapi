<template>
  <div class="tx-field-select tx-field">
    <div class="tx-field-select__label  tx-field-label" v-if="label">{{label}}</div>
    <el-select v-model="entity[name]" :placeholder="placeholder" :multiple="multiple" @change="handleChange">
      <el-option :label="o.label" :value="o.value" v-for="(o,i) in newValues" v-bind:key="i" />
    </el-select>
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
    },
    multiple: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => {
        return {
          adapter: o => {
            return o;
          },
          values: []
        };
      }
    }
  },
  data() {
    return {
      newValues: []
    };
  }, 
  watch: {
    "options.values": {
      handler(n, o) { 
        this.translation(n);
      },
      deep: true,
    }
  },
  created() { 
    // this.translation(this.options.values);
    this.newValues=this.$gtmc.translate(this.options.values,this.options.adapter)
  },
  methods: {
    translation(values) { 
      if (values) {
        if (this.options.adapter) {
          values.forEach(element => {
            this.newValues.push(this.options.adapter(element));
          });
        } else {
          this.newValues = values;
        }
      }
    },
    handleChange(values) { 
      this.$emit("change",values)
    },
  },
};
</script>


<style lang="scss">
.tx-field-select {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  &__label {
    margin: 0px 10px;
  }
}
</style>
