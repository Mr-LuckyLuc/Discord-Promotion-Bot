console.log("Starting");

const util = require('util') // or: import util from 'util'

// Set the default depth to null to remove the recursion limit.
// All  subsequent console.log() and console.dir() calls will use this default.
util.inspect.defaultOptions.depth = null

require("dotenv").config({ path: __dirname+'/.env' }); //to start process from .env file

const path = require('node:path');
const fs = require('node:fs');

const { Client, Collection, Events, GatewayIntentBits, REST, Routes} = require('discord.js');

// setup ----------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers], autoReconnect: true });

// Construct and prepare an instance of the REST module
let ranks = {};

fs.readFile("./ranks.txt", "utf8", (err,data) => {
    if(err){
        console.error(err);
    }else{
        ranks = JSON.parse(data);
        client.ranks = ranks;
    }
});

let units = {};

fs.readFile("./units.txt", "utf8", (err,data) => {
    if(err){
        console.error(err);
    }else{
        units = JSON.parse(data);
        client.units = units;
    }
});

let careers = {};

fs.readFile("./careers.txt", "utf8", (err,data) => {
    if(err){
        console.error(err);
    }else{
        careers = JSON.parse(data);
        client.careers = careers;
    }
});

// let awards = [];

// fs.readFile("./awards.txt", "utf8", (err,data) => {
//     if(err){
//         console.error(err);
//     }else{
//         awards = data.split(",");
//         client.awards = awards;
//     }
// });

let enlisted = {};

fs.readFile("./enlisted.txt", "utf-8", (err, data) => {
    if (err) {
        console.error(err)
    } else {
        enlisted = JSON.parse(data);
        client.enlisted = enlisted;
    }
})

const commandsPath = path.join(__dirname, "");
const commandsFiles = fs.readdirSync(commandsPath).filter(file => {if (!(file === "promotionBot.js")) return file.endsWith('.js')});

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
    
    let enlistee = {};

    if (!(member.id in enlisted)) {
        const name = member.user.globalName
        enlistee.nickname = (name.length>20 ? name.slice(0,20) : name);
        enlistee.rank = "Private";
        enlistee.unit = "4th Infantry Platoon";
        enlistee.career = "Rifleman";
        enlisted[member.id] =  enlistee;

        fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('person added');
            }
        });

        client.enlisted = enlisted
    }
    
    member.setNickname(ranks[enlistee.rank].name + ' ' + enlistee.nickname);
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