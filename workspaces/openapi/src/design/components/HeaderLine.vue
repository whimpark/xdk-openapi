<template> 
        <div :class="$style.head">
            <div :class="$style.logo">
                OpenAPI
            </div>
            <el-menu :default-active="menuIndex" :class="$style.menu" mode="horizontal" @select="handleMenuChange"
                text-color="#333" active-text-color="#2b9939">
                <el-menu-item :index="menu.index" v-for="menu in menus" :key="menu"> 
                    {{ menu.name }} 
                </el-menu-item>
            </el-menu>
        </div>  
</template>

<script>
 
const NODE_BASE = 1

export default {
    name: 'header',
    components: { 
    },
    props:{
        menuIndex: {
            type: Number,
            default: 0
        }
    },
    data() {
        return { 
            menuIndex: 0,

            menus: [
                { index: 0, name: 'Design', link: {name:"design"} },
                { index: 1, name: 'APIS' , link: {name:"apis"} },
                { index: 2, name: 'Examples' , link: {name:"examples"} },
            ], 
        };
    },
    computed: { 
    },
    watch: { 
    },
    created() {
         
    },
    methods: { 
        handleMenuChange(key) {
            if(key!=this.menuIndex){
                let menu=this.menus[key]  
                this.$updateRuntime("query", "action", "Menu")
                this.$router.push(menu.link)
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
