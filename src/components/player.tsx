import { hlsChangeLevel, hlsInit } from '@lib/hls';
import Hls, {
	AudioTrackLoadedData,
	AudioTracksUpdatedData,
	AudioTrackSwitchedData,
	AudioTrackSwitchingData,
	BackBufferData,
	BufferAppendedData,
	BufferAppendingData,
	BufferCodecsData,
	BufferCreatedData,
	BufferEOSData,
	BufferFlushedData,
	BufferFlushingData,
	CuesParsedData,
	ErrorData,
	FPSDropData,
	FPSDropLevelCappingData,
	FragBufferedData,
	FragChangedData,
	FragDecryptedData,
	FragLoadedData,
	FragLoadEmergencyAbortedData,
	FragLoadingData,
	FragParsedData,
	FragParsingInitSegmentData,
	FragParsingMetadataData,
	FragParsingUserdataData,
	HlsConfig,
	InitPTSFoundData,
	KeyLoadedData,
	KeyLoadingData,
	Level,
	LevelLoadedData,
	LevelLoadingData,
	LevelPTSUpdatedData,
	LevelsUpdatedData,
	LevelSwitchedData,
	LevelSwitchingData,
	LevelUpdatedData,
	ManifestLoadedData,
	ManifestLoadingData,
	ManifestParsedData,
	MediaAttachedData,
	MediaAttachingData,
	NonNativeTextTracksData,
	SteeringManifestLoadedData,
	SubtitleFragProcessedData,
	SubtitleTrackLoadedData,
	SubtitleTracksUpdatedData,
	SubtitleTrackSwitchData,
	TrackLoadingData,
} from 'hls.js';
import { MaxAutoLevelUpdatedData } from 'hls.js/dist/hls.js';
import {
	DetailedHTMLProps,
	FC,
	HTMLAttributes,
	RefObject,
	VideoHTMLAttributes,
	useEffect,
	useRef,
} from 'react';

export interface PlayerEvents {
	onMediaAttaching?: (data: MediaAttachingData) => void;
	onMediaAttached?: (data: MediaAttachedData) => void;
	onMediaDetaching?: () => void;
	onMediaDetached?: () => void;
	onBufferReset?: () => void;
	onBufferCodecs?: (data: BufferCodecsData) => void;
	onBufferCreated?: (data: BufferCreatedData) => void;
	onBufferAppending?: (data: BufferAppendingData) => void;
	onBufferAppended?: (data: BufferAppendedData) => void;
	onBufferEOS?: (data: BufferEOSData) => void;
	onBufferFlushing?: (data: BufferFlushingData) => void;
	onBufferFlushed?: (data: BufferFlushedData) => void;
	onManifestLoading?: (data: ManifestLoadingData) => void;
	onManifestLoaded?: (data: ManifestLoadedData) => void;
	onManifestParsed?: (data: ManifestParsedData) => void;
	onLevelSwitching?: (data: LevelSwitchingData) => void;
	onLevelSwitched?: (data: LevelSwitchedData, level: Level) => void;
	onLevelLoading?: (data: LevelLoadingData) => void;
	onLevelLoaded?: (data: LevelLoadedData) => void;
	onLevelUpdated?: (data: LevelUpdatedData) => void;
	onLevelPTSUpdated?: (data: LevelPTSUpdatedData) => void;
	onLevelsUpdated?: (data: LevelsUpdatedData) => void;
	onAudioTracksUpdated?: (data: AudioTracksUpdatedData) => void;
	onAudioTracksSwitching?: (data: AudioTrackSwitchingData) => void;
	onAudioTracksSwitched?: (data: AudioTrackSwitchedData) => void;
	onAudioTrackLoading?: (data: TrackLoadingData) => void;
	onAudioTrackLoaded?: (data: AudioTrackLoadedData) => void;
	onSubtitleTracksUpdated?: (data: SubtitleTracksUpdatedData) => void;
	onSubtitleTracksCleared?: () => void;
	onSubtitleTrackSwitch?: (data: SubtitleTrackSwitchData) => void;
	onSubtitleTrackLoading?: (data: TrackLoadingData) => void;
	onSubtitleTrackLoaded?: (data: SubtitleTrackLoadedData) => void;
	onSubtitleFragProcessed?: (data: SubtitleFragProcessedData) => void;
	onCuesParsed?: (data: CuesParsedData) => void;
	onNonNativeTextTracksFound?: (data: NonNativeTextTracksData) => void;
	onInitPtsFound?: (data: InitPTSFoundData) => void;
	onFragLoading?: (data: FragLoadingData) => void;
	onFragLoadEmergencyAborted?: (data: FragLoadEmergencyAbortedData) => void;
	onFragLoaded?: (data: FragLoadedData) => void;
	onFragDecrypted?: (data: FragDecryptedData) => void;
	onFragParsingInitSegment?: (data: FragParsingInitSegmentData) => void;
	onFragParsingUserdata?: (data: FragParsingUserdataData) => void;
	onFragParsingMetadata?: (data: FragParsingMetadataData) => void;
	onFragParsed?: (data: FragParsedData) => void;
	onFragBuffered?: (data: FragBufferedData) => void;
	onFragChanged?: (data: FragChangedData) => void;
	onFPSDrop?: (data: FPSDropData) => void;
	onFPSDropLevelCapping?: (data: FPSDropLevelCappingData) => void;
	onMaxAutoLevelUpdated?: (data: MaxAutoLevelUpdatedData) => void;
	onHLSError?: (data: ErrorData) => void;
	onDestroying?: () => void;
	onKeyLoading?: (data: KeyLoadingData) => void;
	onKeyLoaded?: (data: KeyLoadedData) => void;
	onLiveBackBufferReached?: (data: BackBufferData) => void;
	onBackBufferReached?: (data: BackBufferData) => void;
	onSteeringManifestLoaded?: (data: SteeringManifestLoadedData) => void;
}

