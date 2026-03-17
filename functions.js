const fs = require('node:fs');

let client = undefined;

function updateClient(newClient) {
    client = newClient;
}

function unpackInteraction(interaction) {
    const guildId = interaction.guildId;
    const ranks = client.ranks[guildId];
    const units = client.units[guildId];
    const careers = client.careers[guildId];
    const enlisted = client.enlisted[guildId];
    const settings = client.settings[guildId];
    const interacterId = interaction.member.user.id;

    return [client, ranks, units, careers, settings, enlisted, guildId, interacterId];
}

function updateNickname(member) {
    const userId = member.user.id;
    const guildId = member.guild.id;
    const enlisted = client.enlisted[guildId];
    const settings = client.settings[guildId];
    
    const rank = enlisted[userId].rank;
    const unit = enlisted[userId].unit;
    const career = enlisted[userId].career;

    const ranks = client.ranks[guildId];
    const units = client.units[guildId];
    const careers = client.careers[guildId];

    const rankTag = ranks[rank]["rank tag"]
    const unitTag = units[unit]["unit tag"]
    const careerTag = careers[career]["career tag"]

    let nickname = "";

    for (const prefix of settings["nickname prefixes"]) {
        switch (prefix) {
            case "rank":
                nickname += rankTag ? rankTag + " " : ""
                break;
            case "unit":
                nickname += unitTag ? unitTag + " " : ""
                break;
            case "career":
                nickname += careerTag ? careerTag + " " : ""
                break;
        }
    }

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

async function reloadFiles() {

    try {
        const data = fs.readFileSync(client.files.ranks, "utf8");
        ranks = JSON.parse(data);
        client.ranks = ranks;
    } catch (err) {
        console.log(err);
    }

    try {
        const data = fs.readFileSync(client.files.units, "utf8");
        units = JSON.parse(data);
        client.units = units;
    } catch (err) {
        console.log(err);
    }

    try {
        const data = fs.readFileSync(client.files.careers, "utf8");
        careers = JSON.parse(data);
        client.careers = careers;
    } catch (err) {
        console.log(err);
    }

    // try {
    //     const data = fs.readFileSync(client.files.awards, "utf8");
    //     awards = JSON.parse(data);
    //     client.awards = awards;
    // } catch (err) {
    //     console.log(err);
    // }

    try {
        const data = fs.readFileSync(client.files.enlisted, "utf8");
        enlisted = data?JSON.parse(data):{};
        client.enlisted = enlisted;
    } catch (err) {
        console.log(err);
    }

    try {
        const data = fs.readFileSync(client.files.settings, "utf8");
        settings = JSON.parse(data);
        client.settings = settings;
    } catch (err) {
        console.log(err);
    }

    try {
        const data = fs.readFileSync(client.files.stats, "utf8");
        stats = JSON.parse(data);
        client.stats = stats;
    } catch (err) {
        console.log(err);
    }

    return;

}



module.exports = {
    updateClient,
    unpackInteraction,
    updateNickname,
    updateEnlisted,
    reloadFiles,
}