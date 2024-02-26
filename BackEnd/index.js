const express = require('express');
const cors = require('cors');
const { parseStringPromise } = require('xml2js');

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());


async function fetchRSSFeed(url) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const text = await response.text();
    const result = await parseStringPromise(text, { explicitArray: false, ignoreAttrs: true });
    return result.rss.channel;
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return null;
  }
}

async function getFeed(urls) {
  let allFeedItems = [];
  for (const url of urls) {
    console.log(`Fetching RSS feed from: ${url}`);
    const channel = await fetchRSSFeed(url);
    if (channel && channel.item) {
      const items = Array.isArray(channel.item) ? channel.item : [channel.item];
      const feedItems = items.map((item, index) => {
        const { description, 'content:encoded': contentEncoded, ...rest } = item;
        return {
          index: index + 1,
          ...rest,
          description
        };
      });
      allFeedItems.push(...feedItems);
    }
  }
  return allFeedItems;
}

app.post('/get_rss_feed', async (req, res) => {
  const RssFeedUrls = req.body.urls; // Assuming an array of feed URLs is sent in the request body
  const RssFeedItems = await getFeed(RssFeedUrls);
  console.log(RssFeedItems);
  res.json({
    feedItems: RssFeedItems,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
