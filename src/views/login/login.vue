<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus'; // 假设使用Element Plus组件库的提示组件
import { useRouter } from 'vue-router'; // 导入 useRouter
import { login as userLogin } from '@/api'; // 导入登录API
import { StorageEnum } from '@/enums'; // 假设已有此枚举
import { setLocalStorage } from '@/utils'; // 假设已有此工具函数
import {getLocalStorage} from "@/utils";


// 创建路由实例
const router = useRouter();

// 表单数据绑定
const loginForm = reactive({
  account: '', // 账户
  password: '' // 密码
});

// 加载状态
const loginLoading = ref(false);

// 表单验证状态
const formRules = {
  account: [
    { required: true, message: '请输入账户', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
};

// 表单引用（用于验证）
const loginFormRef = ref<any>(null);

/**
 * 模拟登录API请求
 * 实际开发中替换为真实接口地址和参数
 * @returns Promise 登录结果
 */
// const mockLoginApi = (account: string, password: string): Promise<{
//   code: number;
//   msg: string;
//   data?: { token: string };
// }> => {
//   // 模拟假数据 - 实际接口删除这段，替换为真实请求
//   const mockValidAccount = 'admin';
//   const mockValidPassword = '123456';
//
//   return new Promise((resolve) => {
//     // 模拟接口延迟
//     setTimeout(() => {
//       // 先判断账户是否正确
//       if (account !== mockValidAccount) {
//         resolve({ code: 400, msg: '账户不存在' });
//       }
//       // 账户正确再判断密码
//       else if (password !== mockValidPassword) {
//         resolve({ code: 400, msg: '密码错误' });
//       }
//       // 登录成功
//       else {
//         resolve({
//           code: 200,
//           msg: '登录成功',
//           data: { token: 'eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkIjoxNzY2OTgw' +
//                 'MjE2OTc2LCJ1c2VySWQiOiIxMjM0NTU2NiIsInVzZXJuYW1lIjoiMTIzNDU1' +
//                 'NjYiLCJzdWIiOiIxMjM0NTU2NiIsImlhdCI6MTc2Njk4MDIxNiwiZXhwIjoxNzY2OT' +
//                 'kxMDE2fQ.AVsjfpSP1S0yBfts8cvzy9BqkS76Qqlua9TQwa4rAhg' }
//         });
//       }
//     }, 800);
//   });
// };



/**
 * 登录提交处理函数
 */
const handleLogin = async () => {
  // 先进行表单验证
  try {
    await loginFormRef.value.validate();
    // 开启加载状态
    loginLoading.value = true;

    // 调试：打印实际获取的值
    console.log('登录参数:', {
      account: loginForm.account,
      password: loginForm.password
    });
    // 调用登录接口
    const res = await userLogin({
      account: loginForm.account,
      password: loginForm.password
    });
    console.log('登录结果:', res);

// 1. 先校验核心字段的存在性，避免解构报错
    if (res?.success && res?.code === 200) {
      // 2. 校验 token 有效性（非空、字符串类型）
      const token = res.data?.token;
      if (token && typeof token === 'string' && token.trim()) {
        // 3. 序列化存储（统一格式，避免类型问题）
        setLocalStorage(StorageEnum.GB_TOKEN_STORE, token.trim());
        // 验证是否存储成功
        const storedToken = getLocalStorage(StorageEnum.GB_TOKEN_STORE);
        console.log('存储后验证读取的token:', storedToken);
        // console.log('存储的token:', token)
        ElMessage.success(res.message || '登录成功');

        // 4. 跳转前可加微延迟，确保存储生效（极端场景）
        setTimeout(() => {
          router.push('/index');
        }, 100);
      } else {
        // Token 无效时的兜底提示
        ElMessage.error('登录失败：获取到无效的 Token');
        return; // 终止后续逻辑
      }
    } else {
      // 覆盖接口返回非200/失败的场景
      ElMessage.error(res?.message || '登录失败');
    }
  } catch (error: any) {
    // 表单验证失败或网络错误
    if (error && error.msg) {
      ElMessage.error(error.msg);
    } else {
      ElMessage.warning('请完善登录信息');
    }
    console.error('登录失败:', error);
  } finally {
    // 关闭加载状态
    loginLoading.value = false;
  }
};

</script>

<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h2>系统登录</h2>
        <p>欢迎使用远能大数据运维服务系统</p>
      </div>

      <!-- 登录表单 -->
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="formRules"
          class="login-form"
          @keyup.enter="handleLogin"
      >
        <el-form-item prop="account">
          <el-input
              v-model="loginForm.account"
              placeholder="请输入账户"
              prefix-icon="el-icon-user"
              size="large"
              autocomplete="off"
          ></el-input> <!-- 显式闭合 -->
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              autocomplete="off"
          ></el-input> <!-- 显式闭合 -->
        </el-form-item>

        <el-form-item class="login-btn-item">
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              @click="handleLogin"
              :loading="loginLoading" <!-- 修复loading状态 -->
          >
          登录
          </el-button> <!-- 显式闭合 -->
        </el-form-item>
      </el-form> <!-- 表单闭合 -->
    </div> <!-- 卡片闭合 -->

    <!-- 背景装饰 -->
    <div class="login-bg-decoration"></div>
  </div> <!-- 容器闭合 -->
</template>

<style scoped lang="scss">
// 全局登录容器
.login-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  // 背景装饰效果
  .login-bg-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
}

// 登录卡片
.login-card {
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  backdrop-filter: blur(8px);
  padding: 40px 45px;
  position: relative;
  z-index: 10;

  // 登录头部
  .login-header {
    text-align: center;
    margin-bottom: 30px;

    h2 {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }

  // 登录表单
  .login-form {
    width: 100%;

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    :deep(.el-input) {
      --el-input-border-radius: 8px;
      --el-input-hover-border-color: #667eea;

      input {
        font-size: 14px;
      }
    }

    .login-btn-item {
      margin-bottom: 0;

      .login-btn {
        width: 100%;
        height: 48px;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 576px) {
  .login-card {
    width: 90%;
    padding: 30px 25px;
  }
}
</style>