import {ElMessage} from "element-plus/es";
import {ApiResult} from "@/api/types";
import {t} from "@/locale";

export const showMessageError = (message: string) =>
    ElMessage({
        showClose: true,
        message,
        type: 'error',
    });
export const showResultError = (res: ApiResult<any>) => {
    let message;
    if (res.Err) {
        //没有类型对得上就直接输出错误类型
        switch (Object.keys(res.Err)[0]) {
            case 'AnswerWithCommentCantDelete':
                message = t('message.error.withOtherContent');
                break;
            default:
                message = "Error: "+Object.keys(res.Err)[0];
        }
    } else {
        //一般来说只有res.Err才会调用这个方法，多写个else防止意外
        message = JSON.stringify(res)
    }
    ElMessage({
        showClose: true,
        message,
        type: 'error',
    });
}
export const showMessageSuccess = (message: string) =>
    ElMessage({
        showClose: true,
        message,
        type: 'success',
    });
