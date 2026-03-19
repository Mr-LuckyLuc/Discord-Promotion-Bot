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
