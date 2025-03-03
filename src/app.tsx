import { Controls } from '@components/controls';
import { Player } from '@components/player';
import { Button, Slider } from '@components/ui';
import { formatTime } from '@lib/format-time';
import { SliderProps } from '@radix-ui/react-slider';
import { PlayerProps } from '@types';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

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
	const [buffered, setBuffered] = useState<number | null>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleTimeUpdate = () => {
			if (video.duration) setCurrent(video.currentTime);
		};

		const handleProgress = () => {
			if (video.buffered.length > 0) {
				console.log(video.buffered.start(0));
				console.log(video.buffered.end(1));
				setBuffered(video.buffered.end(video.buffered.length - 1));
			}
		};

		video.addEventListener('timeupdate', handleTimeUpdate);
		video.addEventListener('progress', handleProgress);
		video.addEventListener('loadedmetadata', handleProgress);

		return () => {
			if (video) {
				video.removeEventListener('timeupdate', handleTimeUpdate);
				video.removeEventListener('progress', handleProgress);
				video.removeEventListener('loadedmetadata', handleProgress);
			}
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

	const handleSeek: SliderProps['onValueCommit'] = (value) => {
		if (videoRef.current) {
			videoRef.current.currentTime = value[0];
			setCurrent(value[0]);
		}
	};

	const handleClick = (level: number) => {
		setLevel(level);
	};

	const handleParsed: PlayerProps['onManifestParsed'] = (data) => {
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

	const handleFullScreen = async () => {
		const container = containerRef.current;
		const video = videoRef.current;
		if (!(video && container)) return;

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

	const handlePausedChange = async () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.paused) {
			await video.play();
		} else {
			video.pause();
		}
	};

	return (
		<div ref={containerRef} className={'relative w-full'}>
			<Player
				ref={videoRef}
				url={videoUrl}
				level={level}
				onManifestParsed={handleParsed}
				onLevelSwitched={handleLevelChange}
			>
				<code>video</code> is not supported.
			</Player>
			<div
				className={
					'w-full h-full absolute flex flex-col top-0 items-center justify-end'
				}
			>
				<div className={'mb-8'}>
					<Controls>
						<Button onClick={handlePausedChange}>
							{videoRef?.current?.paused ? 'play' : 'pause'}
						</Button>
						<Slider
							min={0}
							max={videoRef.current?.duration || 1}
							value={[current ?? 0]}
							progress={buffered ?? 0}
							onValueChange={handleSeek}
						/>
						<p>
							{`Current Time: ${formatTime(current)} / ${formatTime(buffered)} / ${formatTime(videoRef.current?.duration)}`}
						</p>
						<Button onClick={handleFullScreen}>fullscreen</Button>
						<div className={'flex gap-1'}>
							{qualityOptions.map((option) => (
								<Button
									key={option.value}
									style={{
										padding: '9px 12px',
										fontSize: 14,
										lineHeight: 1,
										border:
											option.value === level
												? '1px solid red'
												: undefined,
									}}
									onClick={() => handleClick(option.value)}
								>
									{option.label}
								</Button>
							))}
						</div>
						quality: {currentQuality}
					</Controls>
				</div>
			</div>
		</div>
	);
}
