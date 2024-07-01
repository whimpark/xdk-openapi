<template>
    <div :class="$style.container" style="height: 618px">
        <HeaderLine :menuIndex="0" />
        <div :class="$style.box">
            <div :class="$style.headerLine">
                <div :class="$style.headerMain">
                    <span>Design: </span>
                    <el-select v-model="storage.type" size="small" :class="$style.designType" @change="listDesign()">
                        <el-option :value="item.value" v-for="item in designTypes" :key="item.value" :label="item.label" />
                    </el-select>
                    <el-select v-model="storage.name" size="small" @change="loadDesign()">
                        <el-option :value="item" v-for="item in storage.list" :key="item" :label="item" />
                    </el-select>
                    <el-button size="small" type="primary" @click="renameConfirm()">重命名</el-button>
                    <el-button size="small" type="primary" @click="copyDesign()">复制</el-button>
                </div>
                <div :class="$style.headerButtons">
                    <el-button size="small" type="danger" @click="deleteConfirm();">删除</el-button>
                    <el-button size="small" type="primary" @click="loadDesign(null, true)">刷新</el-button>
                    <el-button size="small" type="primary" @click="saveDesign()">保存</el-button>
                </div>

            </div>
            <el-row :gutter="25">
                <el-col :class="$style.middleBox" :span="14">
                    <el-row :gutter="6">
                        <el-col :span="12">
                            <CodeEditor v-model="curSchemaCode" title="Schema" :height="editor.height"></CodeEditor>
                        </el-col>
                        <el-col :span="12">
                            <CodeEditor v-model="curFormDataCode" title="FormData" :height="editor.height"></CodeEditor>
                        </el-col>
                    </el-row>
                </el-col>
                <el-col :class="[$style.middleBox, $style.middleBox_form]" :span="10">
                    <el-card shadow="hover" :class="[$style.card, $style.formBox]">
                        <div slot="header" class="clearfix">
                            <span>
                                <el-link @click="intoNode(formNodes.length - 2)"> 返回上级 </el-link>
                            </span>
                            <span v-for="( formNode, nodei) in curNodes" :key="nodei">
                                <el-link @click="intoNode(nodei + 1)"> &gt; {{
                                    formNode }}</el-link>
                            </span>
                        </div>
                        <schema-node :formSchema="currentFormSchema" :parent="currentFormDataParent"
                            :field="formNodes[formNodes.length - 1]" @edit="editProperty" @add="addProperty"
                            @delete="deleteProperty" @changeType="handleChangeType" />
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import EditorHeader from '../common/components/EditorHeader.vue';
import CodeEditor from '../common/components/CodeEditorV2';
import SchemaNode from '../components/schema/SchemaNode.vue';
import SchemaNodeType from '../components/schema/SchemaNodeType.vue';
import DESIGN from "../data/schemas.json"

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
            ...this.getDefaultSchemaMap(),
            editor: {
                height: "682px",
            },
            menuIndex: 0,

            menus: [
                { index: 0, type: 'document', name: 'Design' },
                { index: 1, type: 'component', name: 'APIS' },
            ],
            designTypes: [
                { value: "document", label: 'Document' },
                { value: "schema", label: 'Schema' },
            ],
            storage: {
                type: "document",
                name: "",
                list: [],
                openapis: {}
            },

            rename: "",
            formNodes: ["nodes", 'root'],
            currentFormSchema: {},
            currentFormData: {},
            currentFormDataParent: {},
        };
    },
    computed: {
        trueFormProps() {
            if (!this.formProps) return {};
            return {
                ...this.formProps,
                labelWidth: this.formProps.labelWidth ? `${this.formProps.labelWidth * 4}px` : undefined
            };
        },
        trueFormFooter() {
            return this.formFooter || {};
        },

        curNodes() {
            return this.formNodes.slice(1);
        },
        curSchemaCode: {
            get() {
                return this.genCodeStrComputedGetter(this.schema.properties.root);
            },
            set(val) {
                try {
                    let editorSchema = {
                        type: "object",
                        properties: {
                            root: val ? JSON.parse(val) : {}
                        }
                    };
                    this.recoverSchema(editorSchema, this.schema)
                    let nodeIndex = this.formNodes.length - 1
                    this.currentFormSchema = this.getFormSchemaNode(nodeIndex)
                } catch (e) {
                    console.log(e);
                }
            }
        },
        curUiSchemaCode: {
            get() {
                return this.genCodeStrComputedGetter(this.uiSchema);
            },
            set(val) {
                return this.genCodeStrComputedSetter('uiSchema', val);
            }
        },
        curFormDataCode: {
            get() {
                return this.genCodeStrComputedGetter(this.formData.root);
            },
            set(val) {
                try {
                    Vue.set(this.formData, "root", val ? JSON.parse(val) : {})
                    let nodeIndex = this.formNodes.length - 1
                    this.currentFormData = this.getFormDataNode(nodeIndex)
                    this.currentFormDataParent = this.getFormDataNode(nodeIndex - 1)
                } catch (e) {
                    console.log(e);
                }
            }
        },
        curErrorSchemaCode: {
            get() {
                return this.genCodeStrComputedGetter(this.errorSchema);
            },
            set(val) {
                return this.genCodeStrComputedSetter('errorSchema', val);
            }
        },
    },
    watch: {
        $route() {
            this.initData();
        }
    },
    created() {
        this.initData();
    },
    methods: {
        getPrefix(type) {
            type = type ? type : this.storage.type
            return `_${type}_`
        },

        getName(name, type) {
            name = name ? name : this.storage.name
            return this.getPrefix(type) + name;
        },
        handleMenuChange(key) {
            // let type = TYPES[parseInt(key)] 
            // this.resetDesign(type, "")
            // this.listDesign(); 

        },

        resetDesign(type, name) {
            this.storage.type = type ? type : this.storage.type
            this.storage.name = name
            this.schema = { type: "object", properties: {} }
            this.formData = {}
            this.currentFormData = this.formData
            this.currentFormDataParent = {}
            this.currentFormSchema = this.schema
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
            this.intoNode(keepNodeIndex ? this.formNodes.length - 1 : NODE_BASE);
            if (originName) {
                this.storage.name = originName;
            }
            this.rename = this.storage.name;

            this.$updateRuntimeDocument()
        },

        cacheDesign(name) {
            name = this.getName(name)
            var local = this.storage.openapis;
            local[name] = {
                "schema": this.schema,
                "data": this.formData
            }
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

        renameContent(rename) {
            if (!rename || rename == this.storage.name) {
                return;
            }
            let originName = name
            let name = this.getName(name)
            this.storage.openapis[name] = {
                "schema": this.schema,
                "data": this.formData
            }
            this.saveContent(this.getName(rename), this.storage.openapis[name])

            this.deleteContent(originName)

            this.storage.name = rename
            this.listDesign(rename)

        },


        renameConfirm() {
            this.$prompt('请输入新名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                closeOnClickModal: false,
                inputValue: this.storage.name,
                inputPattern: null,
                inputErrorMessage: '请输入新名称'
            }).then(({ value }) => {
                this.renameContent(value)
                this.$message({ type: 'success', message: '重命名成功: ' + this.rename });
            }).catch(() => {
                this.$message({ type: 'info', message: '操作取消' });
            });

        },

        copyDesign(name) {
            name = this.getName(name)
            let timestamp = new Date().getTime()
            let newName = this.getName(timestamp);

            this.saveContent(newName, this.storage.openapis[name])

            this.storage.name = timestamp
            this.listDesign(this.storage.name);
        },


        deleteContent(name) {
            name = this.getName(name)
            delete window.localStorage[name]
            delete this.storage.openapis[name]
            this.storage.name = ""
            this.$message({ type: 'success', message: '删除成功!' });
        },


        deleteConfirm(name) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteContent(name)
                this.$message({ type: 'success', message: '删除成功!' });
                this.storage.name = "";
                this.listDesign()
                this.loadDesign()
            }).catch((e) => {
                console.log(e);
                this.$message({ type: 'info', message: '删除出错' });
            });
        },


        removeProperty(o, p) {
            if (o && o.hasOwnProperty(p)) {
                this.$delete(o, p);
            }
        },

        deleteProperty(propertyKey, index) {
            let currentType = this.currentFormSchema.type
            if (currentType == 'object') {

                this.removeProperty(this.currentFormData, propertyKey);
                this.removeProperty(this.currentFormSchema.properties, propertyKey);
                if (this.currentFormSchema["ui:order"]) {
                    let index = this.currentFormSchema["ui:order"].indexOf(propertyKey)
                    this.currentFormSchema["ui:order"].splice(index, 1)
                }
            } else if (currentType == 'array') {

                for (let i = 0; i < this.currentFormData.length; i++) {
                    const element = this.currentFormData[i];
                    this.removeProperty(element, propertyKey);
                }
                this.removeProperty(this.currentFormSchema.items.properties, propertyKey);
                if (this.currentFormSchema.items["ui:order"]) {
                    let index = this.currentFormSchema.items["ui:order"].indexOf(propertyKey)
                    this.currentFormSchema.items["ui:order"].splice(index, 1)
                }
            }
        },


        intoNode(index) {
            if (index < 1) {
                return
            }
            this.formNodes = this.formNodes.slice(0, index + 1)
            this.currentFormData = this.getFormDataNode(index);
            this.currentFormDataParent = this.getFormDataNode(index - 1);
            this.currentFormSchema = this.getFormSchemaNode(index);
        },
        getFormDataNode(index, formData) {
            if (index < 0) return null;
            let node = formData ? formData : this.formData;
            for (let i = 1; i <= index; i++) {
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

        handleUiChange(value) {
            const formatStr = jsonCode => JSON.stringify(JSON.parse(jsonCode));

            this.$router.replace({
                query: {
                    ...this.$route.query,
                    ui: value,
                    schema: formatStr(this.curSchemaCode),
                    formData: formatStr(this.curFormDataCode),
                    uiSchema: formatStr(this.curUiSchemaCode),
                    errorSchema: formatStr(this.curErrorSchemaCode),
                    formFooter: formatStr(JSON.stringify(this.trueFormFooter)),
                    formProps: formatStr(JSON.stringify(this.trueFormProps)),
                }
            });
            window.location.reload();
        },
        sliderFormat(value) {
            return value ? `${value * 4}px` : undefined;
        },
        getDefaultSchemaMap() {
            return {
                schema: {},
                uiSchema: {},
                formData: {},
                errorSchema: {},
                formFooter: {
                    show: true
                },
                formProps: {
                    labelWidth: 25,
                    inline: false,
                    labelPosition: 'top',
                    inlineFooter: false,
                    layoutColumn: 1,
                    // defaultSelectFirstOption: false
                }
            };
        },
        genCodeStrComputedGetter(o) {
            try {
                return JSON.stringify(o, null, 4);
            } catch (e) {
                return "";
            }
        },
        genCodeStrComputedSetter(vmKey, val) {
            try {
                this[vmKey] = val ? JSON.parse(val) : {};
            } catch (e) {
                // 无法解析时不更新数据
                // this[vmKey] = {};
            }
        },
        initData() {
            this.listDesign(this.storage.name);
            this.initAction();
        },
        initAction() {
            let query = this.$route.query;
            let action = query.action;
            if (action && action == "API") {
                let document = query.document
                let path = query.path
                let method = query.method
                this.formNodes = ["nodes", "root", "paths", path, method]
                this.storage.type = "document"
                if (this.storage.list.indexOf(this.getName(document))) {
                    this.loadDesign(document, true, true);
                } else {
                    this.loadDesign(null, true);
                }
            }
        },

        handleFormMounted(formRef) {
            console.log('Ui form component:', formRef);
        },
        handleDataChange() {
            console.log('Data change');
        },
        handleSubmit() {
            console.log('Submit');
        },
        clipboard(value) {
            if (document.execCommand) {
                const input = document.createElement('input');
                document.body.appendChild(input);
                input.setAttribute('value', value);
                input.select();

                document.execCommand('copy');
                document.body.removeChild(input);

                return true;
            }

            this.$message.info(value);
            return false;
        },
        handleCancel() { },
        handlePreview() {
            const formatStr = jsonCode => JSON.stringify(JSON.parse(jsonCode));

            const genRoute = this.$router.resolve({
                query: {
                    ui: this.curVueForm,
                    type: 'Test',
                    schema: formatStr(this.curSchemaCode),
                    formData: formatStr(this.curFormDataCode),
                    uiSchema: formatStr(this.curUiSchemaCode),
                    errorSchema: formatStr(this.curErrorSchemaCode),
                    formFooter: formatStr(JSON.stringify(this.trueFormFooter)),
                    formProps: formatStr(JSON.stringify(this.trueFormProps)),
                }
            });
            const url = `${window.location.origin}${window.location.pathname}${genRoute.href}`;

            if (this.clipboard(url)) {
                this.$message.success('复制预览地址成功');
            }
        },
        editProperty(propertyKey, index) {
            let type = this.currentFormSchema.type
            if (type == 'object') {
                this.currentFormSchema = this.currentFormSchema.properties[propertyKey]
                this.currentFormDataParent = this.currentFormData
                this.currentFormData = this.currentFormData[propertyKey];
                Vue.set(this.formNodes, this.formNodes.length, propertyKey)
            } else if (type == 'array') {
                let itemType = this.currentFormSchema.items.type
                if (itemType == 'object') {
                    this.currentFormSchema = this.currentFormSchema.items.properties[propertyKey]

                    this.currentFormDataParent = this.currentFormData[index]
                    this.currentFormData = this.currentFormData[index][propertyKey];
                    Vue.set(this.formNodes, this.formNodes.length, index)
                    Vue.set(this.formNodes, this.formNodes.length, propertyKey)
                } else if (itemType == 'array') {
                    Vue.set(this.formNodes, this.formNodes.length, index)
                    this.currentFormSchema = this.currentFormSchema.items;
                    this.currentFormDataParent = this.currentFormData
                    this.currentFormData = this.currentFormData[index];
                }
            }
        },

        clone(o) {
            return JSON.parse(JSON.stringify(o));
        },


        recoverSchemaProperties(source, target, properties) {
            source = this.clone(source)
            if (properties) {
                Object.keys(source).forEach(key => {
                    if (properties.indexOf(key) >= 0) {
                        Vue.set(target, key, source[key])
                    }
                });
            }
        },

        recoverSchema(source, target) {
            source = this.clone(source)
            Object.keys(target).forEach(key => { Vue.delete(target, key) });
            Object.keys(source).forEach(key => { Vue.set(target, key, source[key]) });
        },

        getDesignSchemaByType(type) {
            if (DESIGN.schemas[type]) {
                return this.clone(DESIGN.schemas[type])
            } else {
                let content = this.loadContent(type, true, "schema");
                let design = {
                    schema: content.schema.properties.root,
                    data: content.data.root
                }
                return this.clone(design)
            }
        },

        handleChangeType(schema, items) {
            let design = this.getDesignSchemaByType(schema.type)
            let itemsDesign = items ? this.getDesignSchemaByType(items.type) : null

            let nodeIndex = this.formNodes.length - 1;
            let content = this.loadContent(this.storage.name, true);
            let origin = {
                schema: this.getFormSchemaNode(nodeIndex, content["schema"]),
                data: this.getFormDataNode(nodeIndex, content["data"])
            }
            // 标准化schema、恢复原schema属性
            this.recoverSchema(design.schema, schema)
            if (origin.schema) {
                this.recoverSchemaProperties(origin.schema, schema, design.config?.recoverProperties)
            }
            if (items) {
                this.recoverSchema(itemsDesign.schema, schema.items)
                if (origin.schema && origin.schema.items) {
                    this.recoverSchemaProperties(origin.schema.items, schema.items, itemsDesign.config?.recoverProperties)
                }
            }

            // 恢复数据
            let isSameType = (origin.schema?.type) == schema.type
            let newData = isSameType ? (origin.data ? origin.data : design.data) : design.data
            let parent = this.getFormDataNode(nodeIndex - 1)
            let key = this.formNodes[nodeIndex];
            Vue.set(parent, key, newData)
            this.currentFormData = parent[key]
            this.currentFormDataParent = parent


            if (itemsDesign) {
                for (let i = 0; i < this.currentFormData.length; i++) {
                    const e = this.currentFormData[i];
                    this.currentFormData.splice(i, 1, this.clone(itemsDesign.data))
                }
            }


        },

        addProperty(newProperty) {
            let currentType = this.currentFormSchema.type
            if (['object', 'array'].indexOf(currentType) < 0) {
                return;
            }
            let property = newProperty.property
            let type = newProperty.type

            if (property === undefined || property.length == 0) {
                return
            }

            // 处理schema
            let schema = this.currentFormSchema;
            let schemaObject = schema.type == "object" ? schema : schema.items
            Vue.set(schemaObject.properties, property, {})

            let design = this.getDesignSchemaByType(type)
            this.recoverSchema(design.schema, schemaObject.properties[property])
            Vue.set(schemaObject.properties[property], "title", property)
            this.handlePropertiesOrder(schemaObject, property)

            // 处理data
            if (currentType == "object") {
                Vue.set(this.currentFormData, property, this.clone(design.data))
            } else if (currentType == 'array') {
                this.currentFormData.forEach(e => {
                    Vue.set(e, property, this.clone(design.data))
                })
            }

        },

        handlePropertiesOrder(schema, property) {
            if (!schema["ui:order"]) {
                Vue.set(schema, "ui:order", [property])
            } else {
                if (schema["ui:order"].indexOf(property) < 0) {
                    Vue.set(schema["ui:order"], schema["ui:order"].length, property);
                }
            }
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
