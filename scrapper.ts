/// IMPORTS
// flat - library for manipulating csv, txt, json, excel, zip, and image files
import { writeJSON, writeImage } from "https://deno.land/x/flat@0.0.15/mod.ts";
// jmespath - query json data 
import { search } from "https://deno.land/x/jmespath@v0.2.2/index.ts";
// brotli - compress or decompress data using brotli
import { compress } from "https://deno.land/x/brotli@0.1.7/mod.ts";

/// FUNCTIONS
async function calculateChecksum(dataText: string): Promise<string> {
	const encoded: Uint8Array = new TextEncoder().encode(dataText);
	const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", encoded);
	return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function brotliCompress(data: string): Uint8Array {
	const bytes: Uint8Array = new TextEncoder().encode(data);
	return compress(bytes);
}

/// MAIN
// Create the data directory
const dataRoot: string = "./data"
await Deno.mkdir(dataRoot, { recursive: true });
// Fetch data from the source url
const sourceUrl: string = "https://raw.githubusercontent.com/blawar/titledb/master/GB.en.json";
console.log(`Fetching data from "${sourceUrl}"...`);
const fetchedJsonResponse: Response = await fetch(sourceUrl);
const fetchedJsonData: string = await fetchedJsonResponse.json();
// Check if the existing file content is the same as fetched data
let shouldProcess = true;
console.log(`Checking if existing file matches checksum...`);
const jsonFileName: string = "titledb-source.json";
const jsonFilePath: string = `${dataRoot}/${jsonFileName}`;
const fetchedJsonString: string = JSON.stringify(fetchedJsonData);
const fetchedChecksum: string = await calculateChecksum(fetchedJsonString);
try {
	const existingJson: string = await Deno.readTextFile(jsonFilePath);
	const existingChecksum: string = await calculateChecksum(existingJson);
	if (existingChecksum === fetchedChecksum) {
		console.log("Checksum matched. Skipping transformation and compression.");
		shouldProcess = false;
	} else {
		console.log("Checksum mismatch. Proceeding with data processing.");
	}
} catch {
	console.log("Local file not found. Proceeding with data processing.");
}
// Process fetched data if necessary
if (shouldProcess) {
	// Write fetched data
	console.log(`Writing fetched data to "${jsonFilePath}" file...`);
	await writeJSON(jsonFilePath, fetchedJsonData);
	// Scrap
	const jmesQuery: string = "*.{i:id, n:name, u:iconUrl} | {data:@}";
	console.log(`Scraping "${jsonFilePath}" file...`);
	const outputJson: unknown = search(fetchedJsonData, jmesQuery);
	const outputJsonString: string = JSON.stringify(outputJson);
	// Compress
	console.log("Compressing data with Brotli compression...");
	const outputJsonCompressed = brotliCompress(outputJsonString);
	// Write scraped fetched data
	const binaryFileName: string = "titledb.bin";
	const binaryFilePath: string = `${dataRoot}/${binaryFileName}`;
	console.log(`Writing scraped fetched data to "${binaryFilePath}" file...`);
	await writeImage(outputJsonCompressed, binaryFilePath);
}
// Finalize
console.log("All operations have been performed.");