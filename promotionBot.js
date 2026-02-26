console.log("Starting");

require("dotenv").config({ path: __dirname+'/.env' }); //to start process from .env file

const path = require('node:path');
const fs = require('node:fs');

const { Client, Collection, Events, GatewayIntentBits, REST, Routes} = require('discord.js');
const { updateMessage } = require("./message");
const { updateClient, updateEnlisted, reloadFiles } = require("./functions");

// setup ----------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers], autoReconnect: true });

client.files = {};
client.files.ranks = "./files/ranks.json";
client.files.units = "./files/units.json";
client.files.careers = "./files/careers.json";
// client.files.awards = "./files/awards.json";
client.files.enlisted = "./files/enlisted.json";

updateClient(client)
reloadFiles()

const commandsPath = path.join(__dirname, "commands");
const commandsFiles = fs.readdirSync(commandsPath);

const commands = new Collection();

for (const file of commandsFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Start Bot ----------------------------

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
    const jsonCommands = commands.map(command => command.data.toJSON())

    const data = await rest.put(
    // Routes.applicationCommands(process.env.CLIENTID), //for all guilds
    Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID),
        { body: jsonCommands },);
    console.log(`Successfully reloaded ${data.length} commands.`);
})();

client.on('guildMemberAdd', member => {
    
    if (member.user.bot) return;

    const ranks = client.ranks[guild.id]
    const units = client.units[guild.id]
    const careers = client.careers[guild.id]
    
    let enlistee = {};

    if (!(member.id in enlisted)) {
        const name = member.user.globalName || member.user.username || "Soldier";
        enlistee.nickname = (name.length>20 ? name.slice(0,20) : name);
        enlistee.rank = Object.keys(ranks)[0];
        enlistee.unit = Object.keys(units)[0];
        enlistee.career = Object.keys(careers)[0];
        enlistee.active = false;
        
        client.enlisted[member.guild.id][member.id] = enlistee;

        updateEnlisted()
    }
});

client.on('guildMemberRemove', member => {
    
    if (member.user.bot) return;

    enlisted[member.guild.id][member.id].active = false;

    updateEnlisted('person left');

    updateMessage(client);

});

client.on(Events.InteractionCreate, (interaction) => {
    
    if (interaction.isChatInputCommand()) {

        const command = commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        
        command.execute(interaction);
    }
})

client.login(process.env.TOKEN);

client.on('ready', async() => {
    for (const guildArr of client.guilds.cache) {
        const guild = guildArr[1]
        let ranks = client.ranks[guild.id]
        let units = client.units[guild.id]
        let careers = client.careers[guild.id]
        let enlisted = client.enlisted[guild.id]

        if (!enlisted) enlisted = {};
        if (!ranks) ranks = {};
        if (!units) units = {};
        if (!careers) careers = {};

        if (Object.keys(enlisted).length === 0) {
            const members = await guild.members.fetch();

            const rankList = Object.fromEntries(Object.entries(ranks).map(([i, rank])=> {
                return [rank["rank role"], i];
            }));
            const unitList = Object.fromEntries(Object.entries(units).map(([i, unit])=> {
                return [unit["extra role"]?unit["extra role"]:unit["unit role"], i];
            }));
            const careerList = Object.fromEntries(Object.entries(careers).map(([i, career])=> {
                return [career["role"], i];
            }));

            members.forEach(member => {
                if (!member.user.bot) {
                    let enlistee = {};

                    enlistee.rank = Object.keys(ranks)[0];
                    enlistee.unit = Object.keys(units)[0];
                    enlistee.career = Object.keys(careers)[0];
                    enlistee.active = false;

                    if (member.id === guild.ownerId) enlistee.rank = Object.keys(ranks)[Object.keys(ranks).length - 1];

                    enlisted[member.id] = enlistee;

                    enlisted[member.user.id].nickname = member.nickname?member.nickname.slice(9).trim():member.user.globalName.slice(0,25).trim();

                    const roles = member.roles.cache;
                    
                    roles.forEach(role => {

                        if (role.name in rankList) {
                            Object.entries(rankList).forEach( ([i, rank]) => {
                                if (i === role.name) {
                                    enlisted[member.user.id].rank = rank;
                                }
                            })
                        }
                        if (role.name in unitList) {
                            Object.entries(unitList).forEach( ([i, unit]) => {
                                if (i === role.name) {
                                    enlisted[member.user.id].unit = unit;
                                }
                            })
                        }
                        if (role.name in careerList) {
                            Object.entries(careerList).forEach( ([i, career]) => {
                                if (i === role.name) {
                                    enlisted[member.user.id].career = career;
                                }
                            })
                        }
                        if ("K3" === role.name) {
                            enlisted[member.user.id].active = true;
                        }
                    });
                }
            }); 

            client.enlisted[guild.id] = enlisted;

            updateEnlisted('loaded');
        }
    }
});
