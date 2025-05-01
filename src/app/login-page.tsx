import { useEffect, useState } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import instance from "@/api/axios";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

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
              <p className="text-gray-500">使用手机号验证码登录</p>
            </div>

            <div className="space-y-6">
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
              <Button
                onClick={handleLogin}
                className="w-full h-12 text-lg font-medium"
              >
                登录
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 text-center">
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