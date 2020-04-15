# Stockcheck

Monitors Amazon and sends a message to your slack channel when watched products (like TP) become available. It will send message at most once per day per product.

**Note**

Requires a Slack App and channel id to post message.

## Installation

1. Clone this repo.
2. `npm install` or `yarn install`
3. Modify items.json with the name and url of products you want to watch.
4. Create a .env file with the following Slack channel  attributes

```
token=slack OAuth token
channelD=Name of the channel
```

5. Run it

```
   node index.js
```
