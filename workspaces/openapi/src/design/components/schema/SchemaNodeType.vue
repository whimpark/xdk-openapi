<template>
    <el-form-item :label="label">
        <el-select v-model="entity[field]" size="small"  filterable @change="handleNodeTypeChange()"
            style="margin-left: 10px;width: 130px;">
            <el-option-group label="Basic Schema" key="basic">
                <el-option :value="item" v-for="(item) in Object.keys(schemas)" :label="item" :key="item" />
            </el-option-group>

            <el-option-group label="Define Schema" key="define">
                <el-option :value="item" v-for="(item) in storage.list" :label="item"  :key="item" />
            </el-option-group>
 
        </el-select>
    </el-form-item>
</template>

<script>
import DESIGN from "../../data/schemas.json"

export default {
    name: 'SchemaNodeType',
    components: {},
    props: {
        entity: {
            type: Object,
            default: () => {
                return {};
            }
        },
        field: {
            type: String,
            default: "type"
        },
        label: {
            type: String,
            default: "类型"
        },

    },
    data() {
        return {
            schemas: DESIGN.schemas,

            storage: {
                type: "document",
                name: "",
                list: [],
                openapis: {}
            },
        };
    },

    created() {
        this.listSchema();
    },
    methods: {
        getPrefix() {
            return "_schema_"
        },
        listSchema() {
            var local = window.localStorage;
            let keys = Object.keys(local);
            let names = []
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key.indexOf(this.getPrefix()) == 0) {
                    names.push(key.replace(this.getPrefix(), ""))
                }
            }
            this.storage.list = names;
        },
        handleNodeTypeChange() {
            this.$emit("change", this.entity[this.field])
        }
    }
};
</script>

<style module></style>
