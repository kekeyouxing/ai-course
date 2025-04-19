import { useEffect, useState } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import instance from "@/api/axios";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // 获取示例项目
  useEffect(() => {
    setIsLoading(true);
    instance
      .get("/featured-projects")
      .then((res) => {
        if (res.data && res.data.code === 0) {
          setProjects(res.data.data.projects || []);
        }
      })
      .catch((err) => {
        console.error("获取项目失败:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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

  // 提供一些示例项目，以防API调用失败
  const fallbackProjects = [
    {
      id: "demo1",
      title: "企业宣传视频",
      coverImage: "/screenshots/project1.jpg",
      description: "专业的企业介绍视频模板，帮助您展示公司产品和服务。"
    },
    {
      id: "demo2",
      title: "教育课程",
      coverImage: "/screenshots/project2.jpg",
      description: "适合在线教育的视频模板，包含动画和互动元素。"
    },
    {
      id: "demo3",
      title: "社交媒体短视频",
      coverImage: "/screenshots/project3.jpg",
      description: "为社交平台优化的短视频模板，吸引更多关注。"
    }
  ];

  const displayProjects = projects.length > 0 ? projects : fallbackProjects;

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
                <a href="#" className="text-blue-500 hover:underline">
                  服务条款
                </a>{" "}
                和{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  隐私政策
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 右侧项目展示区域 */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">精选模板项目</h2>
            
            {isLoading ? (
              <div className="grid gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6">
                {displayProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-video w-full bg-gray-100">
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          项目预览图
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                      <p className="text-gray-600 text-sm">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-gray-500">
                登录后解锁全部模板和功能，开始创建您的精彩视频
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 