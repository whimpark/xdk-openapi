<template>
    <div :class="$style.container" style="height: 618px">
        <HeaderLine :menuIndex="2" />
        <div :class="$style.box">
            <div :class="$style.headerLine">
                <div :class="$style.headerMain">
                    <span>Doucment: </span>
                    <el-select v-model="storage.name" size="small" @change="loadDesign()">
                        <el-option :value="item" v-for="item in storage.list" :key="item" :label="item" />
                    </el-select>
                    <el-button size="small" type="primary" @click="loadDesign(null, true)">刷新</el-button>
                </div>
                <div :class="$style.headerButtons">
                </div>

            </div>
            <el-row :gutter="25">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <div v-for="item in  Object.keys(props.row.examples)" :key="item">

                                {{ item }}
                                <div :class="$style.exampleTitle">
                                    Parameters 
                                    <el-link size="small" type="primary" @click="toExampleNode(props.row.examples[item], 'parameters')">编辑</el-link>
                                </div>
                                <div :class="$style.exampleValue">
                                    {{ JSON.stringify(props.row.examples[item].parameters) }}
                                </div>
                                <div :class="$style.exampleTitle">RequestBody 
                                    <el-link size="small" type="primary" @click="toExampleNode(props.row.examples[item], 'requestBody')">编辑</el-link>
                                </div>
                                <div :class="$style.exampleValue">
                                    {{ JSON.stringify(props.row.examples[item].requestBody) }}
                                </div>
                                <div :class="$style.exampleTitle">ResponseBody 
                                    <el-link size="small" type="primary" @click="toExampleNode(props.row.examples[item], 'responses')">编辑</el-link>
                                </div>
                                <div :class="$style.exampleValue">
                                    {{ JSON.stringify(props.row.examples[item].response) }}
                                </div>

                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="ID" prop="id" width="100">
                    </el-table-column>
                    <el-table-column label="Method" prop="method" width="200">

                        <template slot-scope="props">
                            <el-tag v-if="isMethod(props.row, 'get')" type="success">GET</el-tag>
                            <el-tag v-if="isMethod(props.row, 'post')" type="success">POST</el-tag>
                            <el-tag v-if="isMethod(props.row, 'put')" type="success">PUT</el-tag>
                            <el-tag v-if="isMethod(props.row, 'delete')" type="success">DELETE</el-tag>
                            <el-tag v-if="isMethod(props.row, 'options')" type="success">OPTIONS</el-tag>
                            <el-tag v-if="isMethod(props.row, 'head')" type="success">HEAD</el-tag>
                        </template>

                    </el-table-column>
                    <el-table-column label="Path" prop="path">
                    </el-table-column>
                    <el-table-column label="Summary" prop="summary">
                    </el-table-column>
                    <el-table-column label="Operation" width="180">
                        <template slot-scope="props">
                            <el-button size="small" type="primary" @click="toAPINode(props.row)">编辑</el-button>
                            <el-button size="small" type="primary"
                                @click="addExampleConfirm(props.row)">新建</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </div>
    </div>
</template>

<script>
import EditorHeader from '../common/components/EditorHeader.vue';
import CodeEditor from '../common/components/CodeEditorV2';
import SchemaNode from '../components/schema/SchemaNode.vue';
import SchemaNodeType from '../components/schema/SchemaNodeType.vue';
import HeaderLine from '../components/HeaderLine.vue';

const NODE_BASE = 1

