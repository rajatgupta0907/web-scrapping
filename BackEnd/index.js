const express = require('express');
const cors = require('cors');
const { parseStringPromise } = require('xml2js');
const mysql = require('mysql');

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'rssurl'
});

dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully');
});



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
    try{
    function isValidUrl(url) {
      const urlRegex = /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
      return urlRegex.test(url);
    }
    if(!isValidUrl(url)) continue;

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
  }catch(err){
    continue;
  }

  }
  return allFeedItems;
}




app.post('/get_rss_feed', async (req, res) => {
  const RssFeedUrls = req.body.urls; 


  // Assuming an array of feed URLs is sent in the request body
  const RssFeedItems = await getFeed(RssFeedUrls);
  console.log(RssFeedItems);
  res.json({
    feedItems: RssFeedItems,
  });
});

app.get('/fetchDataFromMySQL', async (req, res) => {
  const query = "SELECT * FROM updated_with_rss";

  dbConnection.query(query,  (err, results) => {
    if (err) {
      console.error('Error fetching data from MySQL:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

     const rssUrls = results.map(item => item['RSS URL']);
 
     const fetchAndReturnFeedItems = async () => {


      const RssFeedItems = await getFeed(rssUrls);
      console.log(RssFeedItems);
      res.json({
        feedItems: RssFeedItems,
      });
    
  
    
    };
    fetchAndReturnFeedItems();
  
    
  });

});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
