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

        console.log(members)

        const enlisted = {};

        members.forEach(member => {
            if (!member.user.bot) {
                console.log(member)
                let enlistee = {};

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
        }); 

        console.log(enlisted);

        fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('Loaded');
            }
        });

        interaction.editReply({content: "Loaded", flags: MessageFlags.Ephemeral})
	}
}