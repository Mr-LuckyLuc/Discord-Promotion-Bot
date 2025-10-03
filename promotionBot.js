console.log("Starting");

require("dotenv").config({ path: __dirname+'/.env' }); //to start process from .env file

const path = require('node:path');
const fs = require('node:fs');

const { Client, Collection, Events, GatewayIntentBits, REST, Routes} = require('discord.js');

// setup ----------------------------------------------

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Construct and prepare an instance of the REST module
let ranks = {};

fs.readFile("./promotionBot/ranks.txt", "utf8", (err,data) => {
    if(err){
        console.error(err);
    }else{
        ranks = JSON.parse(data);
        client.ranks = ranks;
    }
});

let awards = [];

fs.readFile("./promotionBot/awards.txt", "utf8", (err,data) => {
    if(err){
        console.error(err);
    }else{
        awards = data.split(",");
        client.awards = awards;
    }
});

let enlisted = {};

fs.readFile("./promotionBot/enlisted.txt", "utf-8", (err, data) => {
    if (err) {
        console.error(err)
    } else {
        enlisted = JSON.parse(data);
        client.enlisted = enlisted;
    }
})

const commandsPath = path.join(__dirname, "promotionBot");
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

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

    if (member.id in enlisted) {
        enlistee = enlisted[member.id];
    } else {
        const group = member.guild.roles.cache.find(role => role.name === '-=Recruit=-');
        const rank = member.guild.roles.cache.find(role => role.name === 'Recruit');
        member.roles.add(group);
        member.roles.add(rank);

        const name = member.user.username
        enlistee.nickname = (name.length>20 ? name.slice(0,20) : name);
        enlistee.rank = "RCT";
        enlisted[member.id] =  enlistee;

        fs.writeFile("./promotionBot/enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('person added');
            }
        });
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