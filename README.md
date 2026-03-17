<h1 align="center">Viking Solutions &mdash; Management Systems</h1>

<p align="center">
  <strong>Custon system for user management in a military faction environment.</strong><br/>
</p>

<p align="center">
  <a href="#stack"><img alt="Node" src="https://img.shields.io/badge/Node-18+-green?style=flat-square"></a>
  <a href="#stack"><img alt="Discord.js" src="https://img.shields.io/badge/discord.js-14-blue?style=flat-square"></a>
  <a href="#license"><img alt="License" src="https://img.shields.io/badge/License-MIT-orange?style=flat-square"></a>
</p>

---

# Commands

| Command      | Description                                                               |
| ------------ | ------------------------------------------------------------------------- |
| `/promote`   | Promotes a member to the next rank and updates their nickname.            |
| `/enlist`    | Enlists a new member by assigning starting rank, career, unit, and roles. |
| `/discharge` | Removes a member from service and clears their roles.                     |
| `/career`    | Assigns or updates a member's career role.                                |
| `/unit`      | Assigns or updates a member's unit role.                                  |
| `/award`     | Grants a service award to a member *(currently disabled)*.                |
| `/stats`     | Displays personnel statistics filtered by unit or career.                 |
| `/show`      | Displays current settings for specified command.                          |
| `/update`    | Updates current settings for specified command.                           |

---

# Configuration

## Bot Configuration

Add your Discord bot credentials to a .env file (see in .env.example).

Example:

```
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
```

## Command Configuration

All of ranks, units and careers follow the same structure, these all use role names instead of ID's for ease of reading. These will have to be put in corresponding `ranks.json`, `units.json` and `careers.json`. These can also be updated using the `/update` command.:

```json
{
    "server_id": {
        "name of rank, unit or career": {
            "tag": "tag",
            "role": "role name",
            "extra roles": ["role name", ...]
        }
    }
}
```

If you want to use the statistics you will also need the `stats.json` with the following structure:

```json
{
    "server_id": {
        "title": "title of stats message (big standard text)"
        "sections" [
            {
                "title": "title of embed",
                "image": "link to image (if desired)",
                "subsections": [
                    {
                        "name": "name of embed paragraph",
                        "content": "paragraph if desired",
                        "filter": {
                            "rank": ["rank role", ...],
                            "unit": ["unit role", ...],
                            "career": ["career role", ...]
                        },
                        "inline": true
                    }
                ]
            },
        ]
    }
}
```

And lastly the `settings.json` for default settings for the bot. `civilian role` for non-employees, `employee role` for employees, `autoroles` for roles to automatically add and `nickname prefixes` for the tags to prepend to names, and their order. this can also be updated using the `/update` command.:

```json
{
    "server_id":{
        "civilian role": "role name",
        "employee role": "role name",
        "autoroles": ["role name", ...],
        "nickname prefixes": ["role name", ...]
    }
}
```

## Misc
You'll also need a `enlisted.json` file to save member data but this will be automatically filled by the bot.

---

# Project Structure

```
Discord-Promotion-Bot
│
├── commands/           # Slash commands
├── files/              # JSON configuration files
├── utils/              # helper functions
├── docker/             # docker ready files
├── index.js            # Bot entry point
├── package-lock.json
├── package.json
└── README.md
```

---

# License

This project is licensed under the **MIT License**.

---

# Author

**LuckyLuc**

GitHub:
https://github.com/Mr-LuckyLuc

# Discord Promotion Bot

![Node.js](https://img.shields.io/badge/node-18.19-green)
![discord.js](https://img.shields.io/badge/discord.js-14.24-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A **Discord personnel management bot** designed for structured communities such as **milsim or roleplay groups**.
It automates promotions, nickname formatting, and administrative role management to reduce manual moderation work.

The bot was originally created for a milsim-style Discord server and later expanded with additional functionality after being deployed in other communities.

---

# Features

| Feature                     | Description                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Rank Management**         | Promote personnel without manually updating roles or nicknames. The bot automatically adjusts rank roles and nicknames. |
| **Nickname Management**     | Keeps member nicknames formatted with their rank and name. Updates automatically when rank, unit, or career changes.    |
| **Enlistment System**       | Quickly enlist new members by assigning starting roles, rank, unit, career, and nickname formatting.                    |
| **Discharge System**        | Removes members from active service by clearing their rank, unit, career, and administrative roles.                     |
| **Career Assignment**       | Assign careers to members with a single command while ensuring consistent role management.                              |
| **Unit Assignment**         | Manage unit roles and assignments easily through bot commands.                                                          |
| **Awards**                  | Includes a command for awarding service medals *(currently disabled in production use)*.                                |
| **Personnel Statistics**    | View server members filtered by career or unit to quickly review server structure.                                      |
| **Automatic Join Handling** | Automatically assigns starting roles and updates nicknames when a member joins the server.                              |

---

# Technology Stack

* **Node.js 18.19**
* **JavaScript**
* **discord.js 14.24**

The bot interacts with the Discord API using the Discord.js framework.

---

# Data Storage

The bot uses **JSON files** for configuration and data storage.
These files are loaded during startup and contain information such as:

* Ranks
* Units
* Careers
* Server configuration

This approach keeps the setup simple and avoids requiring an external database.

---

# Installation

## Clone the repository

```bash
git clone https://github.com/Mr-LuckyLuc/Discord-Promotion-Bot.git
cd Discord-Promotion-Bot
```

## Install dependencies

```bash
npm install
```

---

# Configuration

Add your Discord bot credentials and configuration values to your configuration file or environment variables.

Example:

```
TOKEN=your_discord_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id
```

---

# Running the Bot

Start the bot using Node.js:

```bash
node index.js
```

---

# Docker

This repository includes a **Dockerfile** for running the bot inside a container.

Build the image:

```bash
docker build -t discord-promotion-bot .
```

Run the container:

```bash
docker run -d discord-promotion-bot
```

Make sure your environment variables are provided when running the container.

---

# Project Structure

```
Discord-Promotion-Bot
│
├── commands/        # Slash commands
├── events/          # Discord event handlers
├── data/            # JSON configuration files
├── index.js         # Bot entry point
├── Dockerfile
├── package.json
└── README.md
```

---

# Use Cases

This bot is useful for servers that require **structured member organization**, including:

* Milsim communities
* Roleplay servers
* Organized gaming groups
* Discord servers with hierarchical ranks

---

# Contributing

Contributions and improvements are welcome.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

# License

This project is licensed under the **MIT License**.

---

