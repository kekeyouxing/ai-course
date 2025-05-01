import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubscriptionModal from '@/components/subscription/subscription-modal';
import VideoPackModal from '@/components/videopack/videopack-modal';

export default function AppPricePage() {
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
            <Link to="/#features" className="text-gray-600 hover:text-gray-900">功能</Link>
            <Link to="/#how-it-works" className="text-gray-600 hover:text-gray-900">工作原理</Link>
            <Link to="/app/appprice" className="text-gray-600 hover:text-gray-900 font-semibold">价格</Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900 font-semibold">联系我们</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">登录</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 价格页面主体内容 */}
      <main className="flex-grow">
        {/* 页面标题 */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">灵活的价格方案</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              选择最适合您需求的会员方案或视频包，随时可升级到更高级别
            </p>
          </div>
        </section>

        {/* 价格选项卡 */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <Tabs defaultValue="subscription" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-[400px] grid-cols-2">
                  <TabsTrigger value="subscription">会员订阅</TabsTrigger>
                  <TabsTrigger value="videopack">视频包</TabsTrigger>
                </TabsList>
              </div>
              
              {/* 会员订阅内容 */}
              <TabsContent value="subscription" className="mt-4">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold mb-4">会员订阅方案</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    选择最适合您需求的会员等级，享受持续的创作能力和更多高级功能
                  </p>
                </div>
                
                {/* 嵌入会员订阅模态框 */}
                <div className="flex justify-center mt-6">
                  <SubscriptionModal showActionButton={false} />
                </div>
                
                {/* 会员福利说明 */}
                <div className="mt-16 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold mb-6 text-center">所有会员都能享受的福利</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg mb-2">专属功能</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• 自定义角色创建与管理</li>
                        <li>• 高级AI生成功能</li>
                        <li>• 更多动画和转场效果</li>
                        <li>• 更高视频导出质量</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg mb-2">优先支持</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>• 享受优先客户支持</li>
                        <li>• 提前获取新功能</li>
                        <li>• 访问专属教程</li>
                        <li>• 定期功能更新</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* 视频包内容 */}
              <TabsContent value="videopack" className="mt-4">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold mb-4">视频包</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    根据您的创作需求，一次性购买视频包，即用即付，没有长期承诺
                  </p>
                </div>
                
                {/* 嵌入视频包购买模态框 */}
                <div className="flex justify-center mt-6">
                  <VideoPackModal showActionButton={false} />
                </div>
                
                {/* 视频包福利说明 */}
                <div className="mt-16 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold mb-6 text-center">为什么选择视频包</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <h4 className="font-bold text-lg mb-2">灵活使用</h4>
                      <p className="text-gray-700">按需购买，无需订阅，根据实际需求选择合适的视频包</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <h4 className="font-bold text-lg mb-2">永久有效</h4>
                      <p className="text-gray-700">购买的视频时长和文本额度永久有效，不会过期</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <h4 className="font-bold text-lg mb-2">性价比高</h4>
                      <p className="text-gray-700">针对高频用户提供更优惠的大容量视频包选择</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* 常见问题 */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">常见问题</h2>
            <div className="space-y-6">
              <FaqItem 
                question="会员订阅和视频包有什么区别？" 
                answer="会员订阅是按月付费，提供持续的服务和功能权限；视频包是一次性购买特定数量的视频时长和文本额度，永久有效。您可以根据自己的使用习惯选择最合适的方案。"
              />
              <FaqItem 
                question="我可以随时更改我的会员等级吗？" 
                answer="您可以随时升级您的会员等级，升级后将立即生效。请注意，会员等级仅支持升级，不支持降级操作。"
              />
              <FaqItem 
                question="视频包购买后会过期吗？" 
                answer="不会，购买的视频包额度永久有效，不设有效期限制，您可以随时使用。"
              />
              <FaqItem 
                question="如何查看我的剩余使用额度？" 
                answer="登录您的账户后，可以在个人中心的'使用记录'页面查看剩余的视频时长和文本额度。"
              />
              <FaqItem 
                question="是否提供退款服务？" 
                answer="抱歉，我们不提供退款服务。会员订阅一旦购买生效，将无法取消或退款。视频包购买后也无法申请退款，请在购买前确认您的需求。"
              />
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 - 保持与主页面一致的风格 */}
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
                <li><Link to="/#features" className="text-gray-400 hover:text-white">功能</Link></li>
                <li><Link to="/app/appprice" className="text-gray-400 hover:text-white">价格</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">模板</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">资源</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">教程</a></li>
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

// FAQ条目组件
interface FaqItemProps {
  question: string;
  answer: string;
}

function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-bold mb-2">{question}</h3>
      <p className="text-gray-700">{answer}</p>
    </div>
  );
} 