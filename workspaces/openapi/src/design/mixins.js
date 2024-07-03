import Vue from 'vue'

const RUNTIME_KEY = "_runtime_"

import DESIGN from "./data/schemas.json"


const mixin = {
    data() {
        return {
            
            formNodes: ["nodes", 'root'],
            storage: {
                type: "document",
                name: "",
                list: [],
                openapis: {}
            },
        }
    },
    created() {
    },
    methods: {
        $keys(o) {
            return Object.keys(o ? o : {})
        },
        $o(a) {
            return a ? a : {}
        },
        $assign(a, b, c) {
            return Object.assign({}, this.$o(a), this.$o(b), this.$o(c))
        },

        $initQuery() {
            let runtimeQuery = this.$getRuntime("query")
            if (runtimeQuery?.document) {
                this.storage.type = "document"
                this.storage.name = runtimeQuery.document
            }
        },

        $updateRuntimeDocument() {
            if (this.storage.type == 'document') {
                this.$updateRuntime("query", "document", this.storage.name)
            }
        },

        $updateRuntime(type, name, value) {
            let runtime = this.$getRuntime(type)
            runtime[name] = value
            this.$saveRuntime(type, runtime)
        },

        $getRuntime(type, name) {
            let key = RUNTIME_KEY + type;
            let runtime = {};
            try {
                runtime = JSON.parse(window.localStorage[key])
            } catch (ex) {
                console.log(ex);
            }
            return name ? runtime[name] : runtime
        },

        $saveRuntime(type, runtime) {
            let key = RUNTIME_KEY + type;
            window.localStorage[key] = JSON.stringify(runtime)
        },


        $loadContent(name, force, type) {
            name = this.getName(name, type)
            var local = this.storage.openapis;
            if (force || !local[name]) {
                if (!window.localStorage[name]) {
                    console.log("No content!");
                    return null
                } else {
                    local[name] = JSON.parse(window.localStorage[name])
                }

            }
            return local[name]
        },
        $getDesignByType(type) {
            if (DESIGN.schemas[type]) {
                return this.$clone(DESIGN.schemas[type])
            } else {
                let content = this.$loadContent(type, true, "schema");
                let design = {
                    schema: content.schema.properties.root,
                    data: content.data.root
                }
                return this.clone(design)
            }
        },

        $clone(o) {
            return JSON.parse(JSON.stringify(o));
        },

        $getType(v) {
            if (v == null || v == undefined) {
                return "string";
            } else if (Array.isArray(v)) {
                return "array"
            } else {
                return typeof (v)
            }
        },
 
        $handlePropertiesOrder(schema, property) {
            if (!schema["ui:order"]) {
                Vue.set(schema, "ui:order", [property])
            } else {
                if (schema["ui:order"].indexOf(property) < 0) {
                    Vue.set(schema["ui:order"], schema["ui:order"].length, property);
                }
            }
        },


        getFormDataNode(index, formData) {
            if (index < 0) return null;
            let node = formData ? formData : this.formData;
            for (let i = 1; i <= index; i++) {
                console.log("this.formNodes[i]",this.formNodes);
                if (!node) {
                    return null;
                } else {
                    node = node[this.formNodes[i]]
                }
            }
            return node
        },
        getFormSchemaNode(index, schema) {
            let node = schema ? schema : this.schema;
            for (let i = 1; i <= index; i++) {
                if (!node) {
                    return null;
                } else if (node.type == 'object') {
                    node = node.properties[this.formNodes[i]]
                } else if (node.type == 'array') {
                    node = node.items
                }
            }
            return node
        },

    }
}

Vue.mixin(mixin)




