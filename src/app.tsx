import { Player, PlayerProps } from '@components/player';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function App() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [currentQuality, setCurrentQuality] = useState('');
	const [quality, setQuality] = useState(-1);
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

		// Добавляем обработчик события 'timeupdate'
		video.addEventListener('timeupdate', handleTimeUpdate);

		// Очистка обработчика при размонтировании компонента
		return () => {
			if (video) {
				video.removeEventListener('timeupdate', handleTimeUpdate);
			}
		};
	}, []);

	const formatTime = (time: number | undefined) => {
		if (time === undefined || isNaN(time)) return '--:--';

		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${`${minutes}`.padStart(2, '0')}:${`${seconds}`.padStart(2, '0')}`;
	};

	const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
		if (videoRef.current) {
			videoRef.current.currentTime = parseFloat(event.target.value);
			setCurrentTime(parseFloat(event.target.value));
		}
	};

	const handleClick = (quality: number) => {
		setQuality(quality);
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
		await videoRef.current?.requestFullscreen();
	};

	return (
		<>
			<img src={'MIRIX.svg'} alt={''} />
			<div style={{ width: '100%' }}>
				<Player
					ref={videoRef}
					url={url}
					level={quality}
					onManifestParsed={handleParsed}
					onLevelSwitched={handleLevelChange}
				/>
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
						borderColor:
							option.value === quality ? 'red' : undefined,
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
