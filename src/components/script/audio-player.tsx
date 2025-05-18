import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  audioLength: number; // 音频长度（毫秒）
  onPlaybackComplete?: () => void;
  className?: string;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  audioUrl, 
  audioLength,
  onPlaybackComplete,
  className,
  autoPlay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(audioLength / 1000); // 确保将毫秒转换为秒
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化音频
  useEffect(() => {
    const audio = new Audio();
    
    // 设置音频属性
    audio.preload = "auto"; // 确保预加载
    
    // 添加缓冲事件监听
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handlePlaying = () => {
      setIsBuffering(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      setDuration(audio.duration || audioLength / 1000); // 音频元素的duration是秒，确保audioLength转换为秒
      if (autoPlay) {
        handlePlay();
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onPlaybackComplete) {
        onPlaybackComplete();
      }
    };
    
    // 添加错误处理
    const handleError = (e: ErrorEvent) => {
      console.error('音频加载或播放错误:', e);
      setIsLoading(false);
    };

    // 注册所有事件监听器
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);
    
    // 最后设置音频源并开始加载
    audio.src = audioUrl;
    audio.load();
    
    audioRef.current = audio;
    
    return () => {
      // 清理所有事件监听器
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
      
      // 停止播放并释放资源
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, audioLength, onPlaybackComplete, autoPlay]);

  // 处理播放/暂停
  const handlePlayPause = () => {
    if (isLoading) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      handlePlay();
    }
  };

  // 处理播放
  const handlePlay = () => {
    if (!audioRef.current || isLoading) return;
    
    // 由于浏览器限制，play()返回一个Promise
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      setIsPlaying(true); // 立即更新UI状态，提高响应性
      playPromise
        .catch(error => {
          console.error('播放失败:', error);
          setIsPlaying(false); // 播放失败时重置状态
        });
    }
  };

  // 处理进度条改变
  const handleTimeChange = ([value]: number[]) => {
    if (audioRef.current) {
      // 设置一个小缓冲，防止频繁的时间更新
      const newTime = value;
      if (Math.abs(newTime - currentTime) > 0.5) {
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("bg-background/95 backdrop-blur-sm rounded-md border border-border p-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full text-primary hover:bg-primary/10 h-8 w-8 p-0 flex-shrink-0"
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading || isBuffering ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 fill-primary" />
          ) : (
            <Play className="h-4 w-4 fill-primary" />
          )}
        </Button>
        
        <span className="text-xs text-muted-foreground w-10 text-right mr-1 hidden sm:inline">{formatTime(currentTime)}</span>
        
        <Slider
          min={0}
          max={duration}
          step={0.01}
          value={[currentTime]}
          onValueChange={handleTimeChange}
          className="flex-1"
          disabled={isLoading}
        />
        
        <span className="text-xs text-muted-foreground w-10 ml-1 hidden sm:inline">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer; 