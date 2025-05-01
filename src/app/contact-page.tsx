import { Link } from 'react-router-dom';
import { Layers, MessageSquare, Phone} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';

export default function ContactPage() {


  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 - 保持与主页面一致的风格 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VideoAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/#features" className="text-gray-600 hover:text-gray-900">功能</a>
            <a href="/#how-it-works" className="text-gray-600 hover:text-gray-900">工作原理</a>
            <Link to="/appprice" className="text-gray-600 hover:text-gray-900">价格</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-semibold">联系我们</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">登录</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">联系我们</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            无论您有任何问题、建议或合作意向，我们都期待与您沟通
          </p>
        </div>
      </section>

      {/* 联系方式与表单 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 max-w-2xl mx-auto">
            {/* 联系方式卡片 */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold mb-8">与我们取得联系</h2>
              <p className="text-lg text-gray-600 mb-8">
                我们致力于为您提供最好的服务和支持。如果您有任何问题或需求，请随时联系我们。
              </p>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">微信咨询</h3>
                      <p className="text-gray-600">添加我们的客服微信号，获取即时支持</p>
                      <p className="font-medium mt-2">13971419613</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">电话咨询</h3>
                      <p className="text-gray-600">工作日9:00-18:00为您提供电话支持</p>
                      <p className="font-medium mt-2">+86 139-7141-9613</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 常见问题快速链接 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-6">常见问题</h2>
          <p className="text-gray-600 mb-8">
            在联系我们之前，您可能想查看我们的常见问题解答
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">如何开始使用？</h3>
                <p className="text-sm text-gray-600">了解如何快速上手我们的平台</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">账户问题</h3>
                <p className="text-sm text-gray-600">关于账户注册、登录和管理的问题</p>
              </CardContent>
            </Card>
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2">付款与订阅</h3>
                <p className="text-sm text-gray-600">了解付款方式和订阅管理</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 微信二维码区域 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-6">扫码添加微信</h2>
          <p className="text-lg text-gray-600 mb-8">
            扫描下方二维码，立即添加我们的客服微信
          </p>
          <div className="flex justify-center">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <div className="bg-white p-4 rounded-md mb-4">
                {/* 请替换为实际的二维码图片 */}
                <div className="w-48 h-48 bg-gray-200 mx-auto flex items-center justify-center text-gray-500">
                  {/* https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/wechat.png 微信二维码图片 */}
                  <img src="https://videos-1256301913.cos.ap-guangzhou.myqcloud.com/wechat.png" alt="微信二维码" className="w-full h-full object-contain" />
                </div>
              </div>
              <p className="font-medium">微信号: 13971419613</p>
              <p className="text-sm text-gray-500 mt-1">工作时间: 周一至周五 9:00-18:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="h-6 w-6 text-primary-foreground" />
                <span className="text-xl font-bold">VideoAI</span>
              </div>
              <p className="text-gray-400">
                使用AI技术简化视频创作过程，帮助每个人制作专业品质的视频内容。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">产品</h3>
              <ul className="space-y-2">
                <li><a href="/#features" className="text-gray-400 hover:text-white">功能</a></li>
                <li><Link to="/appprice" className="text-gray-400 hover:text-white">价格</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">资源</h3>
              <ul className="space-y-2">
                <li><Link to="/#" className="text-gray-400 hover:text-white">教程</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">关于我们</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">联系方式</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white">条款与隐私</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} VideoAI. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 