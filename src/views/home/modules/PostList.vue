<template>
    <div class="post-list-container" v-infinite-scroll="onScroll">
        <div class="container">
            <div class="post-list">
                <el-row :gutter="20">
                    <el-col :sm="4" :xs="24">
                        <el-menu
                            default-active=""
                            class="left-menu"
                            :mode="isPhone ? 'horizontal' : 'vertical'"
                            @select="handleSelect"
                        >
                            <el-menu-item v-for="(item,index) in category" :index="item.value">{{item.label}}
                            </el-menu-item>
                        </el-menu>
                    </el-col>
                    <el-col :sm="15" :xs="24">
                        <div style="display: flex">
                            <el-input
                                v-model="search"
                                class="search"
                                :placeholder="t('post.help.search')"
                                :prefix-icon="Search"
                                clearable
                            />
                            <el-button type="primary" @click="searchPage()" style="margin-left: 10px">
                                {{t('common.search')}}
                            </el-button>
                        </div>
                        <el-card class="post-card" v-for="(item,inex) in showList"
                                 @click="onClick(item.id.id)">
                            <el-row justify="space-between">
                                <el-col :span="20" class="card-info">
                                    <Avatar :username="item.authorData && item.authorData.name!=='' ?
                                                item.authorData.name : item.author.toString()"
                                            :addressId=item.author.toString()
                                            :clickable="false"
                                            :size="60"/>
                                    <div class="text">
                                        <div class="title">
                                            <span>{{item.title}}</span>
                                            <!--<span class="post-status enable"-->
                                                  <!--v-if="item.status.Enable!==undefined">{{t('common.status.enable')}}</span>-->
                                            <!--<span class="post-status completed"-->
                                                  <!--v-else-if="item.status.Completed!==undefined">{{t('common.status.completed')}}</span>-->
                                            <!--<span class="post-status closed" v-else-if="item.status.Closed!==undefined">{{t('common.status.closed')}}</span>-->
                                        </div>
                                        <div class="info">
                                            <Username :addressId="item.author.toString()"
                                                      :username="item.author_name"/>
                                            <span>|</span>
                                            <!--<span class="createTime">{{getTimeF(Number(item.created_at))}}</span>-->
                                        </div>
                                    </div>
                                </el-col>
                                <el-col :span="4" class="flex-right">
                                    <CategoryButton :category="item.category"/>
                                </el-col>
                            </el-row>
                            <div class="content">
                                {{item.content.fields.content}}
                            </div>
                            <div class="footer">
                                <!--<div>-->
                                    <!--<LikeButton :postId="Number(item.id)" :likeCount="Number(item.likes_count)"/>-->
                                <!--</div>-->
                                <!--<div class="reply">-->
                                    <!--{{t('post.reply')+" "+item.comments.length}}-->
                                <!--</div>-->
                            </div>
                        </el-card>
                        <el-skeleton :loading="pageLoading" animated>
                            <template #template>
                                <el-card class="post-card" v-for="item in 5" style="cursor: default">
                                    <el-row justify="space-between">
                                        <el-col :span="24" class="card-info">
                                            <el-skeleton-item variant="circle" :style="{width: avatarSize+'px',height:avatarSize+'px'}"/>
                                            <div class="text" style="width: 70%">
                                                <div class="title">
                                                    <el-skeleton-item variant="h1" style="width: 60%" />
                                                </div>
                                                <div class="info">
                                                    <el-skeleton-item variant="h3" style="width: 30%" />
                                                </div>
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div class="content">
                                        <el-skeleton-item variant="h3" style="width: 50%" />
                                    </div>
                                    <div class="footer">
                                        <div>
                                            <el-skeleton-item variant="h3" style="width: 30px;height: 20px" />
                                        </div>
                                        <div class="reply">
                                            <el-skeleton-item variant="h3" style="width: 51px" />
                                        </div>
                                    </div>
                                </el-card>
                            </template>
                        </el-skeleton>
                        <el-row :class="{ empty: list.length === 0 }" justify="center" class="loading-tip">
                            <div class="note" v-if="pageLoading">
                                {{ $t('common.loading') }}
                            </div>
                            <div class="note" v-else-if="totalCount === 0 || totalCount === list.length">
                                {{ $t('common.noMore') }}
                            </div>
                        </el-row>
                    </el-col>
                    <el-col :sm="5" :xs="24">
                        <RightMenu buttonType="post"/>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
    import {ref, onMounted, computed} from 'vue';
    import {t} from '@/locale';
    import {
        ElRow,
        ElCol,
        ElInput,
        ElButton,
        ElCard,
        ElTag,
        ElIcon,
        ElDivider,
        ElMenu,
        ElMenuItem,
        ElSkeleton,
        ElSkeletonItem
    } from 'element-plus/es';
    import {Search} from '@element-plus/icons-vue'
    import Avatar from '@/components/common/Avatar.vue';
    import Username from '@/components/common/Username.vue';
    import CategoryButton from '@/components/common/CategoryButton.vue';
    import LikeButton from '@/components/common/LikeButton.vue';
    import RightMenu from '@/components/menu/RightMenu.vue';
    import {useRouter} from 'vue-router';
    import {getTimeF} from "@/utils/dates";
    import {ApiPost} from "@/api/types";
    import {cleanHtml} from "@/common/utils";
    import { getPostPage } from "@/api/post";

    const router = useRouter();

    const search = ref("");
    const avatarSize = 60;
    const pageSize = ref(5);
    const pageNum = ref(0);
    const totalCount = ref(0);
    const pageLoading = ref(false);
    const board = ref("")
    const category = computed(() => {
        return [{
            value: "",
            label: t('post.help.category.all')
        },
        //     {
        //     value: "Tech",
        //     label: t('post.help.category.tech')
        // }, {
        //     value: "Law",
        //     label: t('post.help.category.law')
        // }, {
        //     value: "Safeguard",
        //     label: t('post.help.category.safeguard')
        // }, {
        //     value: "Blacklist",
        //     label: t('post.help.category.blacklist')
        // }, {
        //     value: "Other",
        //     label: t('post.help.category.other')
        // }
        ]
    });
    const list = ref<ApiPost[]>([]);
    //如果宽度小于426px则说明是移动端
    const isPhone = ref(document.documentElement.clientWidth < 426);

    const onClick = (id: string) => {
        console.log("onCLICK",id)
        router.push('/post/detail/' + id);
    }

    // 过滤显示的内容
    const showList = computed<Recordable<any>[]>(() => {
        const slist = list.value.map((item) => {
            return {
                ...item,
                content: {
                    fields:{
                        //移除html标签
                        content: item.content.fields.detail ? cleanHtml(item.content.fields.detail) : item.content.fields.detail,
                        format: "html"
                    }
                }
            };
        });
        console.log("slist",slist)
        return slist;
    });

    const onScroll = () => {
        //初始化时会运行一次此方法，所以懒加载分页从1开始
        //不能加载分页的时候停止请求博客列表，免得陷入死循环
        if (totalCount.value !== 0 && list.value.length !== totalCount.value) {
            pageNum.value++;
            init(false)
        }
    };

    const searchPage = () => {
        pageNum.value = 0;
        list.value = [];
    }

    const handleSelect = (key: string, keyPath: string[]) => {
        board.value = key;
        pageNum.value = 0;
        list.value = [];
        init(true)
    }

    //isClean，是否在收集到返回值后，清空之前的list（用于切换板块）
    const init = (isClean: boolean) => {
        pageLoading.value = true;
        let category;
        //当board=''时，加载[]，而不是['']
        board.value ? category = [board.value] : category = [];
        console.log("post",pageNum.value, pageSize.value, search.value, category)
        getPostPage(pageNum.value, pageSize.value, search.value, category).then(res=>{
            console.log("getPostPage",res)
            if(res.Ok){
                //防止用户快速切换板块，导致bug。只有在category（运行方法时的板块值）等于board.value（现在的板块值）相等时才清空
                if (board.value ? category.toString() == [board.value].toString() : category.length == 0) {
                    //分页加载时不执行清空list操作
                    if (isClean) {
                        list.value = [];
                    }
                } else {
                    return;
                }
                totalCount.value = res.Ok.length;
                list.value.push(...res.Ok);
            }
        }).finally(() => {
            pageLoading.value = false;
        });
    }

    onMounted(() => {
        init(false);
    });

