import { Controls } from '@components/controls';
import { Player } from '@components/player';
import { Button, Scrubber, Slider } from '@components/ui';
import { Icon } from '@components/ui/icon';
import { clampMax, clampMin } from '@lib/clamp';
import { debounce } from '@lib/debounce';
import { getStorageMuted, getStorageVolume } from '@lib/storage';
import { cn } from '@lib/utils';
import { SliderProps } from '@radix-ui/react-slider';
import { PlayerProps, ScrubberProps } from '@types';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

const initialVolume = getStorageVolume();
const initialMuted = getStorageMuted();

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentQuality, setCurrentQuality] = useState('');
    const [level, setLevel] = useState(-1);
    const [qualityOptions, setQualityOptions] = useState([
        { label: 'Авто', value: -1 },
    ]);
    const [searchParams, setSearchParams] = useSearchParams();
    const videoUrl = searchParams.get('video-url') ?? '';
    const [current, setCurrent] = useState<number | null>(null);
    const currentRef = useRef(0);
    const [buffer, setBuffer] = useState<{ start: number; end: number }[]>([]);
    const [volume, setVolume] = useState(initialMuted ? 0 : initialVolume);
    const [muted, setMuted] = useState(initialMuted);
    const [isPIP, setIsPIP] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [preventHide, setPreventHide] = useState(true);
    const hideTimerRef = useRef<number | null>(null);

    const resetHideTimer = () => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }
        setIsVisible(true);

        if (!preventHide) {
            hideTimerRef.current = window.setTimeout(() => {
                setIsVisible(false);
            }, 1500);
        }
    };

    const handleSeek: ScrubberProps['onSeek'] = (value) => {
        setIsSeeking(true);
        setCurrent(value);
        currentRef.current = value;
    };

    const handleSeekCommit: ScrubberProps['onSeekCommit'] = (value) => {
        const video = videoRef.current;
        if (!video) return;

        videoRef.current.currentTime = value;
        setIsSeeking(false);
    };

    const handleManifestParsed: PlayerProps['onManifestParsed'] = (data) => {
        setQualityOptions([
            { label: 'Авто', value: -1 },
            ...data.levels.map((level, index) => ({
                label: `${level.height}p`,
                value: index,
            })),
        ]);
    };

    const handleLevelChange: PlayerProps['onLevelSwitched'] = (
        _data,
        level
    ) => {
        setCurrentQuality(`${level.height}p`);
    };

    const handlePausedChange = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            await video.play();
        } else {
            video.pause();
        }
    };

    const handleTimeUpdate: PlayerProps['onTimeUpdate'] = (e) => {
        const video = e.currentTarget;

        if (video.duration && !isSeeking) {
            const value = video.currentTime;

            setCurrent(value);
            currentRef.current = value;
        }
    };

    const handleProgress: PlayerProps['onProgress'] = (e) => {
        const video = e.currentTarget;

        const ranges = [];
        for (let i = 0; i < video.buffered.length; i++) {
            ranges.push({
                start: video.buffered.start(i),
                end: video.buffered.end(i),
            });
        }

        setBuffer(ranges);
    };

    const handlePlay = () => {
        setIsPaused(false);
        setPreventHide(false);
    };

    const handlePause = () => {
        setIsPaused(true);
        setPreventHide(true);
    };

    const handleVolumeChange: PlayerProps['onVolumeChange'] = (e) => {
        const video = e.currentTarget;

        setVolume(video.muted ? 0 : video.volume);
        setMuted(video.muted);
    };

    const handleVolumeSliderChange: SliderProps['onValueChange'] = (_value) => {
        const video = videoRef.current;
        if (!video) return;

        const value = _value.at(0) ?? 0;

        video.volume = value;

        if (value > 0 && video.muted) {
            video.muted = false;
            setMuted(false);
        }
    };

    const handleVolumeSliderCommit: SliderProps['onValueCommit'] = (value) => {
        localStorage.setItem('volume', `${value[0]}`);
    };

    const handleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        localStorage.setItem('muted', `${video.muted}`);
    };

    const handlePIP = async () => {
        const video = videoRef.current;
        if (!video) return;

        await video.requestPictureInPicture();
    };

    const handleFullScreen = async () => {
        const container = containerRef.current;
        const video = videoRef.current;
        if (!(container && video)) return;

        const fullscreen =
            document.fullscreenElement ||
            // @ts-ignore
            document.webkitFullscreenElement;

        if (navigator.userAgent.indexOf('iPhone') !== -1) {
            if (fullscreen) {
                // @ts-ignore
                await video.webkitExitFullscreen();
            } else {
                // @ts-ignore
                await video.webkitEnterFullscreen();
            }
        } else {
            if (fullscreen) {
                await document.exitFullscreen();
            } else {
                await container.requestFullscreen();
            }
        }
    };

    const handleMouseEnter = () => {
        if (!isPaused) setPreventHide(true);
    };

    const handleMouseLeave = () => {
        if (!isPaused) setPreventHide(false);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const debouncedUpdateTime = debounce((time: number) => {
            video.currentTime = time;
            setIsSeeking(false);
        }, 300);

        const handleKeyDown = async (e: KeyboardEvent) => {
            console.log(e.key);
            if (video.currentTime !== undefined && video.duration) {
                switch (e.key) {
                    case 'ArrowLeft': {
                        resetHideTimer();
                        setIsSeeking(true);

                        const value = clampMin(currentRef.current - 10, 0);

                        currentRef.current = value;
                        setCurrent(value);

                        break;
                    }
                    case 'ArrowRight': {
                        resetHideTimer();
                        setIsSeeking(true);

                        const value = clampMax(
                            currentRef.current + 10,
                            video.duration
                        );

                        currentRef.current = value;
                        setCurrent(value);

                        break;
                    }
                    case 'i': {
                        await handlePIP();

                        break;
                    }
                    case 'f': {
                        resetHideTimer();
                        await handleFullScreen();

                        break;
                    }
                    case 'm': {
                        resetHideTimer();
                        handleMute();

                        break;
                    }
                    case ' ': {
                        await handlePausedChange();

                        break;
                    }
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                debouncedUpdateTime(currentRef.current);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        resetHideTimer();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [preventHide]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.volume = initialVolume;
        video.muted = initialMuted;

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleEnterPIP = () => {
            setIsPIP(true);
        };

        const handleLeavePIP = () => {
            setIsPIP(false);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener(
            'webkitfullscreenchange',
            handleFullscreenChange
        );
        document.addEventListener('enterpictureinpicture', handleEnterPIP);
        document.addEventListener('leavepictureinpicture', handleLeavePIP);

        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            );
            document.removeEventListener(
                'webkitfullscreenchange',
                handleFullscreenChange
            );
            document.removeEventListener(
                'enterpictureinpicture',
                handleEnterPIP
            );
            document.removeEventListener(
                'leavepictureinpicture',
                handleLeavePIP
            );
        };
    }, []);

    useEffect(() => {
        if (!videoUrl) {
            setSearchParams(
                { ['video-url']: 'hls/test/master.m3u8' },
                { replace: true }
            );
        }
    }, [videoUrl, setSearchParams]);

    return (
        <div
            ref={containerRef}
            className={'relative w-full h-screen'}
            style={{ cursor: !isVisible ? 'none' : '' }}
            onMouseMove={resetHideTimer}
            onClick={handlePausedChange}
            onDoubleClick={handleFullScreen}
        >
            <Player
                ref={videoRef}
                className={'opacity-100'}
                url={videoUrl}
                level={level}
                onManifestParsed={handleManifestParsed}
                onLevelSwitched={handleLevelChange}
                onTimeUpdate={handleTimeUpdate}
                onProgress={handleProgress}
                onLoadedMetadata={handleProgress}
                onPlay={handlePlay}
                onPause={handlePause}
                onVolumeChange={handleVolumeChange}
            >
                <code>video</code> is not supported.
            </Player>
            <div
                className={
                    'w-full h-full absolute flex flex-col top-0 items-center justify-end'
                }
            >
                <div
                    className={cn(
                        'mb-8 transition-transform translate-y-4',
                        isVisible && !isPIP && 'translate-y-0'
                    )}
                >
                    <Controls
                        className={cn(
                            'transition-opacity opacity-0',
                            isVisible && !isPIP && 'opacity-100'
                        )}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className={'w-full h-10 flex items-center'}>
                            <div className={'w-full flex items-center gap-4'}>
                                <div className={'flex items-center gap-2'}>
                                    <Button
                                        variant={'text'}
                                        size={'icon-lg'}
                                        onClick={handleMute}
                                    >
                                        <Icon
                                            type={
                                                !muted
                                                    ? volume > 0
                                                        ? volume > 0.5
                                                            ? 'volume'
                                                            : 'volume-half'
                                                        : 'volume-none'
                                                    : 'volume-muted'
                                            }
                                        />
                                    </Button>
                                    <Slider
                                        className={'w-24 py-[9px]'}
                                        value={[volume]}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        onValueChange={handleVolumeSliderChange}
                                        onValueCommit={handleVolumeSliderCommit}
                                    />
                                </div>
                            </div>
                            <div className={'flex items-center gap-4'}>
                                <Button
                                    className={
                                        'text-[40px] transition-transform hover:scale-110'
                                    }
                                    variant={'text-active'}
                                    size={'icon-lg'}
                                    onClick={handlePausedChange}
                                >
                                    <Icon type={isPaused ? 'play' : 'pause'} />
                                </Button>
                            </div>
                            <div
                                className={
                                    'w-full flex items-center justify-end gap-4'
                                }
                            >
                                <Button
                                    className={cn(
                                        'w-[52px] px-0 opacity-0',
                                        currentQuality && 'opacity-100'
                                    )}
                                    size={'sm'}
                                >
                                    {currentQuality}
                                </Button>
                                <Button
                                    variant={'text'}
                                    size={'icon-lg'}
                                    // onClick={handleFullScreen}
                                >
                                    <Icon type={'settings'} />
                                </Button>
                                <Button
                                    variant={'text'}
                                    size={'icon-lg'}
                                    onClick={handlePIP}
                                >
                                    <Icon type={'pip'} />
                                </Button>
                                <Button
                                    variant={'text'}
                                    size={'icon-lg'}
                                    onClick={handleFullScreen}
                                >
                                    <Icon
                                        type={
                                            isFullscreen
                                                ? 'minimize'
                                                : 'maximize'
                                        }
                                    />
                                </Button>
                            </div>
                        </div>
                        <Scrubber
                            current={current}
                            duration={videoRef.current?.duration}
                            buffer={buffer}
                            onSeek={handleSeek}
                            onSeekCommit={handleSeekCommit}
                        />
                    </Controls>
                </div>
            </div>
        </div>
    );
}
