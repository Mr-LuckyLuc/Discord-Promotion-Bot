const {SlashCommandBuilder, MessageFlags} = require('discord.js');

const { updateMessage } = require('../utils/message');
const { unpackInteraction, updateEnlisted, reloadFiles } = require('../utils/functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload the personel in here so far'),
        
	async execute(interaction) {

        await interaction.deferReply();

        const [, ranks, units, careers, , settings, , guildId,  ] = unpackInteraction(interaction);

        const members = await interaction.guild.members.fetch();

        const rankList = Object.fromEntries(Object.entries(ranks).map(([i, rank])=> {
            return [rank["rank role"], i];
        }));
        const unitList = Object.fromEntries(Object.entries(units).map(([i, unit])=> {
            return [unit["unit role"], i];
        }));
        const careerList = Object.fromEntries(Object.entries(careers).map(([i, career])=> {
            return [career["career role"], i];
        }));

        const enlisted = {};

        members.forEach(member => {
            if (!member.user.bot) {
                let enlistee = {};

                const userId = member.user.id;
                
                enlistee.active = false;
                enlistee.rank = Object.keys(ranks)[0];
                enlistee.unit = Object.keys(units)[0];
                enlistee.career = Object.keys(careers)[0];

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
                    if (settings["employee role"] === role.name) {
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
                const nickname = member.nickname || member.user.username || member.user.globalName;
                enlisted[userId].nickname = nickname.slice(-32+maxLength).trim();
            }
        });

        updateEnlisted(enlisted, guildId, 'loaded');
        reloadFiles();
        updateMessage(interaction);
        
        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral});
	}
}