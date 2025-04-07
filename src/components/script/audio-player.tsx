import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // 初始化音频
  useEffect(() => {
    const audio = new Audio();
    
    // 设置音频属性
    audio.preload = "auto"; // 确保预加载
    audio.volume = volume;
    
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

  // 当音量改变时更新音频元素的音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  // 处理音量改变
  const handleVolumeChange = ([value]: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // 处理静音切换
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  // 处理音量控制显示
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        
        <div className="relative" ref={volumeControlRef}>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 p-0"
            onClick={handleMuteToggle}
            onMouseEnter={() => setShowVolumeSlider(true)}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-background border border-border rounded-md shadow-md z-10 w-32">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                className="mb-1"
              />
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleVolumeChange([0])}
                >
                  <VolumeX className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => handleVolumeChange([1])}
                >
                  <Volume2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 