export default {
    name: 'Demo',
    components: {
        SchemaNode,
        CodeEditor,
        EditorHeader,
        SchemaNodeType,
        HeaderLine
    },
    data() {
        return {
            schema: null,
            formData: null,

            rename: "", 
            currentFormSchema: {},
            currentFormData: {},
            currentFormDataParent: {},
        };
    },
    computed: {

        tableData() {
            let paths = this.formData?.root?.paths;
            if (!paths) {
                return []
            }
            let rows = []
            let pathKeys = Object.keys(paths)
            for (let pki = 0; pki < pathKeys.length; pki++) {
                const pathKey = pathKeys[pki]
                const path = paths[pathKey];
                if (!path) continue;
                let methodKeys = Object.keys(path)
                for (let mki = 0; mki < methodKeys.length; mki++) {
                    const methodKey = methodKeys[mki];
                    const method = path[methodKey];
                    if (!method) continue;
                    let api = {
                        id: method.operationId,
                        method: methodKey,
                        path: pathKey,
                        summary: method.summary,
                        description: method.description,
                        parameters: method.parameters,
                        responses: method.responses,
                        requestBody: method.requestBody,
                    }
                    api.examples = this.getExamples(api);
                    rows.push(api)
                }
            }
            return rows
        },

    },
    watch: {
        $route() {
            this.initData();
        }
    },
    created() {
        this.$initQuery();
        this.initData();
    },
    methods: {
        getExamples(row) {
            let examples = {}
            let _this = this
            // parameters
            console.log(row);
            console.log(row.parameters);
            if(row.parameters){
                for (let pi = 0; pi < row.parameters.length; pi++) {
                    const p = row.parameters[pi];
                    _this.$keys(p.examples).forEach(e => {
                        if (!examples[e]) examples[e] = {}
                        if (!examples[e].parameters) examples[e].parameters = []
                        examples[e].parameters.push({
                            name: p.name,
                            in: p.in,
                            value: p.examples[e]
                        })
                        if(!examples[e].nodes){ examples[e].nodes={} }
                        examples[e].nodes.parameters=["nodes", "root","paths",row.path,row.method,"parameters",pi,"examples",e]
                    })
                }
            }

            // request
            _this.$keys(row.requestBody?.content)?.forEach(m => {
                let media = row.requestBody?.content[m]
                _this.$keys(media.examples).forEach(e => {
                    if (!examples[e]) examples[e] = {}
                    if (!examples[e].requestBody) examples[e].requestBody = {}
                    examples[e].requestBody = media.examples[e]
                    
                    if(!examples[e].nodes){ examples[e].nodes={} }
                    examples[e].nodes.requestBody=["nodes","root","paths",row.path,row.method,"requestBody","content",m,"examples",e]
                })
            })
            // response
            _this.$keys(row.responses)?.forEach(status => {
                let content = row.responses[status]?.content
                _this.$keys(content).forEach(m => {
                    let media = content[m]
                    _this.$keys(media.examples).forEach(e => {
                        if (!examples[e]) examples[e] = {}
                        if (!examples[e].response) examples[e].response = {}
                        examples[e].response = media.examples[e]

                        if(!examples[e].nodes){ examples[e].nodes={} }
                        examples[e].nodes.responses=["nodes","root","paths",row.path,row.method,"responses",status,"content",m,"examples",e]
                    })
                })
            })
            console.log("examples", examples);
            return examples;
        },

        addExampleByRow(exampleName, row) {
            let  paramExample={}, requestExample, responseExample; 
            if(row.parameters){
                for (let pi = 0; pi < row.parameters.length; pi++) {
                    const p = row.parameters[pi];
                    paramExample[p.name]=""
                }
            }
            requestExample={
                content: {
                    "application/json": { 
                    }
                }
            }
            responseExample={
                "200": {
                    content: {
                        "application/json": { 
                        }
                    }
                }
            }

            this.addExample(exampleName, row.path, row.method, paramExample, requestExample, responseExample)
        },

        addExample(exampleName, path, method, parameters, requestBody, responses) {

            let _this = this
            if (!path || !method) return



            let paths = this.formData?.root?.paths;

            if (!paths || !paths[path] || !paths[path][method]) return


            console.log("paths", paths);

            let row = paths[path][method]
            //parameters
            _this.$keys(parameters).forEach(epn => {
                row.parameters?.forEach(p => {
                    if (p.name == epn) {
                        Vue.set(p.examples, exampleName, parameters[p.name])
                    }
                })
            })
            // request
            _this.$keys(requestBody.content).forEach(emn => {
                if (!row.requestBody) { Vue.set(row, requestBody, {}); }
                if (!row.requestBody.content) { Vue.set(row.requestBody, content, {}); }
                if (!row.requestBody.content[emn]) { Vue.set(row.requestBody.content, emn, {}); }
                if (!row.requestBody.content[emn].examples) { Vue.set(row.requestBody.content[emn], examples, {}); }
                Vue.set(row.requestBody.content[emn].examples, exampleName, requestBody.content[emn]);
            })
            // response
            _this.$keys(responses).forEach(estatus => {
                if (!row.responses) { Vue.set(row, responses, {}); }
                if (!row.responses[estatus]) { Vue.set(row.responses, estatus, {}); }
                _this.$keys(responses[estatus]?.content)?.forEach(emn => {
                    if (!row.responses[estatus].content) { Vue.set(row.responses[estatus], content, {}); }
                    if (!row.responses[estatus].content[emn]) { Vue.set(row.responses[estatus].content, emn, {}); }
                    if (!row.responses[estatus].content[emn].examples) { Vue.set(row.responses[estatus].content[emn], examples, {}); }
                    Vue.set(row.responses[estatus].content[emn].examples, exampleName, responses[estatus].content[emn])
                })
            })

            this.$nextTick(e => {
                let design = this.analyseDesignFromData(row) 
                this.formNodes = ["nodes", "root", "paths", path, method]
                let currentSchema=this.getFormSchemaNode(3, this.schema)
                currentSchema.properties[method]=design.schema.properties.root
                this.saveDesign(this.storage.name);
            })
        },

        saveDesign(name) {
            let originName = name
            name = this.getName(name)
            this.storage.openapis[name] = {
                "schema": this.schema,
                "data": this.formData
            }
            this.saveContent(name, this.storage.openapis[name])
            this.loadDesign(originName, true, true)
        },

        saveContent(name, design) {
            var local = window.localStorage;
            local[name] = JSON.stringify(design)
        },

        analyseSchemaFromData(schema, data, property) {
            let schemaType = this.$getType(data)
            let schemaDesign = this.$getDesignByType(schemaType)
            let propertyValue = data[property]
            let propertyType = this.$getType(propertyValue)
            let propertyDesign = this.$getDesignByType(propertyType)
 
            // schemaType
            schema.type = schemaType
            if (schemaType == "object") {
                if (!schema.properties) { schema.properties = {} }
                schema.properties[property] = propertyDesign.schema
                this.$handlePropertiesOrder(schema, property)
            } else if (schemaType == "array") {
                schema.items = propertyDesign.schema
            }

            if (!propertyValue) { return schema; }

            // propertyType
            let currentSchema = (schemaType == "object") ? schema.properties[property] : schema.items
            if (propertyType == "object") {
                this.$keys(propertyValue).forEach(key => {
                    this.analyseSchemaFromData(currentSchema, propertyValue, key)
                })
            } else if (propertyType == "array") {
                if (propertyValue.length > 0) {
                    for (let pi = 0; pi < propertyValue.length; pi++) {
                        this.analyseSchemaFromData(currentSchema, propertyValue, pi)
                    }
                }
            } 
            return schema;
        },

        analyseDesignFromData(data) {
            let schemaRoot = {}
            let dataRoot = {
                root: data
            }
            this.analyseSchemaFromData(schemaRoot, dataRoot, "root") 
            return { schema: schemaRoot, data: dataRoot };
        },


        isMethod(row, method) {
            return row.method?.toLowerCase() == method
        },
        toAPINode(row) {
            console.log(row);

            this.$updateRuntime("query", "document", this.storage.name)
            this.$updateRuntime("query", "action", "API")  
            this.$updateRuntime("query", "nodes",  ["nodes","root","paths", row.path, row.method]) 
            this.$router.push({ name: "design" })

        },
        toExampleNode(example, type) {
            console.log(example, type);
            
            this.$updateRuntime("query", "document", this.storage.name)
            this.$updateRuntime("query", "action", "Example")
            this.$updateRuntime("query", "nodes",  example.nodes[type]) 
            this.$router.push({ name: "design"  })
        },

        

        getPrefix(type) {
            type = type ? type : this.storage.type
            return `_${type}_`
        },

        getName(name, type) {
            name = name ? name : this.storage.name
            return this.getPrefix(type) + name;
        },

        listDesign(name) {
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
            if (names.length > 0) {
                if (!name) {
                    this.storage.name = names[0]
                }
            } else {
                this.storage.name = ""
            }
            if (this.storage.name) {
                this.loadDesign(this.storage.name);
            }
        },


        loadContent(name, force, type) {
            name = this.getName(name, type)
            var local = this.storage.openapis;
            if (force || !local[name]) {
                if (!window.localStorage[name]) {
                    console.log("No content!");
                    return null
                } else[
                    local[name] = JSON.parse(window.localStorage[name])
                ]
            }
            return local[name]
        },


        loadDesign(name, force, keepNodeIndex) {
            let originName = name
            let content = this.loadContent(name, force)
            console.log("loadDesign:content", content);
            this.schema = content?.schema
            this.formData = content?.data
            if (originName) {
                this.storage.name = originName;
            }
            this.rename = this.storage.name;

            this.$updateRuntimeDocument()
        },

        addExampleConfirm(row) {
            this.$prompt('请输入Example名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                closeOnClickModal: false,
                inputValue: ""+new Date().getTime(),
                inputPattern: null,
                inputErrorMessage: '请输入Example名称'
            }).then(({ value }) => {
                this.addExampleByRow(value, row)
                this.$message({ type: 'success', message: '添加成功' });
            }).catch((ex) => {
                console.log(ex);
                this.$message({ type: 'info', message: '操作取消' });
            });

        },

        initData() {
            this.listDesign(this.storage.name);
        },



    }
};
</script>

