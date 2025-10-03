const {SlashCommandBuilder, MessageFlags} = require('discord.js')

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reload the personel in here so far'),
        
	async execute(interaction) {

        await interaction.deferReply();

        const client = interaction.client;
        const ranks = client.ranks;
        const rankList = Object.fromEntries(Object.entries(ranks).map(([i, rank])=> {
            return [rank.rank, i]
        }));
        const members = await interaction.member.guild.members.fetch();

        console.log(rankList);

        const enlisted = {};

        members.forEach(member => {
            if (!member.user.bot && !(member.user.id == member.guild.ownerId)) {
                const roles = member.roles.cache;
                roles.forEach(role => {
                    console.log(role.name)
                    console.log(role.name in rankList)

                    if (role.name in rankList) {
                        Object.entries(ranks).forEach( ([i, rank]) => {
                            if (rank.rank === role.name) {
                                enlisted[member.user.id] = {nickname: member.nickname.slice(rank.name.length+1), rank: i}
                            }
                        })
                    }
                });
            }
        }); 

        console.log(enlisted);

        fs.writeFile("./promotionBot/enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('Loaded');
            }
        });

        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral})
	}
}