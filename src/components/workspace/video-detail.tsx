import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getProjectProgressByProjectId } from '@/api/project-progress';

// This component will display a video detail page, similar to the screenshot
export default function VideoDetail() {
  const { id: projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for video data
  const [videoData, setVideoData] = useState<any>(location.state?.progress || null);
  const [loading, setLoading] = useState(!location.state?.progress);
  const [error, setError] = useState<string | null>(null);
  
  // State for share dialog
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch data if not available from location state
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError('未找到项目ID');
        setLoading(false);
        return;
      }
      
      // If we already have data from location state, no need to fetch
      if (videoData) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getProjectProgressByProjectId(projectId);
        
        if (data) {
          setVideoData(data);
        } else {
          setError('未找到视频数据');
        }
      } catch (err) {
        console.error('获取视频数据失败:', err);
        setError('获取视频数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, videoData]);

  const handleDownload = () => {
    if (videoData?.url) {
      window.open(videoData.url, '_blank');
    }
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };
  
  const handleCopy = () => {
    // Generate the share URL based on current location
    const shareUrl = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="text-xl text-gray-700">加载视频数据中...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !videoData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xl text-gray-700">{error || '未找到视频数据'}</span>
          <Button 
            variant="outline" 
            onClick={() => navigate('/app/projects')}
          >
            返回项目列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{videoData?.projectName || "视频详情"}</h1>
        
        <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
          {videoData?.status === 'SUCCEEDED' && videoData?.url ? (
            <video 
              className="w-full aspect-video" 
              controls
              poster={videoData.thumbnailUrl || "/placeholder-image.jpg"}
            >
              <source src={videoData.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
              {videoData?.thumbnailUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <img 
                    src={videoData.thumbnailUrl} 
                    alt="Video thumbnail" 
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <p className="text-white text-lg">等待视频生成</p>
              )}
              {videoData?.status === 'PENDING' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white text-lg">视频生成中...</p>
                </div>
              )}
              {videoData?.status === 'FAILED' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white text-lg">视频生成失败</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="default" 
            className="flex items-center space-x-2"
            onClick={handleDownload}
            disabled={!videoData?.url || videoData?.status !== 'SUCCEEDED'}
          >
            <Download size={18} />
            <span>下载</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={handleShare}
          >
            <Share2 size={18} />
            <span>分享</span>
          </Button>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享视频</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input 
                readOnly
                value={`${window.location.origin}${window.location.pathname}`}
                className="flex-1"
              />
              <Button 
                onClick={handleCopy} 
                size="sm" 
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              复制链接分享给好友，即可查看此视频
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 