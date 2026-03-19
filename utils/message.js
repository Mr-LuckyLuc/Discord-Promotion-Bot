const {EmbedBuilder} = require('discord.js');

const { unpackInteraction } = require('./functions');

function updateMessage(interaction) {

    const [client, , , , , enlisted, guildId, ] = unpackInteraction(interaction);
    const stats = client.stats[guildId];
    const reformatted = Object.entries(enlisted).map(arr => {arr[1].id = arr[0]; return arr[1]}).filter(enlistee => enlistee.active);

    let message = `# ${stats.title} \n`;
    let embeds = [];

    for (const section of stats.sections) {

        message += `__**${section.title}**__ \n`;
        let embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(section.title);
        if (section.image) embed.setThumbnail(section.image);

        for (const subsection of section.subsections) {
            const filteredPeople = reformatted.filter(person => (subsection.filter.rank.includes(person.rank) || !subsection.filter.rank.length) && (subsection.filter.unit.includes(person.unit) || !subsection.filter.unit.length) && (subsection.filter.career.includes(person.career) || !subsection.filter.career.length));
            if (subsection.inline) {
                for (const person of filteredPeople) {
                    message += `**${subsection.name}** <@${person.id}>\n`;
                    embed.addFields({name: subsection.name, value: ` <@${person.id}>`});
                }
            } else {
                message += `**${subsection.name}**\n`;
                let list = subsection.content
                for (const person of filteredPeople) {
                    list += `- <@${person.id}>\n`;
                }
                message += list;
                
                embed.addFields({name: subsection.name, value: list || " "});
            }

            message += "\n";
        }
    
        embeds.push(embed);
    }
    
    client.message?.edit({ embeds: embeds })
    .catch(console.error);

    return message;
}

module.exports = {
    updateMessage
};