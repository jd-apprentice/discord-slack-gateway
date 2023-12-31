/* Discord-Slack-Gateway -- A simple gateway to connect Discord and Slack
 *
 * -----------------------------------------------------------------------
 *
 * Author: Jonathan Dyallo
 * MIT License
 *
 * Copyright (c) 2023 Jonathan <contacto at jonathan dot com dot ar>
 * 
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const WebSocket = require('ws');
const { WebhookClient } = require('discord.js');
const { IncomingWebhook } = require('@slack/webhook');
const { App } = require('@slack/bolt');
const { Logger, IsBot, HasUrl } = require('./utils.js');

/**
 * @author Jonathan Dyallo
 * @example
 * const { DiscordSlackGateway } = require('discord-slack-gateway');
 * const gateway = new DiscordSlackGateway({
 *     slack: {
 *         token: slackBotToken,
 *         appToken: slackAppToken,
 *         signingToken: slackSigningToken,
 *         channelId: slackChannelId,
 *         webhookUrl: slackWebhookUrl,
 *         socketMode: true
 *     },
 *     discord: {
 *         webhookUrl: discWebhookUrl,
 *         channelId: discChannelId,
 *         apiToken: discApiToken
 *     }
 * });
 * @param {Object} slack - Slack options
 * @param {string} signingToken - Slack signing token read https://api.slack.com/authentication/verifying-requests-from-slack
 * @param {string} token - Slack bot token read https://api.slack.com/authentication/token-types#granular_bot
 * @param {string} appToken - Slack app token read https://api.slack.com/authentication/token-types#granular_bot
 * @param {string} channelId - Slack channel id to listen to
 * @param {string} webhookUrl - Slack webhook url read https://api.slack.com/messaging/webhooks
 * @param {boolean} socketMode - Slack socket mode read https://api.slack.com/apis/connections/socket
 * @param {Object} discord - Discord options
 * @param {string} webhookUrl - Discord webhook url generated from post method in https://discohook.org/
 * @param {string} channelId - Discord channel id to listen to
 * @param {string} apiToken - Discord api token generated from https://discord.com/developers/applications
 */

class DiscordSlackGateway {
    constructor(options = {}) {
        this._options = options;
        this._discordSocket = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');
        this._discordWebhook = new WebhookClient({ url: this._options.discord.webhookUrl });
        this._slackWebhook = new IncomingWebhook(this._options.slack.webhookUrl);
        this._slackSocket = new App({
            token: this._options.slack.token,
            signingSecret: this._options.slack.signingToken,
            appToken: this._options.slack.appToken,
            socketMode: this._options.slack.socketMode || true,
        });
    }

    connect() {
        this._connectToDiscord();
        this._connectToSlack();
    }

    _connectToDiscord() {
        this._discordSocket.on('open', () => {
            Logger('Connected to Discord');
            this._sendIdentifyPayload(this._discordSocket);
        });

        this._discordSocket.on('message', (data) => {
            if (IsBot(JSON.parse(data))) return;

            const payload = JSON.parse(data);
            const channelId = payload.d.channel_id;
            const isSameChannel = payload.t === 'MESSAGE_CREATE' && channelId === this._options.discord.channelId;

            const url = HasUrl(payload);

            if (isSameChannel) {

                const { d } = payload;
                const { global_name } = d.author;
                const { content } = d;

                this._sendSlackMessage(`*${global_name}*: ${content} ${url ?? ""}`);
            }
        });

        this._discordSocket.on('error', (error) => {
            console.error('Error in the socket connection: ', error);
        });
    }

    _connectToSlack() {
        this._slackSocket.start().then(() => {
            Logger('Connected to Slack');
        })

        this._slackSocket.event('message', async ({ event }) => {
            if (IsBot(event)) return;

            const { channel } = event;
            const isSameChannel = channel === this._options.slack.channelId;

            if (isSameChannel) {

                const { user, text } = event;
                const info = await this._slackSocket.client.users.info({ user });

                const { display_name } = info?.user?.profile;

                this._sendDiscordMessage(`**${display_name}**: ${text}`);
            }
        })

        this._slackSocket.event('error', (error) => {
            console.error('Error in the socket connection: ', error);
        });
    }

    async _sendSlackMessage(message) {
        try {
            await this._slackWebhook.send({
                text: message,
                channel: this._options.slack.channelId
            });
        } catch (error) {
            console.error('Error to send message to slack: ', error);
        }
    }

    async _sendDiscordMessage(message) {
        try {
            await this._discordWebhook.send(message);
        } catch (error) {
            console.error('Error to send message to discord: ', error);
        }
    }

    _sendIdentifyPayload(socket) {
        const payload = {
            op: 2,
            d: {
                token: this._options.discord.apiToken,
                intents: 513,
                properties: {
                    $os: process.platform,
                    $browser: 'disc-slack-gateway',
                    $device: 'disc-slack-gateway'
                }
            }
        };

        socket.send(JSON.stringify(payload));
    }
}

module.exports = {
    DiscordSlackGateway
}