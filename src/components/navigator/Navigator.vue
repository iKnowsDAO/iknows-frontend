<template>
    <div class="navigator-container">
        <nav
            class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top background-color-1100"
            ref="navbarRef"
        >
            <div class="container-fluid">
                <!-- collapse -->
                <div
                    class="collapse adaptation-show-1100"
                    :class="{ show: navbarCollapseExpanded }"
                >
                    <div class="menu">
                        <i
                            class="iconfont icon-menu"
                            v-if="!navbarCollapseExpanded"
                            @click="onMenuExpand(true)"
                        ></i>
                        <i class="iconfont icon-menu-close" v-else @click="onMenuExpand(false)"></i>
                    </div>
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0 pages">
                        <!-- tab -->
                        <li v-for="(item, i) in pages" :key="i">
                            <span
                                @click="chooseTab(i, item)"
                                :class="{
                                    'font-weight-bold': i == pageIndex,
                                    current: i == pageIndex,
                                }"
                            >
                                {{ t(item.text) }}
                            </span>
                        </li>
                        <li>
                            <span
                                @click="onLogin"
                            >
                                {{ t('navbar.login') }}
                            </span>
                        </li>
                    </ul>
                </div>
                <!-- logo -->
                <div class="icon">
                    <div>
                        <img src="@/assets/images/iKnowsText.png" @click="onHome" />
                    </div>
                </div>
                <div class="content adaptation-hidden-1100">
                    <div class="tabs" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0 pages">
                            <!-- tab -->
                            <li v-for="(item, i) in pages" :key="i">
                                <span
                                    @click="chooseTab(i, item)"
                                    :class="{
                                        'font-weight-bold': i == pageIndex,
                                        current: i == pageIndex,
                                    }"
                                >
                                    {{ t(item.text) }}
                                    <!--<div class="underline" v-if="light && i == pageIndex"></div>-->
                                </span>
                            </li>
                        </ul>
                    </div>
                    <!-- Login -->
                    <div class="login" v-if="!signedIn">
                        <div
                            :class="{ zhCn: t(currentLanguage) === '简体中文' }"
                            @click="onLogin"
                        >
                            <div>
                                {{ t('navbar.login') }}
                            </div>
                        </div>
                    </div>
                    <!-- username -->
                    <div class="user" v-else-if="signedIn">
                        <el-dropdown :hide-timeout="80">
                            <span class="username">
                                {{ showedUsername }}
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu class="profile">
                                    <el-dropdown-item @click="toProfile">{{
                                        $t('navbar.user.profile')
                                        }}</el-dropdown-item>
                                    <el-dropdown-item @click="onLogOut">{{
                                        $t('navbar.logout')
                                        }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
                <div class="language">
                    <div>
                        <div class="icon">
                            <i
                                v-if="isEn"
                                class="iconfont icon-language-chinese1"
                                @click="onChangeLanguage"
                            ></i>
                            <i
                                v-else
                                class="iconfont icon-language-english1"
                                @click="onChangeLanguage"
                            ></i>
                        </div>
                        <span
                            @click="onChangeLanguage"
                            class="adaptation-hidden-1615"
                        >
                            {{ t(currentLanguage) }}
                        </span>
                    </div>
                </div>
            </div>
        </nav>
        <el-backtop/>
        <RegisterModal v-if="registerDialogVisible" v-model:dialogVisible=registerDialogVisible  @registerSuccess="getUserInfoFromServices"/>
    </div>
</template>
<script lang="ts" setup>
    import { ref, watch, computed, onMounted, defineProps, defineExpose } from 'vue';
    import { languages, SupportedLocale, t } from '@/locale';
    import { ElBacktop, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus/es';
    import { useRouter } from 'vue-router';
    import { useUserStore } from '@/stores/user'
    import { UserInfoElement } from "@/types/user";
    import { showUsername } from "@/common/utils";
    import { useWallet } from "@/common/wallet";
    import RegisterModal from "./RegisterModal.vue";
    import { getUser } from "@/api/user";
    import { useAuthStore } from "@/stores/auth";

    const userStore = useUserStore();
    const authStore = useAuthStore();
    const router = useRouter();
    const {requestWalletAccess, verifyWalletPermissions, logout, getAddress} = useWallet();
    const props = defineProps({
        // II 认证成功 即 注册成功的回调
        loginInCallback: {
            type: Function,
            required: false,
        },
        loginOutCallback: {
            type: Function,
            required: false,
        }
    });

    const clientReady = ref(false);
    const signedIn = ref(false); // 是否登录
    const registerDialogVisible = ref(false); // 注册弹窗显示
    const address = computed(() => userStore.address);
    const userInfo = computed(() => userStore.user);

    const navbarRef = ref<HTMLElement | null>(null); // 导航栏ref属性
    const screenWidth = ref(document.documentElement.clientWidth); // 当前屏幕宽度
    // const isPageLoaded = ref(false); // 标记页面是否加载完成
    const navbarCollapseExpanded = ref(false); // 响应式折叠内容是否展开
    const onMenuExpand = (expand: boolean) => (navbarCollapseExpanded.value = expand);
    // 导航设置
    const pageIndex = ref(0);
    const pages = ref<{ text: string; action: string }[]>([
        { text: 'navbar.tabs.home', action: '/' },
        { text: 'navbar.tabs.dao', action: '/dao' },
    ]);

    // 多语言设置
    const locale = computed(() => userStore.getLocale);
    const isEn = computed(() => locale.value === SupportedLocale.en);
    // const setLocale = (locale: SupportedLocale) =>
    //     store.dispatch(UserText + '/' + setLocaleText, locale);
    const currentLanguage = computed<string>(
        () => languages.find((i) => i.payload == locale.value)?.title ?? languages[0].title,
    );
    const isCollapsed = computed(() => screenWidth.value < 992); // 小于 992 表示需要折叠导航栏
    const refreshMenu = () => {
        const pathname = location.pathname;
        for (let i = pages.value.length - 1; 0 <= i; i--) {
            if (pages.value[i].action && pathname.startsWith(pages.value[i].action)) {
                if (i == 0 && pages.value[i].action == '/' && pathname != '/') {
                    // 找到首页的标签，但是明明有很多路径，不能被首页的斜线拦截了
                    break;
                }
                pageIndex.value = i;
                return; // 这里直接返回
            }
        }
        pageIndex.value = -1; // 没找到对应的页面，就所有的都不显示选中状态
    };

    onMounted(() => {
        doInitAuth();
        refreshMenu(); // 高亮当前选中的 tab
        // 动态检测宽度
        window.onresize = () => {
            screenWidth.value = document.documentElement.clientWidth;
        };
    });

    const showedUsername = computed<string>(() => {
        if (!signedIn.value) return ''; // 没有登录返回空，按道理显示登录按钮不会调用本方法的
        let name = '';
        if (userInfo.value.name) name = userInfo.value.name;
        return showUsername(name, address.value);
    });

    const chooseTab = (i: number, item: { action: string }) => {
        if (item.action === '') {
            return;
        }
        if (item.action.startsWith('http')) {
            window.open(item.action, '_blank');
        } else {
            router.push(item.action);
        }
    };
    //获取用户信息，并且设置
    const getUserInfoFromServices = async () => {
        console.log("getUserInfoFromServices address.value",address.value)
        await getAddress();
        await getUser(address.value).then(res => {
            if (res.Ok) {
                const user = res.Ok;
                if (user.name !== "") {
                    refreshUserInfo({
                        name: user.name,
                        sui_wallet: user.sui_wallet
                    })
                    signedIn.value = true;
                }
            }else {
                //没有注册自动打开注册框。
                registerDialogVisible.value = true;
            }
        });
    };

    const refreshUserInfo = (UserInfoElement: UserInfoElement) => {
        if (UserInfoElement.name) userInfo.value.name = UserInfoElement.name;
        userStore.setUserInfo(UserInfoElement);
    };

    const toProfile = () => {
        router.push({
            path: '/person/profile/' + address.value,
        });
    }

    const doInitAuth = async () => {
        getUserInfoFromServices();
    };

    const onLogin = async () => {
        console.log("onLogin verifyWalletPermissions",await verifyWalletPermissions())
        //验证是否连接过钱包，有就不用登录
        if (await verifyWalletPermissions()) {
            getUserInfoFromServices()
            return
        }
        //没有连接过再请求钱包连接
        requestWalletAccess('suiWallet').then(res => {
            console.log("requestWalletAccess", res)
            console.log("requestWalletAccess address", address.value)
            getUserInfoFromServices().then(() => {
                if (userInfo.value.name === '') {
                    registerDialogVisible.value = true;
                }
            });
        })
    };

    const onLogOut = async () => {
        logout();
        signedIn.value = false;
    };

    const onChangeLanguage = () => {
        let current = languages.find((i) => i.payload == locale.value)?.payload;
        // console.error('current locale', current);
        if (current != null) {
            let index = languages.map((i) => i.payload).indexOf(current);
            if (index == languages.length - 1) index = -1;
            index++;
            current = languages[index].payload;
        } else {
            current = languages[0].payload;
        }
        // console.error('set locale', current);
        userStore.setLocale(current);
    };

    const onHome = () => router.push('/');

    defineExpose({
        getUserInfoFromServices
    })

</script>
<style lang="scss" scoped>
    .navigator-container {
        background-color: transparent !important;
        color: white;
        width: 100%;
        height: 63px; // 应当和代码里面一致
        /* font-family: RobotoRemote; */
        display: flex;
        justify-content: center;
        align-items: center;
        .navbar {
            margin: 0 auto;
            display: inline-block;
            padding: 0;
            background-color: #ffffff !important;
            box-shadow: 0px 0px 10px 10px rgb(36 51 54 / 5%);
            .container-fluid {
                width: 1200px;
                position: relative;
                padding: 0;
                .adaptation-show-1100 {
                    display: none;
                }
                > .icon {
                    position: absolute;
                    left: -150px;
                    /*top: 52px;*/
                    z-index: 100;
                    > div {
                        /*width: 132px;*/
                        /*height: 32px;*/
                        img,
                        svg {
                            width: 132px;
                            /*height: 32px;*/
                            cursor: pointer;
                        }
                    }
                }
                > .content {
                    height: 63px; // 应当和代码里面一致
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    margin-left: 10px;
                    > div {
                        width: auto;
                        display: inline-block;
                    }
                    .user{
                        line-height: 14px;
                        .username{
                            font-size: 18px;
                        }
                    }
                    > .tabs {
                        display: flex;
                        flex-direction: row;
                        justify-content: flex-end;
                        align-items: center;
                        > ul {
                            display: flex;
                            width: 100%;
                            justify-content: flex-end;
                            > li {
                                display: inline-block;
                                margin-right: 30px;
                                text-align: center;
                                align-items: center;
                                > span {
                                    font-size: 24px;
                                    line-height: 26px;
                                    user-select: none;
                                    cursor: pointer;
                                    position: relative;
                                    font-weight: 500 !important;
                                    color: #333333;
                                    .underline {
                                        position: absolute;
                                        width: calc(100% + 10px);
                                        height: 8px;
                                        top: 34px;
                                        left: -5px;
                                        background: #0fb8e0;
                                        border-radius: 7.5px;
                                    }
                                }
                                > span:hover {
                                    font-weight: bold;
                                }
                                .current {
                                    font-weight: bold;
                                }
                            }
                        }
                    }
                    .login {
                        > div {
                            margin: 0 auto;
                            background: linear-gradient(to right, #2f7dff, 80%, #409eff);
                            border-radius: 4px;
                            width: 114px;
                            height: 40px;
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                            cursor: pointer;

                            > div {
                                font-size: 22px;
                                line-height: 30px;
                                vertical-align: middle;
                            }
                            > img {
                                width: 13px;
                                height: 24px;
                                margin-left: 6px;
                            }
                        }
                        .zhCn {
                            > div {
                                transform: translateY(1px);
                            }
                        }
                    }
                }
                > .language {
                    width: 200px;
                    height: 100%;
                    position: absolute;
                    right: -250px;
                    > div {
                        width: auto;
                        height: 100%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        .icon {
                            width: 24px;
                            height: 24px;
                            transform: translateY(-4px);
                            opacity: 0.8;
                            cursor: pointer;
                            color: #999999;
                            &:hover {
                                opacity: 1;
                            }
                            > i {
                                font-size: 22px;
                            }
                        }
                        > span {
                            text-align: left;
                            line-height: 28px;
                            font-size: 20px;
                            margin-left: 16px;
                            word-wrap: nowrap;
                            opacity: 0.8;
                            cursor: pointer;
                            color: #999999;
                            &:hover {
                                opacity: 1;
                            }
                        }
                    }
                }
            }
        }
        @media screen and (max-width: 1615px) {
            .navbar {
                .container-fluid {
                    > .icon {
                        left: -60px;
                    }
                    .content > .tabs > ul > li {
                        margin-right: 70px;
                    }
                    .language {
                        width: 100px;
                        right: -150px;
                        .adaptation-hidden-1615 {
                            display: none;
                        }
                    }
                }
            }
        }
        @media screen and (max-width: 1480px) {
            .navbar > .container-fluid {
                width: 1100px;
                .content > .tabs > ul > li {
                    margin-right: 60px;
                }
            }
        }
        @media screen and (max-width: 1355px) {
            .navbar > .container-fluid {
                width: 1000px;
                .content > .tabs > ul > li {
                    margin-right: 40px;
                }
                .language {
                    width: 24px;
                    right: -80px;
                }
            }
        }
        @media screen and (max-width: 1200px) {
            .navbar > .container-fluid {
                width: 950px;
                .content > .tabs > ul > li {
                    margin-right: 30px;
                }
                .language {
                    right: -70px;
                }
            }
        }
        @media screen and (max-width: 1150px) {
            .navbar > .container-fluid {
                width: 920px;
                .content > .tabs > ul > li {
                    margin-right: 25px;
                }
            }
        }
        @media screen and (max-width: 1100px) {
            nav.navbar.background-color-1100 {
                background-color: #ffffff !important;
            }
            .navbar > .container-fluid {
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 63px;
                .adaptation-show-1100 {
                    display: block;
                    &.collapse {
                        position: absolute;
                        width: 100%;
                        left: 0;
                        top: 0;
                        display: flex;
                        flex-direction: column;
                        .menu {
                            display: flex;
                            justify-content: flex-start;
                            align-items: center;
                            height: 63px;
                            padding-left: 54px;
                            width: 40px;
                            i {
                                font-size: 22px;
                                cursor: pointer;
                                color: #999999;
                            }
                        }
                        > .navbar-nav {
                            display: none;
                        }
                        &.show {
                            > ul.navbar-nav {
                                display: block;
                                color: black;
                                border-top: 1px solid #00000059;
                                border-bottom: 1px solid #00000059;
                                background-color: #ffffff;
                                width: 100%;
                                padding-top: 10px;
                                padding-bottom: 10px;
                                li {
                                    margin-left: 54px;
                                    margin-right: 54px;
                                    height: 60px;
                                    text-align: left;
                                    border-bottom: 1px solid #00000059;
                                    &:last-child {
                                        border-bottom: none;
                                    }
                                    display: flex;
                                    align-items: center;
                                    > span {
                                        font-size: 26px;
                                        line-height: 26px;
                                        cursor: pointer;
                                        user-select: none;
                                        opacity: 0.8;
                                        color: black;
                                        &.current,
                                        &:hover {
                                            color: #0fb8e0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                .icon {
                    position: static;
                }
                .adaptation-hidden-1100 {
                    display: none !important;
                }
                .language {
                    right: 54px;
                }
            }
        }
        @media screen and (max-width: 450px) {
            .navbar > .container-fluid {
                .adaptation-show-1100.collapse .menu {
                    padding-left: 24px;
                }
                .adaptation-show-1100.collapse.show > ul.navbar-nav li {
                    margin-left: 24px;
                    margin-right: 24px;
                }
                .language {
                    right: 24px;
                }
            }
        }
    }
</style>
