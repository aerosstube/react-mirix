export const formatTime = (time: number | undefined) => {
	if (time === undefined || isNaN(time)) return '--:--';

	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${`${minutes}`.padStart(2, '0')}:${`${seconds}`.padStart(2, '0')}`;
};
