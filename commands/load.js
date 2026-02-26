const {SlashCommandBuilder, MessageFlags} = require('discord.js');

const { updateMessage } = require('../message');
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

                enlistee.rank = Object.keys(ranks)[0];
                enlistee.unit = Object.keys(units)[0];
                enlistee.career = Object.keys(careers)[0];
                enlistee.active = false;

                if (member.id === interaction.guild.ownerId) enlistee.rank = Object.keys(ranks)[Object.keys(ranks).length - 1];

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
        
                console.log('person added');
            }
        });

        updateEnlisted(enlisted, guildId, 'loaded');
        updateMessage(client)
        
        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral});
	}
}