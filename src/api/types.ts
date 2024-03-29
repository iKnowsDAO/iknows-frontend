// 后端的错误
export type ApiError = {
    userAlreadyExists: string; // 在用户已经注册的情况下，返回的用户名
    unauthorized: null; // 未注册情况下，调用接口
    emailAddressAlreadyExists: null; // 邮箱已经注册
    emailAddressNotValid: null; // 邮箱格式不正确
    UserNotFound: null; // 找不到目标用户
    UserEmailInvalid: null; // 用户的邮箱格式存在问题
    PostAlreadyCompleted: null; //贴子已经进入完成状态，不能再修改
    PostNotFound: null; // 贴子找不到

    ProposalNotFound: null;//提案找不到
    ProposalUnAuthorized: null;
    ProposalDeadlineOutOfDate: null;
    MemberNotFound: null;
    MemberAlreadyExists: null;
    MemberAddressWrongFormat: null;
    AnswerWithCommentCantDelete: null; //有评论的回答不能删除
};

// 后端的返回结果
export type ApiResult<T> = {
    Ok?: T;
    effects?: {
        status: {
            status: 'success' | 'error'
        },
        created:any
    }
    Err?: ApiError;
};
// 后端的返回结果 分页
export type ApiResultByPage<T> = {
    Ok?: {
        data: T[];
        page_num: bigint; // 当前页码
        page_size: bigint; // 页面大小
        total_count: bigint; // 总数
    };
    Err?: ApiError;
};

export type ApiStatus = 'enable' | 'disable' | 'pending' | 'deleted';
export type ApiPostStatus = {
    Enable?: null,
    Completed?: null,
    Closed?: null,
};// 正常 | 完成 | 关闭

export type ApiDaoState = {
    Open?: null, //投票中
    Accepted?: null, //yes的票数足够，已通过，待执行
    Rejected?: null, //no的票数足够，未通过，不会执行
    Executing?: null, //正在执行
    Succeeded?: null, //成功执行
    Failed?: string, //发生意外的故障，并且包含失败原因
};

export type RichText = {
    detail: string; // 实际内容
    format: 'text' | 'markdown' | 'html'; // 标记内容类型 有 3 种: text | html | markdown
    fields: {
        detail: string; // 实际内容
        format: 'text' | 'markdown' | 'html'; // 标记内容类型 有 3 种: text | html | markdown
    }
    type: string;
};

export type PostCategory = {
    Tech?: null,
    Law?: null,
    Safeguard?: null, //维权
    Blacklist?: null, //黑名单
    Other?: null
};

export type ApiUserInfo = {
    id: bigint; //id
    sui_wallet: string; // 用户钱包地址
    email: string;
    name: string;
    memo: string;
    status: string;
    created_at: bigint;
    avatar_uri: string; //头像网址，暂时没用
    location: string; // 位置，用户想写就写。限制30个字
    avatar_id: bigint; //头像id，暂时没用
    biography: string; //类似于个人签名
    interests: string[]; //兴趣，类似于标签
};

export type ApiPost = {
    id: bigint; //id
    author: string; // 作者钱包地址
    author_name: string; //作者名字
    title: string;
    comments?: ApiPostComments[];
    content: RichText;
    category: string;
    photos: number[];
    answer: number[];
    // participants: string[];//期待参与的人
    // end_time: [number]; //结束时间  opt格式，类似于[1000]，数组中只有一个数据。
    events?: ApiPostTimeline[];
    // likes_count: number; //点赞数
    // ask_for_money: any;
    // status: ApiPostStatus;
    created_at: number;
    // updated_at: number;
};

export type ApiPostTimeline = {
    author: string; // 作者
    created_at: number;
    description: string;
    event_time: number;
    type?: string;
    hollow?: boolean;
    time?: string;
}

export type ApiPostComments = {
    author: string; // 作者addressID
    author_name: string; //作者用户名
    authorData?: ApiUserInfo; //作者详细资料 通过id获取对应资料
    comment_id: number[];
    comments: [];
    quote_id: number[];
    quoteName?: string;
    content: RichText;
    created_at: bigint;
    id: {
        id:string
    };
    post_id: bigint;
    isReply?: boolean; //是否被回复
}

export type ApiProfilePost = {
    author?: string; // 作者addressID
    content: RichText;
    comments?: [];
    length?: number;
    created_at: bigint;
    title: string;
    post_title?: string; //评论的title名
    id: bigint;
    post_id?: bigint;
}

export type UserReputation = {
    user: string; // 用户addressID
    amount: bigint; //积分值
}
//DAO成员信息
export type GovernanceMember = {
    user: string; // 用户addressID
    created_at: bigint; //创建时间
}

export type Weights = {
    amount: number;
}
export type Execute_args = {
    execute_args: execute_args;
}
export type execute_args = {
    AddGovernanceMember: ApiDaoArgs;
}
export type ApiDaoProposal = {
    id: bigint; //id
    proposer: string; // 发起人
    authorData?: ApiUserInfo;  //作者详细资料 通过id获取对应资料
    payload: Execute_args; //额外参数
    state: ApiDaoState;
    votes_yes: Weights;
    votes_no: Weights;
    vote_threshold: Weights; //投票阈值
    voters: string[];
    created_at: number;
};

export type ApiDaoArgs = {
    id: string; //被提案用户的id
    title: string;
    content: RichText;
    deadline: number;
    action: string; // action目前只有Add,Delete两个值，对应增加删除管理员
};
