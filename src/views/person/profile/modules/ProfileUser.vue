<template>
    <div class="person-profile-user-container">
        <div class="container">
            <el-row>
                <el-col :sm={span:3,offset:3} :xs="24" class="avatar">
                    <Avatar :username=user.name
                            :address-id=targetAddress
                            :avatar-id="0"
                            :clickable="false"
                            :size="120"/>
                </el-col>
                <el-col :sm=15 :xs="24">
                    <div class="user-profile">
                        <el-row justify="space-between" class="title">
                            <div class="flex-y-center">
                                <el-icon>
                                    <UserFilled/>
                                </el-icon>
                                <span v-if="!user.name"> {{ targetAddress }}</span>
                                <span v-else>{{user.name}}</span>
                            </div>
                            <el-button v-if="isOwner" @click="dialogFormVisible = true">
                                {{t('common.edit')}}
                            </el-button>
                        </el-row>
                        <el-row>
                            <span class="address" @click="copyAddress">{{ targetAddress }}</span>
                            <el-icon class="copy" @click="copyAddress"><CopyDocument /></el-icon>
                        </el-row>
                        <el-row v-if="user.location">
                            <el-icon><LocationFilled/></el-icon>
                            {{user.location}}
                        </el-row>
                        <el-row v-if="user.email">
                            <el-icon>
                                <Message/>
                            </el-icon>
                            {{user.email}}
                        </el-row>
                        <el-row v-if="user.biography">
                            <el-icon>
                                <Comment/>
                            </el-icon>
                            {{user.biography}}
                        </el-row>
                        <el-row>
                            <el-tooltip :content="t('user.reputation')">
                                <div class="flex-y-center">
                                    <img src="@/assets/favicon.svg" style="width: 20px;border-radius: 9px;margin-right: 5px">
                                    {{reputation}}
                                </div>
                            </el-tooltip>
                        </el-row>
                        <el-row justify="space-between">
                            <div>
                                <div class="flex-y-center" v-if="user.interests.length>0">
                                    <el-icon>
                                        <StarFilled/>
                                    </el-icon>
                                    <el-tag class="user-tag" v-for="(item,index) in user.interests">{{item}}</el-tag>
                                </div>
                            </div>
                            <div v-if="user?.created_at!==0">
                                {{t('post.joined')+" " + formatDate(Number(user?.created_at ? user?.created_at : 0))}}
                            </div>
                        </el-row>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
    <el-dialog v-model="dialogFormVisible" custom-class="user-edit-dialog" :title="t('user.editInfo')" width="30%">
        <Avatar :username=form.name
                :address-id=targetAddress
                :avatar-id="0"
                :clickable="false"
                :size="100"/>
        <el-form :model="form"
                 ref="ruleFormRef"
                 hide-required-asterisk>
            <el-form-item prop="name" :rules="[{
                required: true,
                message: $t('user.placeholder.name'),
                trigger: 'blur'}]">
                <template #label>
                    <el-icon>
                        <UserFilled/>
                    </el-icon>
                </template>
                <el-input v-model="form.name"
                          maxlength="20"
                          show-word-limit
                          :placeholder="t('user.name')"/>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-icon>
                        <Message/>
                    </el-icon>
                </template>
                <el-input v-model="form.email"
                          maxlength="30"
                          show-word-limit
                          :placeholder="t('user.email')"/>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-icon>
                        <LocationFilled/>
                    </el-icon>
                </template>
                <el-input v-model="form.location"
                          maxlength="30"
                          show-word-limit
                          :placeholder="t('user.location')"/>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-icon>
                        <Comment/>
                    </el-icon>
                </template>
                <el-input v-model="form.biography"
                          type="textarea"
                          :rows="2"
                          maxlength="120"
                          show-word-limit
                          :placeholder="t('user.sign')"/>
            </el-form-item>
            <el-form-item v-for="(item, index) in form.interests"
                          label-width="32px"
                          :key="index"
                          :prop="'interests.' + index"
                          :rules="{
                            required: true,
                            message: $t('user.placeholder.interest'),
                            trigger: 'blur',
                          }">
                <template #label>
                    <el-icon v-if="index===0">
                        <StarFilled/>
                    </el-icon>
                    <span v-else></span>
                </template>
                <el-input v-model="form.interests[index]"
                          maxlength="10"
                          show-word-limit
                          :placeholder="t('user.interest')">
                    <template #append>
                        <el-button :icon="Close" @click.prevent="removeInterest(index)"></el-button>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div style="display: flex;justify-content: space-between">
                <el-button @click="addInterest">{{t('user.addInterest')}}</el-button>
                <span class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">{{t('common.cancel')}}</el-button>
                    <el-button type="primary" @click="updateSelf(ruleFormRef)" :loading="loading">{{t('common.confirm')}}</el-button>
                </span>
            </div>
        </template>
    </el-dialog>
