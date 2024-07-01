<template>
    <div class="schema-node-object">
        <el-form-item :label="propertyKey" v-for="propertyKey in Object.keys(formSchema.properties)" :key="propertyKey">
            <el-button size="small" @click="editProperty(propertyKey, index)"
                v-if="['object', 'array'].indexOf(formSchema.properties[propertyKey].type) >= 0">编辑</el-button>
            <el-input v-model="parent[field][propertyKey]" size="small" v-else></el-input> 
            <el-button type="danger" @click="deleteProperty(propertyKey, index)" size="small"  >删除</el-button>
        </el-form-item>
    </div>
</template>

<script>
 
export default {
    name: 'SchemaNodeObject',
    components: {},
    props: {
        formSchema: {
            type: Object,
            default: () => {
                return {};
            }
        }, 
        parent: {
            type: Object,
            default: () => {
                return {};
            }
        },
        field: {
            type: String,
            default: ""
        },
        index: {
            type: Object,
            default: 0
        },


    },
    data() {
        return {


        };
    },
    computed: {

    },
    watch: {

    },
    created() { 
    },
    methods: {
 
        deleteProperty(propertyKey, index) { 
            this.$emit("delete", propertyKey, index)
        },

        editProperty(propertyKey, index) {
            this.$emit("edit", propertyKey, index)
        },    
       
    }
};
</script>

<style >
.schema-node-object .el-form-item__content {

    display: flex;
    justify-content: left;
    align-items: center;
    padding-left:10px;

}
 
.schema-node-object .el-input { 
    width: auto;
} 


</style>
