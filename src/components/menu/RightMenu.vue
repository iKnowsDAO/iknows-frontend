<template>
    <div class="right-menu-container">
        <el-card shadow="never">
            <el-button type="primary" class="create-button" @click="onClick()"
                       v-if="buttonType==='post'">
                {{t('post.help.create')}}
            </el-button>
            <el-button type="primary" class="create-button" @click="onClick()"
                       v-else-if="buttonType==='dao'"
                       :disabled="isDisabled">
                {{t('dao.create')}}
            </el-button>
            <div class="alpha">
                <b class="flex-y-center">
                    <el-icon>
                        <Opportunity/>
                    </el-icon>
                    Alpha Warning!
                </b>
                <span class="text">iKnows and Sui is in the Dev phase, data may be cleared at any time.
                    Please access iKnows via testnet.</span>
            </div>
            <!--<div class="beta">-->
                <!--<b class="flex-y-center">-->
                    <!--<el-icon>-->
                        <!--<Opportunity/>-->
                    <!--</el-icon>-->
                    <!--Beta Warning!-->
                <!--</b>-->
                <!--<span class="text">iKnows is in the Beta phase, there may be issues.</span>-->
            <!--</div>-->
            <el-divider/>
            <div class="public-item">
                <a href="https://docs.sui.io/">
                    More about Sui
                </a>
            </div>
        </el-card>
        <Footer/>
    </div>
</template>

<script lang="ts" setup>
    import {defineProps, onMounted, ref} from 'vue';
    import {ElButton, ElCard, ElIcon, ElDivider} from 'element-plus/es';
    import {Opportunity} from '@element-plus/icons-vue';
    import Footer from '@/components/footer/Footer.vue';
    import {t} from '@/locale';
    import {ElAvatar} from 'element-plus/es';
    import {useRouter} from 'vue-router';
    import {openTab} from '@/router/routers';
    import router from "@/router";

    const isDisabled = ref(true);
    const props = defineProps({
        buttonType: {
            type: String,
            required: true,
        },
    });

    const init = async () => {
        if (props.buttonType === 'dao') {
            //isDisabled为false时按钮启用，true时按钮禁用
            // isDisabled.value = !await showAdmin();
        } else {
            isDisabled.value = false;
        }
    }

    onMounted(() => {
        init()
    });

    const onClick = () => {
        if (props.buttonType === 'post') {
            router.push('/post/submit')
        } else if (props.buttonType === 'dao') {
            router.push('/dao/submit')
        }
    };

</script>

<style lang="scss">
    .right-menu-container {
        .alpha {
            margin-top: 24px;
            padding: 8px 16px;
            color: #F56C6C;
            background-color: rgba(245,108,108,.1);
            border-radius: 10px;
            .text {
                font-size: 14px;
            }
        }
        .beta {
            margin-top: 24px;
            padding: 8px 16px;
            color: #e6a23c;
            background-color: #faecd8;
            border-radius: 10px;
            .text {
                font-size: 14px;
            }
        }
        .public-item {
            font-size: 14px;
            a {
                color: black;
                text-decoration: none;
                &:hover {
                    opacity: 0.8;
                    text-decoration: underline;
                }
            }
        }
        .create-button {
            width: 100%;
            min-height: 40px;
        }
    }
</style>
