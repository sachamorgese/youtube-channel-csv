const rp = require('request-promise');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.API_KEY;

const arguments = process.argv.slice(2);

// If there are no arguments, exit
if (!arguments.length) {
  console.log('Please provide a filename and a list of youtube channel urls');
  console.log('Example: node index.js --filename=example.csv <url1> <url2> <urlN>');
  return;
}

const fileName = arguments[filenameIndex + 1];

// remove filename and get remaining arguments
const urls = arguments.slice(filenameIndex + 2);


const testRE = /"browseId":"UC[-_0-9A-Za-z]{21}[AQgw]"/

async function getChannelIds(arguments) {
  return arguments.reduce(async (result, url) => {
    console.log('Fetching channel id for url: ', url);
    try {
      const html = await rp(url)
      const oldRes = await result;
      return [...oldRes, html.match(testRE)[0].split('"')[3]];
    } catch (e) {
      console.log(`There was a problem with this url: ${url}\n ${e}`)
    }
  }, [])
}

async function getAllVideos(channelId) {
  let nextPageToken = '';
  const allVideos = [];

  console.log('Fetching videos for channel: ', channelId);

  try {
    do {
      if (allVideos.length > 0) {
        console.log(`Fetched ${allVideos.length} videos so far...`);
      }
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50&pageToken=${nextPageToken}`);
      const json = await res.json();
      const lines = json.items.map(item => [item.snippet.publishTime, item.snippet.channelTitle, item.snippet.title, item.id.videoId]);
      allVideos.push(...lines);
      nextPageToken = json.nextPageToken;
    } while (nextPageToken);
  } catch (e) {
    console.log('There was an error fetching videos for channel id: ', channelId, '\n', e)
  }
  console.log(`Fetched ${allVideos.length} videos for channel: ${channelId}`);
  return allVideos;
}

async function main (arguments) {
  const uriArray = await getChannelIds(arguments);

  const allVideos = await uriArray.reduce(async (result, channelId) => {
    const oldRes = await result;
    const videos = await getAllVideos(channelId);
    return [...oldRes, ...videos];
  }, [])

  // cleanup duplicate videos as array
  console.debug('Cleaning up duplicate videos...');
  const { videos } = allVideos.reduce(({ids, videos}, video) => {
    const videoId = video[3];
    if (videoId && !ids[videoId]) {
      ids[videoId] = true;
      videos.push(video);
    }
    return { ids, videos };
  }, { ids: {}, videos: [] });

  // sort videos by date
  console.debug('Sorting videos by date...');
  videos.sort((a, b) => {
    return new Date(b[0]) - new Date(a[0]);
  });

  // write to file
  console.debug('Writing to file...');
  fs.writeFileSync(`${fileName}.csv`, 'Date,Channel,Title,VideoId\n');
  videos.forEach((video) => {
    //write each element as row in csv file
    fs.appendFileSync(`${fileName}.csv`,`${video.map((str) => `"${str}"`).join(',')}\n`, function (err) {
      if (err) {
        return console.log(err);
      }
    });
  })

  console.log(`The file ${fileName} was saved!`);
}

main(urls);