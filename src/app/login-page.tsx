import { useEffect, useState, useRef } from "react";
import { ArrowRight, Layers, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import instance from "@/api/axios";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 定义微信登录所需的接口
interface WxLoginOptions {
  self_redirect: boolean;
  id: string;
  appid: string;
  scope: string;
  redirect_uri: string;
  state: string;
  style?: string;
  href?: string;
}

// 扩展Window接口，添加WxLogin
declare global {
  interface Window {
    WxLogin?: new (options: WxLoginOptions) => void;
  }
}

// Define project type
interface Project {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loginMethod, setLoginMethod] = useState<"phone" | "wechat">("wechat");
  const wechatLoginRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 硬编码的项目数据，不再从API获取
  const displayProjects: Project[] = [
    {
      id: "demo1",
      title: "教育课程",
      description: "制作专业的在线课程和教学视频，轻松传递知识。",
      icon: <Layers className="h-6 w-6" />
    },
    {
      id: "demo2",
      title: "企业宣传视频",
      description: "展示您的品牌价值和企业文化，提升专业形象。",
      icon: <Layers className="h-6 w-6" />  
    },
    {
      id: "demo3",
      title: "社交媒体短视频",
      description: "为社交平台优化的短视频模板，吸引更多关注。",
      icon: <Layers className="h-6 w-6" />
    }
  ];

  // 初始化当前项目为第一个项目
  useEffect(() => {
    if (displayProjects.length > 0 && !currentProject) {
      setCurrentProject(displayProjects[0]);
    }
  }, [currentProject]);

  // 获取URL中的returnTo参数
  const getReturnPath = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('returnTo') || "/app/home";
  };

  // 验证手机号格式
  const validatePhone = (phoneNumber: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  // 处理手机号输入变化
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);

    if (value && !validatePhone(value)) {
      setPhoneError("请输入正确的手机号码");
    } else {
      setPhoneError("");
    }
  };

  // 使用 async/await 方式处理登录请求
  const handleLogin = async () => {
    // 在提交前再次验证手机号
    if (!validatePhone(phone)) {
      setPhoneError("请输入正确的手机号码");
      return;
    }

    try {
      const res = await instance.post("/login", { phone, code });

      // 检查返回数据是否包含 token
      if (res.data && res.data.code === 0 && res.data.data) {
        // 使用await等待登录流程完成，包括获取用户信息
        await login(res.data.data.token);
        
        // 获取返回路径并导航
        const returnPath = getReturnPath();
        navigate(decodeURIComponent(returnPath));
        
        toast.success("登录成功");
      } else {
        // 服务器返回了响应但没有 token
        toast.error(res.data.msg || "登录失败，请重试");
      }
    } catch (err) {
      // 处理请求错误
      toast.error("登录失败，请检查手机号和验证码是否正确");
      console.log("登录请求错误:", err);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGetCode = () => {
    // 验证手机号
    if (!validatePhone(phone)) {
      setPhoneError("请输入正确的手机号码");
      return;
    }

    setCountdown(60);
    instance
      .post("/sendSMS", { phone })
      .then((res) => {
        // 检查返回数据是否包含 token
        if (res.data && res.data.code === 0) {
          toast.success("验证码已发送");
        } else {
          // 服务器返回了响应但没有 token
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        // 处理请求错误
        toast.error("验证码发送失败");
        console.log("验证码发送请求错误:", err);
      });
  };

  // 处理微信登录 - 初始化二维码
  useEffect(() => {
    // 检查是否存在code参数，如果有则说明是从微信授权页面跳转回来的
    const searchParams = new URLSearchParams(location.search);
    const wxCode = searchParams.get('code');
    const wxState = searchParams.get('state');
    
    if (wxCode) {
      // 有code参数，说明是从微信授权页面跳转回来的
      // 不直接处理，而是跳转到回调页面处理
      navigate(`/auth/wechat/callback?code=${wxCode}&state=${wxState}`);
    } else if (loginMethod === "wechat" && wechatLoginRef.current) {
      // 没有code参数，初始化微信登录二维码
      loadWechatLogin();
    }
  }, [loginMethod, location.search, wechatLoginRef.current]);

  // 加载微信登录JS并初始化二维码
  const loadWechatLogin = () => {
    // 如果已经加载过微信登录JS，则直接初始化
    if (window.WxLogin) {
      initWechatLogin();
      return;
    }

    // 加载微信登录JS
    const script = document.createElement('script');
    script.src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
    script.onload = () => {
      initWechatLogin();
    };
    script.onerror = () => {
      toast.error("微信登录组件加载失败");
    };
    document.body.appendChild(script);
  };

  // 初始化微信登录二维码
  const initWechatLogin = () => {
    if (!wechatLoginRef.current || !window.WxLogin) return;
    
    // 清空容器
    wechatLoginRef.current.innerHTML = '';
    
    // 直接使用硬编码的appId，而不是从环境变量读取
    const appId = "wx5c846b456b58fc2d"; // 确保这是您的有效微信AppID
    
    // 保存returnTo路径
    const returnTo = getReturnPath();
    localStorage.setItem('returnTo', returnTo);
    
    // 硬编码正确的重定向URL，确保是完整的URL包含https://
    const baseRedirectUrl = import.meta.env.VITE_WECHAT_REDIRECT_URL || "https://echoclass.cn/auth/wechat/callback";
    const redirectUri = encodeURIComponent(baseRedirectUrl);
    
    console.log("初始化微信登录，参数:", { appId, redirectUri });
    
    // 生成随机state用于防止CSRF攻击
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // 保存state到localStorage，用于回调验证
    localStorage.setItem('wxLoginState', state);
    
    // 初始化微信登录二维码
    // @ts-ignore
    new window.WxLogin({
      self_redirect: false,
      id: "wechat-login-container",
      appid: appId,
      scope: "snsapi_login",
      redirect_uri: redirectUri,
      state: state,
      style: "",
      href: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VideoAI</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            返回首页
          </Button>
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 flex flex-col md:flex-row">
        {/* 左侧登录区域 */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">欢迎登录</h1>
              <p className="text-gray-500">选择登录方式</p>
            </div>

            <Tabs defaultValue="wechat" className="w-full mb-6" onValueChange={(value) => setLoginMethod(value as "phone" | "wechat")}>
              <div className="sticky top-0 bg-white z-10">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="wechat">微信登录</TabsTrigger>
                  <TabsTrigger value="phone">手机号登录</TabsTrigger>
                </TabsList>
              </div>
              
              {/* 固定高度的容器，确保两个标签页内容高度一致 */}
              <div className="h-[400px] relative">
                <TabsContent value="wechat" className="absolute inset-0 m-0 flex items-center justify-center">
                  <div 
                    id="wechat-login-container" 
                    ref={wechatLoginRef}
                    className="w-full h-full flex justify-center items-center"
                  >
                    {/* 微信登录二维码将在这里显示 */}
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-10 w-10 mx-auto mb-2 text-green-500" />
                      加载中...
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="phone" className="absolute inset-0 m-0 flex flex-col justify-start pt-8">
                  <div className="space-y-6 w-full">
                    <div className="space-y-2">
                      <Input
                        type="tel"
                        placeholder="请输入手机号"
                        className={`h-12 ${phoneError ? "border-red-500" : ""}`}
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-xs">{phoneError}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="请输入验证码"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-12"
                      />
                      <Button
                        variant="outline"
                        className="whitespace-nowrap h-12 px-4"
                        onClick={handleGetCode}
                        disabled={countdown > 0}
                      >
                        {countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </Button>
                    </div>
                    <div>
                      <Button
                        onClick={handleLogin}
                        className="w-full h-12 text-lg font-medium"
                      >
                        手机号登录
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">登录即表示您同意我们的</p>
              <p className="text-sm text-gray-500">
                <Link to="/terms" className="text-blue-500 hover:underline">
                  条款与隐私
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 右侧简洁展示区域 */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center">
          <div className="max-w-2xl w-full px-10 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">AI 视频创作平台</h2>
              <p className="text-gray-500 text-lg">简单高效的视频制作工具，让创作更轻松</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-10 mb-8">
              {currentProject && (
                <div className="space-y-8">
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                      {currentProject.icon}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">{currentProject.title}</h3>
                    <p className="text-gray-600 text-base">{currentProject.description}</p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-between text-base text-gray-500">
                      <span>高清导出</span>
                      <span>AI 脚本</span>
                      <span>模板库</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-3">
              {displayProjects.map((project, index) => (
                <button
                  key={project.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentProject?.id === project.id 
                      ? 'bg-primary' 
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentProject(project)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 