</script>
<style lang="scss">
    .post-list-container {
        width: 100%;
        min-height: 100vh;
        background-color: rgb(246, 246, 246);
        display: flex;
        justify-content: center;
        position: relative;
        padding-top: 24px;
        .left-menu {
            border-radius: var(--el-card-border-radius);
            border-right: 0;
            .el-menu-item.is-active {
                border-left: 3px solid var(--el-menu-active-color);
                background-image: linear-gradient(to right, var(--el-menu-hover-bg-color), #f6f6f6);
            }
        }
        /* 当页面宽度小于426px*/
        @media screen and (max-width: 426px) {
            .left-menu {
                .el-menu-item.is-active {
                    border-left: 0;
                    background-image: linear-gradient(to right, var(--el-menu-hover-bg-color), #f6f6f6);
                }
            }
        }
        .empty {
            margin-top: 200px;
        }
        .loading-tip {
            margin-top: 30px;
            margin-bottom: 30px;
        }
        .container {
            .flex-right {
                display: flex;
                justify-content: end;
                align-items: center;
            }
            .post-card {
                text-align: left;
                margin-top: 20px;
                &:hover {
                    cursor: pointer;
                }
                .el-card__body {
                    /*padding: 20px 60px;*/
                }
                .card-info {
                    display: inherit;
                    .text {
                        margin-left: 20px;
                    }
                    .info {
                        span + span {
                            margin-left: 10px;
                        }
                        .createTime {
                            color: rgb(133, 144, 166);
                            font-size: 16px;
                        }
                    }
                    .title {
                        font-size: 20px;
                        font-weight: bold;
                        span:first-child:hover {
                            cursor: pointer;
                        }
                        span + span {
                            margin-left: 10px;
                        }
                    }
                }
                .content {
                    margin-top: 10px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 6;
                    -webkit-box-orient: vertical;
                    /*cursor: pointer;*/
                }
                .footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 25px;
                    .reply {
                        color: rgb(133, 144, 166);
                    }
                }
            }
        }
    }
</style>
