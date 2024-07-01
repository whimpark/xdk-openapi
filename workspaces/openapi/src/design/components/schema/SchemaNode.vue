<template>
    <div>
        <el-form label-width="auto" style="max-width: 600px">
            <schema-node-type :entity="formSchema" label="节点类型" @change="handleChangeType(formSchema)" />
            
            <div v-if="formSchema?.type == 'object'">
                <schema-node-object :formSchema="formSchema" :parent="parent"  :field="field" @edit="editProperty"
                    @delete="deleteProperty" />
                <schema-add-property @add="addProperty" />
            </div>
            <div v-else-if="formSchema?.type == 'array'">
                <schema-node-type :entity="formSchema.items" label="元素类型" @change="handleChangeType(formSchema, formSchema.items)" />
                <el-button type="primary" size="small" @click="addElement">添加元素</el-button>
                <div v-if="isObjectType(formSchema.items.type)">
                    <div :class="$style.box" v-for="(item, di) in parent[field]" :key="item">
                        <schema-node-object :formSchema="formSchema.items" :parent="parent[field]"  :field="di"  :index="di" @edit="editProperty"
                            @delete="deleteProperty" />
                        <div :class="$style.buttonBox">
                            <el-link type="danger" @click="parent[field].splice(di, 1);" size="small">删除</el-link>
                        </div>
                    </div>
                    <schema-add-property @add="addProperty" />
                </div>
                <div v-else-if="isArrayType(formSchema?.items.type)">
                    <div :class="$style.box" v-for="(item, di) in parent[field]" :key="di">
                        <el-link>数组元素 [{{ di }}] </el-link>
                        <el-button @click="editProperty(di, di)" size="small">编辑</el-button>
                        <el-button type="danger" @click="parent[field].splice(di, 1);" size="small">删除</el-button>
                    </div>
                </div>
                <div v-else>
                    <div :class="$style.box" v-for="(item, di) in parent[field]" :key="di">
                        <el-input size="small" v-model="parent[field][di]"></el-input>
                        <el-button type="danger" @click="parent[field].splice(di, 1);" size="small">删除</el-button>
                    </div>
                </div>
            </div>
            <div v-else>
                <div  :class="$style.box" >
                    <el-input size="small" v-model="parent[field]" v-if="parent"></el-input> 
                    <el-button type="primary" @click="parent[field]=null;" size="small">设置空值</el-button>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script>
import SchemaNodeType from './SchemaNodeType.vue';
import SchemaNodeObject from './SchemaNodeObject.vue';
import SchemaAddProperty from './SchemaAddProperty.vue';

import DESIGN from "../../data/schemas.json"

export default {
    name: 'SchemaNode',
    components: {
        SchemaNodeType,
        SchemaNodeObject,
        SchemaAddProperty
    },
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
        getDesignSchemaByType(type) {
            if (DESIGN.schemas[type]) {
                return this.clone(DESIGN.schemas[type])
            } else {
                let content = this.loadContent(type, true, "schema"); 
                return this.clone(content)
            }
        },
        handleChangeType(schema, items) { 
            this.$emit("changeType", schema, items)
        },
 
        isObjectType(type) {
            return type == 'object'
        },
        isArrayType(type) {
            return type == 'array'
        },
        isRedirectType(type) {
            return ['object', 'array'].indexOf(type) >= 0;
        },
        addProperty(newProperty) {
            this.$emit("add", newProperty)
        },
        editProperty(propertyKey, index) {
            this.$emit("edit", propertyKey, index)
        },
        deleteProperty(propertyKey, index) {
            this.$emit("delete", propertyKey, index)
        },
        clone(o) {
            return JSON.parse(JSON.stringify(o));
        },

        addElement() {
            let type = this.formSchema.items.type

            let design = this.getDesignSchemaByType(type)

            if (type == 'object') {
                Object.keys(this.formSchema.items.properties).forEach(name=>{
                    const property = this.formSchema.items.properties[name]
                    const propertyDesign=this.getDesignSchemaByType(property.type)
                    design.data[name] = propertyDesign.data; 
                }) 
            } 
            if(!this.parent[this.field]){
                Vue.set(this.parent, this.field, [])
            }
            Vue.set(this.parent[this.field], this.parent[this.field].length, design.data)
        },  
    }
};
</script>

<style module>
.box {
    display: flex;
    margin: 10px 0px;
    padding: 10px 10px;
    border: 1px solid #eee;

}

.buttonBox{
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
</style>
