/// IMPORTS
// flat - library for manipulating csv, txt, json, excel, zip, and image files
import { writeJSON, writeImage } from "https://deno.land/x/flat@0.0.15/mod.ts"
// jmespath - query json data 
import { search } from "https://deno.land/x/jmespath@v0.2.2/index.ts"
// brotli - compress or decompres data using brotli.
import { compress } from "https://deno.land/x/brotli@v0.1.4/mod.ts"

/// FETCH DATA
const inputFileName = "titledb-source.json"
const url = "https://raw.githubusercontent.com/blawar/titledb/master/GB.en.json"
console.log("Fetching data from '${url}'...")
    const fetchedJsonResponse = await fetch(url)
    const fetchedJsonData = await fetchedJsonResponse.json()

/// WRITE FETCHED DATA TO FILE
console.log("Writing fetched data to '${inputFileName}' file...")
    await writeJSON(inputFileName, fetchedJsonData)

/// SCRAP FETCHED DATA
const jmesQuery = "*.{i:id, n:name, u:iconUrl} | {data:@}"
console.log("Scrapping '${inputFileName}' file...")
    const outputJson = search(fetchedJsonData, jmesQuery)

/// COMPRESS SCRAPPED DATA
console.log("Compressing data with brotli compression...")
    const outputJsonString = JSON.stringify(outputJson)
    const outputJsonBytes = new TextEncoder().encode(outputJsonString)
    const outputJsonCompressed = compress(outputJsonBytes)

/// WRITE SCRAPPED FETCHED DATA TO FILE
const outputFileName = "titledb.bin";
console.log("Compressing data with brotli compression...")
    await writeImage(outputJsonCompressed, outputFileName)