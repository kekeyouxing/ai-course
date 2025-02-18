import './countdown-overlay.css';
interface CountdownOverlayProps {
    countdown: number | null;
}

export default function CountdownOverlay({ countdown }: CountdownOverlayProps) {
    return (
        <div className="countdown-overlay">
            <div
                className="countdown-number"
                style={{
                    transform: `scale(${1 + (countdown || 0) * 0.2})`,
                    opacity: countdown ? 1 : 0
                }}
            >
                {countdown}
            </div>
        </div>
    );
}

