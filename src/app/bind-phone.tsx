import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import instance from "@/api/axios";
import { toast } from "sonner";

export default function BindPhonePage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // 页面加载时检查是否有WeChat OpenID
  useEffect(() => {
    const openID = localStorage.getItem('wechatOpenID');
    if (!openID) {
      // 如果没有OpenID，说明用户不是从微信登录跳转来的
      toast.error("无效的访问，请先登录");
      navigate("/login");
    }
  }, [navigate]);

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

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 获取验证码
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
        if (res.data && res.data.code === 0) {
          toast.success("验证码已发送");
        } else {
          toast.error(res.data.msg);
        }
      })
      .catch((err) => {
        toast.error("验证码发送失败");
        console.log("验证码发送请求错误:", err);
      });
  };

  // 绑定手机号
  const handleBindPhone = async () => {
    // 在提交前再次验证手机号
    if (!validatePhone(phone)) {
      setPhoneError("请输入正确的手机号码");
      return;
    }

    if (!code) {
      toast.error("请输入验证码");
      return;
    }

    try {
      const openID = localStorage.getItem('wechatOpenID');
      
      if (!openID) {
        toast.error("登录状态已失效，请重新登录");
        navigate("/login");
        return;
      }

      // 调用绑定手机号接口
      const res = await instance.post("/wechat/bind", { 
        open_id: openID,
        phone, 
        code
      });

      if (res.data && res.data.code === 0 && res.data.data && res.data.data.token) {
        // 清除临时OpenID
        localStorage.removeItem('wechatOpenID');
        
        // 使用绑定成功后返回的token登录
        await login(res.data.data.token);
        
        toast.success("手机号绑定成功");
        navigate("/app/home");
      } else {
        toast.error(res.data.msg || "绑定失败，请重试");
      }
    } catch (err) {
      toast.error("绑定失败，请检查手机号和验证码是否正确");
      console.log("绑定手机号请求错误:", err);
    }
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
        </div>
      </header>

      {/* 主要内容区 */}
      <main className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">绑定手机号</h1>
            <p className="text-gray-500 mt-2">完成注册并关联您的微信账号</p>
          </div>

          <div className="space-y-6">
            <div>
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
              onClick={handleBindPhone}
              className="w-full h-12 text-lg font-medium"
            >
              绑定并登录
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-gray-500"
                onClick={() => {
                  localStorage.removeItem('wechatOpenID');
                  navigate("/login");
                }}
              >
                返回登录
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 