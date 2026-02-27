const {SlashCommandBuilder, MessageFlags} = require('discord.js');

const { updateMessage } = require('../newMessage');
const { unpackInteraction, updateEnlisted } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload the personel in here so far'),
        
	async execute(interaction) {

        await interaction.deferReply();

        const [client, ranks, units, careers, , guildId,  ] = unpackInteraction(interaction);

        const members = await interaction.guild.members.fetch();

        const rankList = Object.fromEntries(Object.entries(ranks).map(([i, rank])=> {
            return [rank["rank role"], i];
        }));
        const unitList = Object.fromEntries(Object.entries(units).map(([i, unit])=> {
            return [unit["extra role"]?unit["extra role"]:unit["unit role"], i];
        }));
        const careerList = Object.fromEntries(Object.entries(careers).map(([i, career])=> {
            return [career["role"], i];
        }));

        const enlisted = {};

        members.forEach(member => {
            if (!member.user.bot) {
                let enlistee = {};

                const userId = member.user.id;
                
                enlistee.active = false;

                if (userId === interaction.guild.ownerId) enlistee.rank = Object.keys(ranks)[Object.keys(ranks).length - 1];

                enlisted[userId] = enlistee;

                const roles = member.roles.cache;
                
                roles.forEach(role => {

                    if (role.name in rankList) {
                        Object.entries(rankList).forEach( ([i, rank]) => {
                            if (i === role.name) {
                                enlisted[userId].rank = rank;
                            }
                        })
                    }
                    if (role.name in unitList) {
                        Object.entries(unitList).forEach( ([i, unit]) => {
                            if (i === role.name) {
                                enlisted[userId].unit = unit;
                            }
                        })
                    }
                    if (role.name in careerList) {
                        Object.entries(careerList).forEach( ([i, career]) => {
                            if (i === role.name) {
                                enlisted[userId].career = career;
                            }
                        })
                    }
                    if ("K3" === role.name) {
                        enlisted[userId].active = true;
                    }

                });

                // const unitLength = units[enlisted[userId].unit]["unit tag"].length;
                // const rankLength = ranks[enlisted[userId].rank]["rank tag"].length;
                // const length = unitLength?unitLength+1:0 + rankLength?rankLength+1:0;
                
                const unitLengths = Object.values(units).map( unit => unit["unit tag"].length);
                const rankLengths = Object.values(ranks).map( rank => rank["rank tag"].length);
                const maxLength = Math.max(unitLengths) + Math.max(rankLengths);
                
                // const nickname = member.nickname?member.nickname.slice(length).trim():member.user.globalName;
                const nickname = member.user.globalName;
                enlisted[userId].nickname = nickname.slice(-32+maxLength).trim();
            }
        });

        updateEnlisted(enlisted, guildId, 'loaded');
        updateMessage(client)
        
        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral});
	}
}