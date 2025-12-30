// src/api/modules/user.ts
// import { POST } from "../api";
import { POST_LOGIN } from "../api";
// import { POST_FORM } from "../api";

const userUrl = {
    login: "http://localhost:8081/user/login"
};

export default userUrl;

// 登录接口
export const login = (param: { account: string; password: string }) => {
    console.log("开始调用了");
    // return POST(userUrl.login, param, false); // 不使用基地址
    return POST_LOGIN(userUrl.login, param, false); // 使用专门的登录方法
};



