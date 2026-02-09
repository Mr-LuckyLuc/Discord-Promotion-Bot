const {SlashCommandBuilder, MessageFlags} = require('discord.js')

const fs = require('node:fs');
const { default: updateMessage } = require('../message');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload the personel in here so far'),
        
	async execute(interaction) {

        await interaction.deferReply();

        const client = interaction.client;
        const ranks = client.ranks;
        const units = client.units;
        const careers = client.careers;
        const members = await interaction.member.guild.members.fetch();

        const rankList = Object.fromEntries(Object.entries(ranks).map(([i, rank])=> {
            return [rank["rank role"], i]
        }));
        const unitList = Object.fromEntries(Object.entries(units).map(([i, unit])=> {
            return [unit["extra role"]?unit["extra role"]:unit["unit role"], i]
        }));
        const careerList = Object.fromEntries(Object.entries(careers).map(([i, career])=> {
            return [career["role"], i]
        }));

        const enlisted = {};

        members.forEach(member => {
            if (!member.user.bot) {
                let enlistee = {};

                enlistee.rank = Object.keys(ranks)[0];
                enlistee.unit = Object.keys(units)[0];
                enlistee.career = Object.keys(careers)[0];
                enlistee.active = false;

                if (member.id === interaction.guild.ownerId) enlistee.rank = Object.keys(ranks)[Object.keys(ranks).length - 1]

                enlisted[member.id] = enlistee;

                enlisted[member.user.id].nickname = member.nickname?member.nickname.slice(9).trim():member.user.globalName.slice(0,25).trim()

                const roles = member.roles.cache;
                
                roles.forEach(role => {

                    if (role.name in rankList) {
                        Object.entries(rankList).forEach( ([i, rank]) => {
                            if (i === role.name) {
                                enlisted[member.user.id].rank = rank
                            }
                        })
                    }
                    if (role.name in unitList) {
                        Object.entries(unitList).forEach( ([i, unit]) => {
                            if (i === role.name) {
                                enlisted[member.user.id].unit = unit
                            }
                        })
                    }
                    if (role.name in careerList) {
                        Object.entries(careerList).forEach( ([i, career]) => {
                            if (i === role.name) {
                                enlisted[member.user.id].career = career
                            }
                        })
                    }
                    if ("K3" === role.name) {
                        enlisted[member.user.id].active = true
                    }

                });
        
                console.log('person added');
            }
        }); 

        client.enlisted = enlisted

        fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('Loaded');
            }
        });
        updateMessage(client)
        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral})
        console.log('Loaded!');
	}
}