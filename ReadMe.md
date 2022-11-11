# Youtube Channel to CSV

This is a simple script to fetch the list of all videos from a youtube channel and save them to a CSV file.

## Requirements
* API_KEY from google - https://developers.google.com/youtube/v3/getting-started
* Node 18 (or above) - Though it should work with older versions as well

## Usage
* Clone the repo
* Run `npm install`
* Create a `.env` file in the root directory and add the following line
```
API_KEY=<YOUR_API_KEY>
```
* Run `node index.js <OUTPUT_FILE_NAME> <CHANNEL_ID_1 or CHANNEL_URL> <CHANNEL_ID_2 or CHANNEL_URL> ...`
* The output file will be saved as OUTPUT_FILE_NAME.csv in the root directory

## Example
```
node index.js output https://www.youtube.com/channel/channel-one UC2PeMPA8PAOp-bynLoCeMLA
```
