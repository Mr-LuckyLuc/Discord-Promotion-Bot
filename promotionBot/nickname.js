const {SlashCommandBuilder, MessageFlags} = require('discord.js')

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nickname')
		.setDescription('Change your nickname!')
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('your new nickname')
                .setRequired(true)),
        
	async execute(interaction) {

        const client = interaction.client;
        const ranks = client.ranks;
        const enlisted = client.enlisted;

		const enlisteeId = interaction.user.id;
        const enlistee = enlisted[enlisteeId];

        if (enlisteeId == interaction.member.guild.ownerId) {
            await interaction.reply({content: "No permission to change this soldier (server owner)", flags: MessageFlags.Ephemeral});
            return;
        }    

        const user = await interaction.guild.members.fetch(enlisteeId);

        const nickname = interaction.options.getString('nickname') ?? 'ERR%R';

        enlistee.nickname = nickname;
        enlisted[enlisteeId] = enlistee;

        fs.writeFile("./promotionBot/enlisted.txt", JSON.stringify(enlisted), (err) => {
            if(err){
                console.log(err);
            }else{
                console.log('nicknames changed');
            }
        });

        try{
            await user.setNickname(ranks[enlisted[enlisteeId].name] + ' ' + nickname)
            interaction.reply({content: "nickname changed succesfully", flags: MessageFlags.Ephemeral})
        } catch(err) {
            console.log(err);
            
            await interaction.reply({content: "No permission to change this soldier (server owner)", flags: MessageFlags.Ephemeral})
        }
	}
}