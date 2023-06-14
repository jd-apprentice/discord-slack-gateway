# discord-slack-gateway

![IMAGE](https://venngage-wordpress.s3.amazonaws.com/uploads/2021/07/Slack-Discord-integration.png)

Image from [HERE](https://venngage.com/blog/discord-integrations/)

## What is this?

![image](https://github.com/jd-apprentice/discord-slack-gateway/assets/68082746/a65751ae-885f-4d9e-9d4c-d911f4f815e3)

This is a gateway between Discord and Slack. It allows you to send messages from Discord to Slack and vice versa.

## How to use it?

### Installation

```
npm i discord-slack-gateway
```

### Example

```js
const { DiscordSlackGateway } = require('discord-slack-gateway');
const gateway = new DiscordSlackGateway({
    slack: {
        token: "...",
        appToken: "...",
        signingToken: "...",
        channelId: "...",
        webhookUrl: "...",
        socketMode: true
    },
    discord: {
        webhookUrl: "...",
        channelId: "...",
        apiToken: "..."
    }
});
```

_I highly recommend using socket mode for Slack. It is much faster than the Events API. Also, use environment variables for tokens and other sensitive data_

## What are the options?

### Slack

**signingToken** - Slack signing token. Read https://api.slack.com/authentication/verifying-requests-from-slack

**token** - Slack bot token. Read https://api.slack.com/authentication/token-types

**appToken** - Slack app token. Read https://api.slack.com/authentication/token-types

**channelId** - Slack channel id to listen to

**webhookUrl** - Slack webhook url. Read https://api.slack.com/messaging/webhooks

**socketMode** - Socket mode is a new way for apps to be installed to workspaces. Read https://api.slack.com/apis/connections/socket

### Discord

**webhookUrl** - Discord webhook url generated from post method in https://discohook.org/

**channelId** - Discord channel id to listen to

**apiToken** - Discord api token generated from https://discord.com/developers/applications

### LICENSE

[MIT](./LICENSE)
