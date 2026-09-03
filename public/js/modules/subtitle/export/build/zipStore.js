const CRC32_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
	let crc = i;
	for (let bit = 0; bit < 8; bit += 1) {
		crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
	}
	CRC32_TABLE[i] = crc >>> 0;
}

const crc32 = (bytes) => {
	let crc = 0xFFFFFFFF;
	for (let i = 0; i < bytes.length; i += 1) {
		crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
	}
	return (crc ^ 0xFFFFFFFF) >>> 0;
};

const concatBytes = (chunks) => {
	const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
};

const u16 = (value) => {
	const bytes = new Uint8Array(2);
	bytes[0] = value & 0xFF;
	bytes[1] = (value >>> 8) & 0xFF;
	return bytes;
};

const u32 = (value) => {
	const bytes = new Uint8Array(4);
	bytes[0] = value & 0xFF;
	bytes[1] = (value >>> 8) & 0xFF;
	bytes[2] = (value >>> 16) & 0xFF;
	bytes[3] = (value >>> 24) & 0xFF;
	return bytes;
};

const encoder = new TextEncoder();

/**
 * 압축 없이(STORE) ZIP 아카이브를 만든다. xlsx(OPC)용.
 *
 * @param {{ name: string, content: string|Uint8Array }[]} files
 * @returns {Uint8Array}
 */
const zipStore = (files) => {
	const localParts = [];
	const centralParts = [];
	let offset = 0;

	for (const file of files) {
		const nameBytes = encoder.encode(file.name);
		const data = file.content instanceof Uint8Array
			? file.content
			: encoder.encode(file.content);
		const checksum = crc32(data);
		const size = data.length;

		const localHeader = concatBytes([
			u32(0x04034b50),
			u16(20),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(checksum),
			u32(size),
			u32(size),
			u16(nameBytes.length),
			u16(0),
			nameBytes,
		]);

		localParts.push(localHeader, data);
		centralParts.push(concatBytes([
			u32(0x02014b50),
			u16(20),
			u16(20),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(checksum),
			u32(size),
			u32(size),
			u16(nameBytes.length),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(0),
			u32(offset),
			nameBytes,
		]));

		offset += localHeader.length + size;
	}

	const centralDirectory = concatBytes(centralParts);
	const endOfCentral = concatBytes([
		u32(0x06054b50),
		u16(0),
		u16(0),
		u16(files.length),
		u16(files.length),
		u32(centralDirectory.length),
		u32(offset),
		u16(0),
	]);

	return concatBytes([...localParts, centralDirectory, endOfCentral]);
};

export { zipStore };
