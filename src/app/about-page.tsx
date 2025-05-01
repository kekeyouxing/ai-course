import { Link } from 'react-router-dom';
import { Layers, Zap, Globe, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold mb-4">关于我们</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们是AI视频创作领域的领导者，致力于用最先进的技术重新定义内容创作
          </p>
        </div>
      </section>

      {/* 公司简介 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">重新定义视频创作</h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
          </div>
          
          <div className="space-y-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              VideoAI成立于2024年，由一群对AI和创意充满热情的技术专家和设计师创立。我们的使命是通过革命性的AI技术，让每个人都能轻松创建专业级别的视频内容。
            </p>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-4 text-primary">我们的愿景</h3>
              <p className="text-lg text-gray-700 italic">
                "创造一个人人都能轻松表达创意的世界，让视频创作不再是少数人的特权。"
              </p>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              在短短的发展时间内，我们不断完善产品功能，提升用户体验。我们相信，创意不应该被技术限制。通过我们的平台，任何人都可以在几分钟内创建出令人满意的视频作品，无需专业技能或昂贵设备。
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 mt-6">
              <div className="flex-1 bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-blue-700">用户至上</h4>
                <p className="text-gray-700">我们以用户需求为中心，不断优化产品体验</p>
              </div>
              <div className="flex-1 bg-purple-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-purple-700">技术创新</h4>
                <p className="text-gray-700">我们致力于将最新的AI技术应用到视频创作中</p>
              </div>
              <div className="flex-1 bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-green-700">简单易用</h4>
                <p className="text-gray-700">我们让复杂的技术变得简单，降低创作门槛</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 我们的核心能力 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">卓越的核心能力</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们拥有业内领先的AI技术和创新团队，为用户提供无与伦比的视频创作体验
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">顶尖AI技术</h3>
              <p className="text-gray-600">
                我们的AI模型经过数百万视频内容的训练，能够精准理解用户意图，生成令人惊叹的视觉效果和流畅的动画。我们的技术在业内处于绝对领先地位。
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">极致用户体验</h3>
              <p className="text-gray-600">
                我们的产品设计秉承"简单而强大"的理念，即使是首次使用的用户也能在几分钟内上手。我们的界面直观友好，被用户评为"行业最佳用户体验"。
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">市场影响力</h3>
              <p className="text-gray-600">
                我们的平台正在国内市场稳步发展，支持多种应用场景，致力于为用户提供便捷的视频创作工具。我们希望通过创新改变视频创作的方式。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 愿景和使命 */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">我们的愿景</h2>
          <p className="text-2xl text-gray-700 italic leading-relaxed mb-10">
            "创造一个人人都能轻松表达创意的世界，让视频创作不再是少数人的特权。"
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>
          <h3 className="text-xl font-bold mb-4">我们的价值观</h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div>
              <h4 className="font-bold mb-2">用户至上</h4>
              <p className="text-gray-600">一切决策以用户需求为中心</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">突破创新</h4>
              <p className="text-gray-600">不断挑战技术边界</p>
            </div>
            <div>
              <h4 className="font-bold mb-2">开放包容</h4>
              <p className="text-gray-600">欢迎多元思想和文化</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">加入我们的创新之旅</h2>
          <p className="text-xl text-gray-600 mb-10">
            试用VideoAI，体验AI驱动的视频创作革命，释放您的创造力
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/app/home">
              <Button size="lg" className="px-8">立即开始</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8">联系我们</Button>
            </Link>
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

        </div>
      </footer>
    </div>
  );
} 