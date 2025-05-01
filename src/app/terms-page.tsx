import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TermsPage() {
  const [tabValue, setTabValue] = useState("terms");
  
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
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">条款与隐私</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            我们致力于保护您的隐私和权益，请仔细阅读以下条款
          </p>
        </div>
      </section>

      {/* 主要内容区 */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* 选项卡导航 */}
          <Tabs 
            defaultValue="terms" 
            value={tabValue}
            onValueChange={setTabValue}
            className="w-full mb-8"
          >
            <div className="flex justify-center">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="terms">服务条款</TabsTrigger>
                <TabsTrigger value="privacy">隐私政策</TabsTrigger>
              </TabsList>
            </div>
            
            {/* 服务条款内容 */}
            <TabsContent value="terms" className="mt-6">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-6">VideoAI 服务条款</h2>
                <p className="text-gray-600 mb-4">
                  最后更新日期：{new Date().toISOString().split('T')[0]}
                </p>
                
                <div className="space-y-8 mt-8">
                  <section>
                    <h3 className="text-xl font-bold mb-4">1. 接受条款</h3>
                    <p className="text-gray-700 mb-3">
                      欢迎使用VideoAI（以下简称"我们"、"服务"或"平台"）。本服务条款（以下简称"条款"）是您与VideoAI之间就使用我们的产品和服务达成的法律协议。通过访问或使用我们的网站、应用程序或服务，您表示您已阅读、理解并同意受这些条款的约束。
                    </p>
                    <p className="text-gray-700">
                      如果您不同意这些条款的任何部分，请勿使用我们的服务。我们保留随时修改这些条款的权利，修改后的条款将在我们的网站上发布。您继续使用服务将被视为接受修改后的条款。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">2. 服务描述</h3>
                    <p className="text-gray-700 mb-3">
                      VideoAI是一个AI驱动的视频创作平台，允许用户创建、编辑和分享视频内容。我们提供各种工具和功能，包括但不限于AI视频生成、语音合成、形状和动画添加等。
                    </p>
                    <p className="text-gray-700">
                      我们不断努力改进服务，可能会定期添加、修改或删除功能。我们保留更改、暂停或终止服务任何部分的权利，恕不另行通知。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">3. 用户账户</h3>
                    <p className="text-gray-700 mb-3">
                      要使用我们的某些功能，您可能需要创建一个账户。您同意提供准确、完整和最新的信息，并有责任维护您账户的安全性，包括保护您的密码和限制对您账户的访问。
                    </p>
                    <p className="text-gray-700 mb-3">
                      您对通过您的账户发生的所有活动负全部责任，无论这些活动是否得到您的授权。如果您发现任何未经授权的使用，请立即通知我们。
                    </p>
                    <p className="text-gray-700">
                      我们保留拒绝服务、终止账户、删除或编辑内容或取消订单的权利，我们拥有完全的自由裁量权。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">4. 订阅和付款</h3>
                    <p className="text-gray-700 mb-3">
                      我们提供各种订阅计划和一次性购买选项。订阅将自动续订，除非您在当前订阅期结束前取消。订阅费用不可退还。
                    </p>
                    <p className="text-gray-700 mb-3">
                      您可以随时升级您的会员等级，升级后将立即生效。请注意，会员等级仅支持升级，不支持降级操作。
                    </p>
                    <p className="text-gray-700">
                      我们不提供退款服务。会员订阅一旦购买生效，将无法取消或退款。视频包购买后也无法申请退款，请在购买前确认您的需求。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">5. 用户内容</h3>
                    <p className="text-gray-700 mb-3">
                      您保留对您使用我们服务创建的内容的所有权利。但是，通过使用我们的服务，您授予我们全球性、非排他性、免版税的许可，允许我们使用、复制、修改、分发和展示您的内容，以便提供和改进我们的服务。
                    </p>
                    <p className="text-gray-700 mb-3">
                      您同意不会上传、创建或分享任何侵犯他人知识产权、违反任何法律或法规、有害、欺诈、欺骗、威胁、骚扰、诽谤、淫秽或其他令人反感的内容。
                    </p>
                    <p className="text-gray-700">
                      我们保留但无义务监控、编辑或删除我们认为违反这些条款或对其他用户有害的内容的权利。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">6. 知识产权</h3>
                    <p className="text-gray-700 mb-3">
                      除了用户内容外，服务及其原始内容、功能和特性是并将保持为VideoAI及其许可方的专有财产。服务受版权、商标和其他国内和国际法律保护。
                    </p>
                    <p className="text-gray-700">
                      未经我们明确许可，您不得复制、修改、创建衍生作品、公开展示、公开表演、重新发布、下载、存储或传输服务的任何部分。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">7. 免责声明</h3>
                    <p className="text-gray-700 mb-3">
                      我们的服务按"原样"和"可用"提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、及时、安全或无错误，也不保证通过使用服务获得的结果将准确或可靠。
                    </p>
                    <p className="text-gray-700">
                      您理解并同意，您使用服务的风险完全由您自己承担。在适用法律允许的最大范围内，我们明确拒绝所有保证，无论明示或暗示。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">8. 责任限制</h3>
                    <p className="text-gray-700 mb-3">
                      在适用法律允许的最大范围内，VideoAI及其董事、员工、合作伙伴、代理商或附属公司在任何情况下都不对任何直接、间接、偶然、特殊、惩罚性或后果性损害负责，包括但不限于利润损失、商誉损失、数据丢失或其他无形损失。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">9. 适用法律</h3>
                    <p className="text-gray-700 mb-3">
                      这些条款应受中华人民共和国法律管辖并依其解释，不考虑其冲突法规定。
                    </p>
                    <p className="text-gray-700">
                      您同意，与这些条款或我们服务相关的任何法律诉讼或程序应仅在中国法院提起，您在此不可撤销地同意并提交给这些法院的专属管辖权。
                    </p>
                  </section>
                  
                </div>
              </div>
            </TabsContent>
            
            {/* 隐私政策内容 */}
            <TabsContent value="privacy" className="mt-6">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-6">VideoAI 隐私政策</h2>
                <p className="text-gray-600 mb-4">
                  最后更新日期：{new Date().toISOString().split('T')[0]}
                </p>
                
                <div className="space-y-8 mt-8">
                  <section>
                    <h3 className="text-xl font-bold mb-4">1. 引言</h3>
                    <p className="text-gray-700 mb-3">
                      VideoAI（"我们"、"我们的"或"本公司"）尊重您的隐私，致力于保护您的个人数据。本隐私政策将告知您我们如何收集、使用、披露、保留和保护您的信息。
                    </p>
                    <p className="text-gray-700">
                      请仔细阅读本政策，了解我们对您的个人数据的处理方式及您的隐私权。通过使用我们的服务，您同意我们按照本政策处理您的个人数据。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">2. 我们收集的信息</h3>
                    <p className="text-gray-700 mb-3">
                      我们可能收集以下类型的信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>个人识别信息：</strong> 包括姓名、电子邮件地址、电话号码、邮寄地址等，当您创建账户、进行购买或联系我们时提供。
                      </li>
                      <li>
                        <strong>账户信息：</strong> 包括您的登录凭证、账户设置和偏好。
                      </li>
                      <li>
                        <strong>交易信息：</strong> 包括您的购买历史、付款方式和账单信息。
                      </li>
                      <li>
                        <strong>用户内容：</strong> 您通过我们的服务创建、上传或分享的内容。
                      </li>
                      <li>
                        <strong>使用数据：</strong> 关于您如何使用我们服务的信息，包括访问时间、使用的功能、点击的链接等。
                      </li>
                      <li>
                        <strong>设备信息：</strong> 包括您的IP地址、浏览器类型、设备类型、操作系统等。
                      </li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">3. 我们如何使用您的信息</h3>
                    <p className="text-gray-700 mb-3">
                      我们可能将收集到的信息用于以下目的：
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>提供、维护和改进我们的服务</li>
                      <li>处理和完成交易</li>
                      <li>创建和管理您的账户</li>
                      <li>向您发送技术通知、更新、安全警报和支持消息</li>
                      <li>响应您的评论、问题和请求</li>
                      <li>根据您的偏好向您提供个性化的内容和体验</li>
                      <li>监控和分析趋势、使用情况和活动</li>
                      <li>检测、调查和防止欺诈交易和其他非法活动</li>
                      <li>保护我们服务、用户和公众的权利、隐私、安全或财产</li>
                      <li>遵守适用的法律、法规和法律程序</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">4. 信息共享与披露</h3>
                    <p className="text-gray-700 mb-3">
                      我们不会出售或出租您的个人数据给第三方用于营销目的。我们可能在以下情况下共享您的信息：
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>
                        <strong>服务提供商：</strong> 与我们合作提供服务的第三方公司和个人，如支付处理、数据分析、电子邮件递送、托管服务等。
                      </li>
                      <li>
                        <strong>业务合作伙伴：</strong> 我们可能与业务合作伙伴共享信息，以提供某些服务或举办联合活动。
                      </li>
                      <li>
                        <strong>合规与法律要求：</strong> 我们可能会披露信息以响应传票、法院命令或其他法律要求，或者保护我们的权利、财产和安全，以及我们用户或公众的权利、财产和安全。
                      </li>
                      <li>
                        <strong>业务转让：</strong> 如果我们参与合并、收购或资产出售，您的信息可能作为业务资产的一部分被转让。
                      </li>
                      <li>
                        <strong>征得同意：</strong> 我们可能在征得您的同意后与第三方共享您的信息。
                      </li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">5. 数据安全</h3>
                    <p className="text-gray-700 mb-3">
                      我们采取各种安全措施保护您的个人数据，防止未经授权的访问、使用、更改和披露。这些措施包括加密传输中的数据、限制员工访问个人数据以及维护物理、电子和程序安全措施。
                    </p>
                    <p className="text-gray-700">
                      尽管我们努力保护您的个人数据，但没有任何互联网传输或电子存储方法是100%安全的。因此，我们不能保证信息的绝对安全。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">6. 您的隐私权</h3>
                    <p className="text-gray-700 mb-3">
                      根据您所在地区的适用法律，您可能拥有以下权利：
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>访问您的个人数据</li>
                      <li>纠正不准确或不完整的数据</li>
                      <li>删除您的个人数据</li>
                      <li>限制或反对处理您的个人数据</li>
                      <li>数据可携带性</li>
                      <li>撤回同意</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      如果您希望行使这些权利，请通过本政策底部提供的联系信息与我们联系。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">7. Cookie和类似技术</h3>
                    <p className="text-gray-700 mb-3">
                      我们使用Cookie和类似技术收集信息并改善您的体验。Cookie是存储在您浏览器中的小文本文件，允许我们识别您的浏览器或设备。您可以通过浏览器设置拒绝Cookie，但这可能会导致某些功能无法正常工作。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">8. 儿童隐私</h3>
                    <p className="text-gray-700 mb-3">
                      我们的服务不面向16岁以下的儿童。我们不会故意收集16岁以下儿童的个人数据。如果您是父母或监护人，并且您认为您的孩子向我们提供了个人数据，请联系我们，我们将采取措施删除这些信息。
                    </p>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-bold mb-4">9. 隐私政策的变更</h3>
                    <p className="text-gray-700 mb-3">
                      我们可能会不时更新本隐私政策，以反映我们实践的变化或出于其他运营、法律或监管原因。我们会通过在我们的网站上发布新的政策通知您任何变更。
                    </p>
                    <p className="text-gray-700">
                      建议您定期查看本政策，了解我们如何保护您的信息。
                    </p>
                  </section>
                
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
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