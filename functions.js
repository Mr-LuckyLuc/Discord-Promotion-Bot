const fs = require('node:fs');

client = undefined;

function updateClient(newClient) {
    client = newClient;
}

function unpackInteraction(interaction) {
    const client = interaction.client;
    const guildId = interaction.guild.id
    const ranks = client.ranks[guildId];
    const units = client.units[guildId];
    const careers = client.careers[guildId];
    const enlisted = client.enlisted[guildId];
    const interacterId = interaction.member.user.id;

    return [client, ranks, units, careers, enlisted, guildId, interacterId]
}

function updateNickname(member) {
    const userId = member.user.id;
    const guildId = member.guild.id;
    const enlisted = client.enlisted[guildId];
    
    const rank = enlisted[userId].rank;
    const unit = enlisted[userId].unit;

    const ranks = client.ranks[guildId];
    const units = client.units[guildId];

    const rankTag = ranks[rank]["rank tag"]
    const unitTag = units[unit]["rank tag"]

    let nickname = "";
    nickname += rankTag ? rankTag + " " : "";
    nickname += unitTag ? unitTag + " " : "";
    nickname += enlisted[userId].nickname;

    member.setNickname(nickname);
}

function updateEnlisted(enlisted, guildId, message) {
    client.enlisted[guildId] = enlisted;
    fs.writeFile(client.files.enlisted, JSON.stringify(client.enlisted, null, 4), (err) => {
        if(err){
            console.log(Date.now());
            console.log(err);
        }else{
            console.log(message);
        }
    });
}

function reloadFiles() {

    fs.readFile(client.files.ranks, "utf8", (err,data) => {
        if(err){
            console.error(err);
        }else{
            ranks = JSON.parse(data);
            client.ranks = ranks;
        }
    });

    fs.readFile(client.files.units, "utf8", (err,data) => {
        if(err){
            console.error(err);
        }else{
            units = JSON.parse(data);
            client.units = units;
        }
    });

    fs.readFile(client.files.careers, "utf8", (err,data) => {
        if(err){
            console.error(err);
        }else{
            careers = JSON.parse(data);
            client.careers = careers;
        }
    });

    // fs.readFile(client.files.awards, "utf8", (err,data) => {
    //     if(err){
    //         console.error(err);
    //     }else{
    //         awards = data.split(",");
    //         client.awards = awards;
    //     }
    // });

    fs.readFile(client.files.enlisted, "utf-8", (err, data) => {
        if (err) {
            console.error(err)
        } else {
            enlisted = JSON.parse(data);
            client.enlisted = enlisted;
        }
    })

    fs.readFile(client.files.stats, "utf-8", (err, data) => {
        if (err) {
            console.error(err)
        } else {
            stats = JSON.parse(data);
            client.stats = stats;
        }
    })

}



module.exports = {
    updateClient,
    unpackInteraction,
    updateNickname,
    updateEnlisted,
    reloadFiles,
}