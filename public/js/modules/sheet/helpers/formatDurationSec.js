/**
 * @param {{ start: number, end: number }} range
 * @returns {string}
 */
const formatDurationSec = ({ start, end }) => ((end - start) / 1000).toFixed(3);

export { formatDurationSec };