</template>
<script lang="ts" setup>
    import {ref, onMounted, computed, defineEmits} from 'vue';
    import {useRoute, useRouter} from 'vue-router';
    import {t} from '@/locale';
    import {
        ElRow, ElCol, ElButton, ElDialog, ElForm, ElFormItem,
        ElInput, ElMessage, ElTag, ElIcon,ElTooltip
    } from 'element-plus/es';
    import {UserFilled, Message, Comment, Close, StarFilled, LocationFilled, CopyDocument} from '@element-plus/icons-vue';
    import Avatar from '@/components/common/Avatar.vue';
    import Navigator from '@/components/navigator/Navigator.vue';
    import {formatDate} from '@/utils/dates';
    import {showMessageError, showMessageSuccess} from "@/utils/message";
    import {toClipboard} from "@soerenmartius/vue3-clipboard";
    import { useUserStore } from "@/stores/user";

    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const dialogFormVisible = ref(false);
    const ruleFormRef = ref("")
    const reputation = ref(0);
    const form = ref({
        owner: "",
        email: "",
        name: "",
        biography: "",
        location: "",
        created_at: 0,
        interests: [] as string[]
    });
    const user = ref({
        owner: "",
        email: "",
        name: "",
        biography: "",
        location: "",
        created_at: 0,
        interests: []
    });
    const currentUserAddress = computed<string>(() => userStore.address);
    const targetAddress = ref('');
    // 是否是本人。关联编辑按钮的显示与否
    const isOwner = computed<boolean>(
        () => currentUserAddress.value === targetAddress.value
    );
    const loading = ref(false);

    onMounted(() => {
        initAddress();
        initUser();
        initReputation();
    });

    const initReputation = () => {
       //get
    }

    const copyAddress = async () => {
        try {
            await toClipboard(targetAddress.value)
            showMessageSuccess(t('message.copy.success',{item:"Address"}))
        } catch (e) {
            console.error(e)
        }
    }

    const initAddress = () => {
        // 获取 路由中的address
        const address = route.params.address;
        targetAddress.value = address.toString() || '';
        if (!targetAddress.value) {
            targetAddress.value = currentUserAddress.value;
        }
        // console.log('target address', targetAddress.value);
        // console.log('current user address', currentUserAddress.value);
        if (!targetAddress.value) {
            // 既没有登录也没有目标的 address 就跳转首页
            console.log(
                'person profile: target address is empty. goto home',
                currentUserAddress.value,
            );
            // router.push('/');
            return;
        }
    }

    const emit = defineEmits(['username','editProfile']);

    const initUser = () => {
        //get
    }

    const updateAfter = () => {
        //修改用户信息后，重新刷新下缓存信息
       //get
    }

    const updateSelf = async (formEl) => {
        if (!formEl) return
        //校验规则
        await formEl.validate((valid, fields) => {
            if (valid) {
                loading.value = true;
                //edit
            } else {
                console.error('error submit!', fields)
            }
        })
    }

    const addInterest = () => {
        form.value.interests.push("");
        console.log("user", user.value)
        console.log("form", form.value)
    }

    const removeInterest = (index) => {
        if (index !== -1) {
            form.value.interests.splice(index, 1)
        }
    }

</script>
<style lang="scss">
    .person-profile-user-container {
        margin-top: 30px;
        .el-icon {
            color: rgb(96, 98, 102);
            font-size: 20px;
        }
        @media screen and (max-width:426px) {
            .avatar,.title{
                justify-content: center;
            }
            .title{
                margin-top: 5px;
            }
            .container{
                padding: 0 20px!important;
            }
        }
        .container {
            padding: 40px 40px;
            .avatar{
                display: inherit
            }
            .avatar-container {
                align-items: start;
            }
            .user-profile {
                .el-row {
                    margin-bottom: 5px;
                    align-items: center;
                }
                .address{
                    cursor: pointer;
                }
                .copy{
                    margin-left: 5px;
                    cursor: pointer;
                }
                .el-icon {
                    margin-right: 4px;
                }
                .title {
                    margin-bottom: 5px;
                }
                .user-tag + .user-tag {
                    margin-left: 10px;
                }
            }
        }
    }
    .user-edit-dialog {
        .el-dialog__body {
            padding-top: 0;
        }
        .avatar-container {
            margin-bottom: 20px;
        }
    }
</style>
