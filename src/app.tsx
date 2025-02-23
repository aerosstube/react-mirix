import { Player, PlayerProps } from '@components/player';
import { ChangeEvent, useState } from 'react';

export default function App() {
	const [currentQuality, setCurrentQuality] = useState('');
	const [quality, setQuality] = useState(-1);
	const [qualityOptions, setQualityOptions] = useState([
		{ label: 'Авто', value: -1 },
	]);
	const [url, setUrl] = useState(
		'/hls/solo-leveling-compilation/manifest.m3u8'
	);

	const handleClick = (quality: number) => {
		setQuality(quality);
	};

	const handleParsed: PlayerProps['onManifestParsed'] = (data) => {
		console.log('Manifest loaded:', data);
		setQualityOptions([
			{ label: 'Авто', value: -1 },
			...data.levels.map((level, index) => ({
				label: `${level.height}p`,
				value: index,
			})),
		]);
	};

	const handleLevelChange: PlayerProps['onLevelSwitched'] = (data, level) => {
		console.log('Level switched:', data);
		console.log('Current level:', level);
		setCurrentQuality(`${level.height}p`);
	};

	const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
		setUrl(e.currentTarget.value);
	};

	return (
		<>
			<img src={'MIRIX.svg'} alt={''} />
			<Player
				config={{ maxBufferLength: 10 }}
				url={url}
				level={quality}
				onManifestParsed={handleParsed}
				onLevelSwitched={handleLevelChange}
			/>
			<input value={url} onChange={handleUrlChange} />
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
		</>
	);
}
