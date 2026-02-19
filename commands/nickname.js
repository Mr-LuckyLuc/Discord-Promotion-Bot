const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nickname')
		.setDescription('Change your nickname!')
        .addStringOption(option => option
            .setName('nickname')
            .setDescription('your new nickname')
            .setRequired(true)),
        
	async execute(interaction) {

        const client = interaction.client;
        const ranks = client.ranks;
        const units = client.units;
        const enlisted = client.enlisted;

		const interacterId = interaction.user.id;
        const nickname = interaction.options.getString('nickname') ?? 'ERR%R';

        // User ----------------
        
        const userSelect = new UserSelectMenuBuilder()
        .setCustomId("user")
        .setPlaceholder('Make a selection!');

        const userRow = new ActionRowBuilder()
        .addComponents(userSelect);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger);

        const cancelRow = new ActionRowBuilder()
            .addComponents(cancel);
            
        interaction.reply({
            content: `Who do you want to rename?`,
			components: [userRow, cancelRow],
        });


        try {
            const reply = await interaction.fetchReply();

            let userConfirmation = {member: {id: 0}};

            while (userConfirmation.member.id !== interacterId) userConfirmation = await reply.awaitMessageComponent({ time: 60_000 });

            if (userConfirmation.customId === 'user') {
                const enlisteeId = userConfirmation.values[0];
                const user = await interaction.guild.members.fetch(enlisteeId);
                
                if (enlisteeId == interaction.guild.ownerId) {
                    await userConfirmation.update({content: "No permission to change this soldier (server owner)", components: []});
                    return;
                }
                
                if (user.user.bot) {
                    await userConfirmation.update({content: "No permission to change this soldier (bot)", components: []});
                    return;
                }

                const enlistee = enlisted[enlisteeId];

                const oldNickname = enlistee.nickname;

                enlistee.nickname = nickname;
                enlisted[enlisteeId] = enlistee;

                fs.writeFile("./enlisted.txt", JSON.stringify(enlisted), (err) => {
                    if(err){
                        console.log(Date.now());
                        console.log(err);
                    }else{
                        console.log('nickname changed');
                    }
                });

                await user.setNickname(units[enlisted[enlisteeId].unit]["unit tag"] + ' ' + ranks[enlisted[enlisteeId].rank]["rank tag"] + ' ' + nickname);
                
                userConfirmation.update({
                    content: `Changed <@${enlisteeId}>'s (${oldNickname}) nickname to ${nickname}.`,
                    components: [],
                });
            } else if (userConfirmation.customId === 'cancel') {
                await interaction.editReply({ content: 'Cancelled', components: [] });
                return;
            }
            
        } catch(err) {
            console.log(Date.now());
            console.log(err);
            
            await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
        }
	}
}