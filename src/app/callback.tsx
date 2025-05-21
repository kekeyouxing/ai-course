import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import instance from "@/api/axios";
import { toast } from "sonner";
import { Layers } from "lucide-react";

export default function WechatCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 从URL中获取code和state参数
    const handleCallback = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        console.log("收到微信回调:", { code, state });
        
        if (!code) {
          setError("登录失败：缺少授权码");
          toast.error("登录失败：缺少授权码");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        
        // 验证state防止CSRF攻击
        const savedState = localStorage.getItem('wxLoginState');
        console.log("验证state:", { received: state, saved: savedState });
        
        if (state !== savedState) {
          setError("登录失败：安全验证不通过");
          toast.error("登录失败：安全验证不通过");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        
        // 清除state
        localStorage.removeItem('wxLoginState');
        
        
        const res = await instance.post("/api/wechat/login", { code });
        
        if (res.data && res.data.code === 0 && res.data.data) {
          // 检查用户是否需要绑定手机号
          if (res.data.data.needBind) {
            // 需要绑定手机号，将openID存储到localStorage，用于后续绑定
            localStorage.setItem('wechatOpenID', res.data.data.openID);
            // 跳转到绑定手机号页面
            navigate("/bind-phone");
            toast.info("请绑定手机号完成注册");
          } else if (res.data.data.token) {
            // 已经绑定手机号，直接登录成功
            await login(res.data.data.token);
            
            // 获取微信登录前的路径或默认跳转到home
            const returnTo = localStorage.getItem('returnTo') || "/app/home";
            localStorage.removeItem('returnTo');
            
            toast.success("微信登录成功");
            navigate(returnTo);
          } else {
            // 未找到token，可能是API结构有变化
            setError("登录失败，服务器返回数据格式异常");
            toast.error("登录失败，服务器返回数据格式异常");
            setTimeout(() => navigate("/login"), 2000);
          }
        } else {
          setError(res.data?.msg || "微信登录失败，请重试");
          toast.error(res.data?.msg || "微信登录失败，请重试");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (err) {
        console.error("微信登录回调处理错误:", err);
        setError("登录失败，请重试");
        toast.error("登录失败，请重试");
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };
    
    handleCallback();
  }, [location, navigate, login]);

  // 显示加载中状态或错误信息
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <Layers className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VideoAI</span>
          </div>
        </div>
        
        {loading ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">微信登录处理中...</h2>
            <p className="text-sm text-gray-500 text-center">请稍候，正在验证您的信息</p>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">登录失败</h2>
            <p className="text-sm text-red-500 text-center">{error}</p>
            <p className="text-sm text-gray-500 text-center mt-4">正在返回登录页面...</p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-center mb-2">登录成功</h2>
            <p className="text-sm text-gray-500 text-center">正在跳转到主页...</p>
          </>
        )}
      </div>
    </div>
  );
}