export interface PlayerProps
	extends DetailedHTMLProps<
			VideoHTMLAttributes<HTMLVideoElement>,
			HTMLVideoElement
		>,
		PlayerEvents {
	ref?: RefObject<HTMLVideoElement | null>;
	hlsRef?: RefObject<Hls | null>;
	containerRef?: RefObject<HTMLDivElement | null>;
	container?: DetailedHTMLProps<
		HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
	config?: Partial<HlsConfig>;
	url?: string;
	level?: number;
}

export const Player: FC<PlayerProps> = ({
	ref: videoRefProp,
	hlsRef: hlsRefProp,
	containerRef,
	container,
	config,
	url = '',
	level = -1,
	onMediaAttaching,
	onMediaAttached,
	onMediaDetaching,
	onMediaDetached,
	onBufferReset,
	onBufferCodecs,
	onBufferCreated,
	onBufferAppending,
	onBufferAppended,
	onBufferEOS,
	onBufferFlushing,
	onBufferFlushed,
	onManifestLoading,
	onManifestLoaded,
	onManifestParsed,
	onLevelSwitching,
	onLevelSwitched,
	onLevelLoading,
	onLevelLoaded,
	onLevelUpdated,
	onLevelPTSUpdated,
	onLevelsUpdated,
	onAudioTracksUpdated,
	onAudioTracksSwitching,
	onAudioTracksSwitched,
	onAudioTrackLoading,
	onAudioTrackLoaded,
	onSubtitleTracksUpdated,
	onSubtitleTracksCleared,
	onSubtitleTrackSwitch,
	onSubtitleTrackLoading,
	onSubtitleTrackLoaded,
	onSubtitleFragProcessed,
	onCuesParsed,
	onNonNativeTextTracksFound,
	onInitPtsFound,
	onFragLoading,
	onFragLoadEmergencyAborted,
	onFragLoaded,
	onFragDecrypted,
	onFragParsingInitSegment,
	onFragParsingUserdata,
	onFragParsingMetadata,
	onFragParsed,
	onFragBuffered,
	onFragChanged,
	onFPSDrop,
	onFPSDropLevelCapping,
	onMaxAutoLevelUpdated,
	onHLSError,
	onDestroying,
	onKeyLoading,
	onKeyLoaded,
	onLiveBackBufferReached,
	onBackBufferReached,
	onSteeringManifestLoaded,
	...rest
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const hlsRef = useRef<Hls | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(
		() =>
			hlsInit({
				hlsRef: hlsRefProp ?? hlsRef,
				videoRef: videoRefProp ?? videoRef,
				url,
				config,
				onMediaAttaching,
				onMediaAttached,
				onMediaDetaching,
				onMediaDetached,
				onBufferReset,
				onBufferCodecs,
				onBufferCreated,
				onBufferAppending,
				onBufferAppended,
				onBufferEOS,
				onBufferFlushing,
				onBufferFlushed,
				onManifestLoading,
				onManifestLoaded,
				onManifestParsed,
				onLevelSwitching,
				onLevelSwitched,
				onLevelLoading,
				onLevelLoaded,
				onLevelUpdated,
				onLevelPTSUpdated,
				onLevelsUpdated,
				onAudioTracksUpdated,
				onAudioTracksSwitching,
				onAudioTracksSwitched,
				onAudioTrackLoading,
				onAudioTrackLoaded,
				onSubtitleTracksUpdated,
				onSubtitleTracksCleared,
				onSubtitleTrackSwitch,
				onSubtitleTrackLoading,
				onSubtitleTrackLoaded,
				onSubtitleFragProcessed,
				onCuesParsed,
				onNonNativeTextTracksFound,
				onInitPtsFound,
				onFragLoading,
				onFragLoadEmergencyAborted,
				onFragLoaded,
				onFragDecrypted,
				onFragParsingInitSegment,
				onFragParsingUserdata,
				onFragParsingMetadata,
				onFragParsed,
				onFragBuffered,
				onFragChanged,
				onFPSDrop,
				onFPSDropLevelCapping,
				onMaxAutoLevelUpdated,
				onHLSError,
				onDestroying,
				onKeyLoading,
				onKeyLoaded,
				onLiveBackBufferReached,
				onBackBufferReached,
				onSteeringManifestLoaded,
			}),
		[url]
	);

	useEffect(() => hlsChangeLevel(hlsRef, level), [level]);

	return (
		<div ref={containerRef} {...container}>
			<video
				ref={videoRefProp ?? videoRef}
				style={{
					width: '100%',
					height: '100%',
					aspectRatio: '16 / 9',
					objectFit: 'contain',
					backgroundColor: '#000',
				}}
				{...rest}
			>
				<code>video</code> is not supported.
			</video>
		</div>
	);
};