<style module>
.btns {
    display: flex;
    align-items: center;
    justify-content: center;
}

.box {
    padding: 0 15px;
}

.headerLine {
    display: flex;
    padding: 15px 0 20px;

    :global {

        .el-select {
            margin-right: 20px;
        }

        .el-button {
            margin-left: 5px;
        }
    }
}


.headerMain {
    flex: 100;
}

.headerButtons {}



.linkItem {
    margin-right: 8px;
    margin-top: 8px;
    margin-left: auto !important;
}

.middleBox {
    :global {
        .el-card {
            border-top: none;
            overflow: visible;
        }

        .el-card__header {
            border-top: 1px solid #EBEEF5;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: bold;
            background: #FFFFFF;
            z-index: 3;
        }
    }
}

.middleBox_form {
    position: sticky;
    top: 0;
}

.formBox {
    max-height: calc(100vh - 40px);
    overflow: auto !important;

    :global .el-card__header {
        position: sticky;
        top: 0;

        a {
            font-size: 14px;
            font-weight: bold;
        }

        span {
            margin: 3px 1px;
        }
    }
}


.currentText {
    margin-left: 20px;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: #2b9939;
    padding: 0px 20px;
}

.head {

    display: flex;
    align-items: center;

    border-bottom-width: 1px;
    border-bottom: 1px solid #eee;
    box-shadow: 0 0 8px 1px rgba(200, 200, 200, 0.5);
}

.container {
    :global {
        .container {
            height: 100%;
        }
    }
}

.designType {
    width: 120px;
}

.exampleTitle {
    padding-left: 20px;
    font-weight: bold;
}

.exampleValue {
    padding-left: 20px;
    color: #2b9939;
}

.box,
.head {

    :global {
        .el-menu.el-menu--horizontal {
            border-bottom: 0px solid #eee;
        }

        .el-menu--horizontal>.el-menu-item.is-active {
            border-bottom-width: 3px;
        }

        .el-menu--horizontal>.el-menu-item {
            padding-left: 15px;
            padding-right: 15px;
            margin: 0px 0px;
            height: 54px;
            line-height: 54px;
        }
    }

    .menuLink {
        display: flex;
        align-items: center;
        text-decoration: none;
    }

    .menuIcon {
        position: absolute;
        left: -8px;
        font-size: 14px;
        margin-right: 0;
        color: #666666;
    }
}
</style>
