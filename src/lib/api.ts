import { useRouter } from 'next/navigation';

// 创建统一的API请求包装器
export class ApiClient {
  private static router: any;

  static initialize(router: any) {
    this.router = router;
  }

  static async fetch(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // 如果返回401，跳转到登录页面
    if (response.status === 401) {
      // 清除本地存储的用户信息
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      // 跳转到登录页面
      if (this.router) {
        this.router.push('/login');
      } else {
        // 备用方案：直接使用window.location
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      throw new Error('未授权访问');
    }

    return response;
  }
}

// 全局API配置
export async function apiRequest(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // 处理401未授权
    if (response.status === 401) {
      // 清除本地状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('未授权访问');
    }

    // 检查响应格式
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      
      // 处理后端返回的成功/失败状态
      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || '操作失败');
      }
      
      return data;
    }

    return response;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 在组件中使用
export function useApi() {
  const router = useRouter();
  
  const request = async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (response.status === 401) {
        router.push('/login');
        throw new Error('未授权访问');
      }

      const data = await response.json();
      
      if (!data.success) {
        if (response.status === 401) {
          router.push('/login');
        }
        throw new Error(data.message || '操作失败');
      }

      return data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  };

  return { request };
}