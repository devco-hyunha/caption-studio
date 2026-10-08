const CRC32_TABLE = new Uint32Array(256);

for (let i = 0; i < 256; i += 1) {
	let crc = i;
	for (let bit = 0; bit < 8; bit += 1) {
		crc = crc & 1 ? (0xed_b8_83_20 ^ (crc >>> 1)) : crc >>> 1;
	}
	CRC32_TABLE[i] = crc >>> 0;
}

const crc32 = (bytes: Uint8Array): number => {
	let crc = 0xff_ff_ff_ff;
	for (let i = 0; i < bytes.length; i += 1) {
		crc = CRC32_TABLE[(crc ^ bytes[i]!) & 0xff]! ^ (crc >>> 8);
	}
	return (crc ^ 0xff_ff_ff_ff) >>> 0;
};

const concatBytes = (chunks: readonly Uint8Array[]): Uint8Array => {
	const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.length;
	}
	return out;
};

const u16 = (value: number): Uint8Array => {
	const bytes = new Uint8Array(2);
	bytes[0] = value & 0xff;
	bytes[1] = (value >>> 8) & 0xff;
	return bytes;
};

const u32 = (value: number): Uint8Array => {
	const bytes = new Uint8Array(4);
	bytes[0] = value & 0xff;
	bytes[1] = (value >>> 8) & 0xff;
	bytes[2] = (value >>> 16) & 0xff;
	bytes[3] = (value >>> 24) & 0xff;
	return bytes;
};

const encoder = new TextEncoder();

interface ZipEntry {
	name: string;
	content: string | Uint8Array;
}

/** 압축 없이(STORE) ZIP — xlsx(OPC)용 */
const zipStore = (files: readonly ZipEntry[]): Uint8Array => {
	const localParts: Uint8Array[] = [];
	const centralParts: Uint8Array[] = [];
	let offset = 0;

	for (const file of files) {
		const nameBytes = encoder.encode(file.name);
		const data =
			file.content instanceof Uint8Array
				? file.content
				: encoder.encode(file.content);
		const checksum = crc32(data);
		const size = data.length;

		const localHeader = concatBytes([
			u32(0x04_03_4b_50),
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
		centralParts.push(
			concatBytes([
				u32(0x02_01_4b_50),
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
			]),
		);

		offset += localHeader.length + size;
	}

	const centralDirectory = concatBytes(centralParts);
	const endOfCentral = concatBytes([
		u32(0x06_05_4b_50),
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
export type { ZipEntry };
