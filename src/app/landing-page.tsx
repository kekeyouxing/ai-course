import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Layers, Video, Mic, Zap, Wand2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 导航栏 */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">VideoAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">功能</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">工作原理</a>
            <Link to="/app/appprice" className="text-gray-600 hover:text-gray-900">价格</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/app/home">
              <Button variant="outline">登录</Button>
            </Link>
            <Link to="/app/home">
              <Button>免费试用</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">AI驱动的视频创作平台</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            轻松创建专业品质的视频，无需任何制作经验。使用AI生成内容，添加形状和动画，并且完全个性化。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/app/home">
              <Button size="lg" className="px-8">
                免费开始使用
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/projects/demo">
              <Button size="lg" variant="outline" className="px-8">
                查看演示
              </Button>
            </Link>
          </div>
          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50 to-transparent z-10 pointer-events-none h-40 -bottom-1 top-auto"></div>
            <img
              src="/screenshots/editor.png"
              alt="视频编辑器截图"
              className="rounded-lg shadow-2xl border border-gray-200 w-full"
            />
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">强大的功能，简单的界面</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我们的平台为您提供了一套全面的工具，让视频创作变得简单高效。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* 功能卡片 */}
            <FeatureCard
              icon={<Video className="h-10 w-10 text-primary" />}
              title="AI视频生成"
              description="从简单的文本脚本自动生成精美视频，让您的创意立即成为现实。"
            />
            <FeatureCard
              icon={<Mic className="h-10 w-10 text-primary" />}
              title="AI语音合成"
              description="将您的文本转换为自然流畅的语音，支持多种语言和声音风格。"
            />
            <FeatureCard
              icon={<Wand2 className="h-10 w-10 text-primary" />}
              title="丰富的形状和动画"
              description="添加各种形状并应用动画效果，使您的视频更加生动有趣。"
            />
            <FeatureCard
              icon={<Layers className="h-10 w-10 text-primary" />}
              title="多场景编辑"
              description="创建多个场景并无缝连接，构建完整的故事情节和视频流程。"
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="实时预览"
              description="实时预览您的编辑效果，立即看到更改的结果，提高工作效率。"
            />
            <FeatureCard
              icon={<Check className="h-10 w-10 text-primary" />}
              title="一键导出"
              description="轻松导出您的作品，支持多种格式和分辨率，适应不同的使用场景。"
            />
          </div>
        </div>
      </section>

      {/* 工作原理 */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">如何使用</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              三个简单步骤，让您立即开始创建专业视频
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <StepCard
              number="1"
              title="创建项目"
              description="选择视频比例，创建新项目，或从模板开始"
            />
            <StepCard
              number="2"
              title="添加内容"
              description="添加文本、图像、形状和动画，使用AI生成语音"
            />
            <StepCard
              number="3"
              title="预览与导出"
              description="实时预览您的作品，满意后一键导出"
            />
          </div>
        </div>
      </section>

      {/* 客户反馈 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">用户喜爱</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              看看其他用户如何评价我们的平台
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="这款工具让我的工作效率提高了十倍！现在我可以在几分钟内完成以前需要几小时的视频制作任务。"
              author="张明"
              role="营销总监"
            />
            <TestimonialCard
              quote="界面直观，功能强大。我没有任何视频制作经验，但使用这个平台后，我创建的视频质量让我的团队惊讶不已。"
              author="李华"
              role="内容创作者"
            />
            <TestimonialCard
              quote="AI语音合成功能太棒了！声音自然流畅，为我的教学视频增添了专业感。绝对值得推荐！"
              author="王梅"
              role="在线教育讲师"
            />
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好开始创作了吗？
          </h2>
          <p className="text-xl text-white/80 mb-10">
            立即注册，免费体验我们的视频创作平台，开启您的创意之旅。
          </p>
          <Link to="/app/home">
            <Button size="lg" variant="secondary" className="px-8">
              免费开始使用
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
                <li><a href="#features" className="text-gray-400 hover:text-white">功能</a></li>
                <li><Link to="/app/appprice" className="text-gray-400 hover:text-white">价格</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white">模板</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">资源</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">文档</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">教程</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">博客</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">公司</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">关于我们</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">联系方式</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">条款与隐私</a></li>
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

// 功能卡片组件接口
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// 功能卡片组件
function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// 步骤卡片组件接口
interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

// 步骤卡片组件
function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center text-center">
      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl font-bold text-primary">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// 用户反馈卡片组件接口
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

// 用户反馈卡片组件
function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <p className="text-gray-700 mb-6 italic">"{quote}"</p>
      <div>
        <p className="font-bold">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  );
} 