import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

type MediaControlsProps = {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  onPlayToggle: () => void
  onTimeChange: (value: number) => void
  onVolumeChange: (value: number) => void
  onMuteToggle: () => void
  onSceneChange: (delta: number) => void
  hasPrevious: boolean
  hasNext: boolean
}

export function MediaControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onPlayToggle,
  onTimeChange,
  onVolumeChange,
  onMuteToggle,
  onSceneChange,
  hasPrevious,
  hasNext
}: MediaControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background/90 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm">{formatTime(currentTime)}</span>
        <Slider
          value={[(currentTime / duration) * 100]}
          onValueChange={([value]) => onTimeChange((value / 100) * duration)}
          className="flex-1"
        />
        <span className="text-sm">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayToggle}
            disabled={duration === 0}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSceneChange(-1)}
            disabled={!hasPrevious}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSceneChange(1)}
            disabled={!hasNext}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onMuteToggle}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume]}
            onValueChange={([value]) => onVolumeChange(value)}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}