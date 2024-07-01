import Vue from 'vue'

const RUNTIME_KEY = "_runtime_"

const mixin = {
    data() {
        return {
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

    }
}

Vue.mixin(mixin)




