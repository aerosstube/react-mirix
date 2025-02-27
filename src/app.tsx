import { Player, PlayerProps } from '@components/player';
import { formatTime } from '@lib/format-time';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function App() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [currentQuality, setCurrentQuality] = useState('');
	const [level, setLevel] = useState(-1);
	const [qualityOptions, setQualityOptions] = useState([
		{ label: 'Авто', value: -1 },
	]);
	const [url, setUrl] = useState(
		'/hls/solo-leveling-compilation/manifest.m3u8'
	);
	const [currentTime, setCurrentTime] = useState(0);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// Функция для обновления currentTime
		const handleTimeUpdate = () => {
			setCurrentTime(video.currentTime);
		};

		video.addEventListener('timeupdate', handleTimeUpdate);

		return () => {
			if (video) {
				video.removeEventListener('timeupdate', handleTimeUpdate);
			}
		};
	}, []);

	const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
		if (videoRef.current) {
			videoRef.current.currentTime = parseFloat(event.target.value);
			setCurrentTime(parseFloat(event.target.value));
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

	const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUrl(e.currentTarget.value);
	};

	const handleFullScreen = async () => {
		const container = containerRef.current;
		const video = videoRef.current;
		if (!(video && container)) return;

		if (navigator.userAgent.indexOf('iPhone') !== -1) {
			// @ts-ignore
			await video.webkitEnterFullscreen();
		} else {
			await container.requestFullscreen();
		}
	};

	return (
		<>
			<img src={'MIRIX.svg'} alt={''} />
			<div ref={containerRef} style={{ width: '100%' }}>
				<Player
					ref={videoRef}
					url={url}
					level={level}
					onManifestParsed={handleParsed}
					onLevelSwitched={handleLevelChange}
				>
					<code>video</code> is not supported.
				</Player>
			</div>
			<button
				onClick={() =>
					videoRef?.current?.paused
						? videoRef?.current?.play()
						: videoRef?.current?.pause()
				}
			>
				{videoRef?.current?.paused ? 'play' : 'pause'}
			</button>
			<input
				value={url}
				style={{ width: '100%' }}
				onChange={handleUrlChange}
			/>
			<input
				type='range'
				min='0'
				max={videoRef.current?.duration || 1} // max - длительность видео
				value={currentTime}
				onChange={handleSeek}
				step='0.1'
			/>
			<p>
				{`Current Time: ${formatTime(videoRef.current?.duration ? currentTime : undefined)} / ${formatTime(videoRef.current?.duration)}`}
			</p>
			<button onClick={handleFullScreen}>fullscreen</button>
			{qualityOptions.map((option) => (
				<button
					key={option.value}
					style={{
						padding: '9px 12px',
						fontSize: 14,
						lineHeight: 1,
						borderColor: option.value === level ? 'red' : undefined,
					}}
					onClick={() => handleClick(option.value)}
				>
					{option.label}
				</button>
			))}
			<div
				style={{
					background: 'black',
					color: 'white',
					padding: 24,
					borderRadius: 16,
					fontSize: 32,
				}}
			>
				quality: {currentQuality}
			</div>
		</>
	);
}
