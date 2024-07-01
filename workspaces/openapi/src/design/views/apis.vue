<template>
    <div :class="$style.container" style="height: 618px">
        <HeaderLine :menuIndex="1" />
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
                            <el-form label-position="left" :inline="true" class="demo-table-expand">
                                <el-form-item label="Description">
                                    <span>{{ props.row.description }}</span>
                                </el-form-item>
                                <el-form-item label="Parameters">
                                    <span>{{ props.row.parameters }}</span>
                                </el-form-item>
                                <el-form-item label="Responses">
                                    <span>{{ props.row.responses }}</span>
                                </el-form-item>
                            </el-form>
                        </template>
                    </el-table-column>
                    <el-table-column label="ID" prop="id" width="100">
                    </el-table-column>
                    <el-table-column label="Method" prop="method" width="100">

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
                    <el-table-column label="Operation" width="120">
                        <template slot-scope="props">
                            <el-button size="small" type="primary" @click="toDesignNode(props.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </div>
    </div>
</template>

<script>
import SchemaNode from '../components/schema/SchemaNode.vue';
import SchemaNodeType from '../components/schema/SchemaNodeType.vue';
import HeaderLine from '../components/HeaderLine.vue';
 

export default {
    name: 'Demo',
    components: {
        SchemaNode,
        SchemaNodeType,
        HeaderLine
    },
    data() {
        return {

            designTypes: [
                { value: "document", label: 'Document' },
                { value: "schema", label: 'Schema' },
            ],
            formSchema: null,
            formData: null,

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
                    }
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

        isMethod(row, method) {
            return row.method?.toLowerCase() == method
        },
        toDesignNode(row) {
            console.log(row);
            this.$router.push({
                name: "design",
                query: {
                    action: "API",
                    document: this.storage.name,
                    method: row.method,
                    path: row.path
                }
            })
        },
        getPrefix(type) {
            type = type ? type : this.storage.type
            return `_${type}_`
        },

        getName(name, type) {
            name = name ? name : this.storage.name
            return this.getPrefix(type) + name;
        },
        handleMenuChange(key) {
            let menu = this.menus[key]
            this.$router.push(menu.link)
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
