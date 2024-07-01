<template>
    <div class="schema-add-property">
        <schema-node-type :entity="newProperty" label="添加属性" />
        <el-input v-model="newProperty.property" size="small"></el-input>
        <el-button size="small" type="primary" @click="addProperty()">确定</el-button>

    </div>
</template>

<script>


import SchemaNodeType from './SchemaNodeType.vue';
export default {
    name: 'SchemaAppProperty',
    components: {
        SchemaNodeType
    },
    props: {
    },
    data() {
        return {
            newProperty: {
                type: "string",
                property: ""
            }
        };
    },
    computed: {

    },
    watch: {

    },
    created() {
    },
    methods: {
        addProperty() {
            this.$emit("add", this.newProperty)
        },

    }
};
</script>

<style >
.schema-add-property {
    display: flex;
    align-items:center;
    border-top: 1px solid #EBEEF5;
    padding-top: 10px;

}

.schema-add-property .el-form-item {
    margin-bottom: 0px;
}

 

</style>
