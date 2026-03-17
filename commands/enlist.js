const {ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, UserSelectMenuBuilder} = require('discord.js');

const { updateMessage } = require('../message');
const { unpackInteraction, updateEnlisted } = require('../functions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enlist')
		.setDescription('enlist someone'),
        
	async execute(interaction) {

        const [, ranks, units, careers, settings, enlisted, guildId, interacterId] = unpackInteraction(interaction);

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
            content: `Who do you want to enlist?`,
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

                enlistee.active = true;
                enlisted[enlisteeId] = enlistee;
        
                updateEnlisted(enlisted, guildId, 'enlisted');

                const newRank = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["rank role"]);
                const newRankExtras = interaction.guild.roles.cache.find(role => role.name === ranks[enlistee.rank]["extra roles"]);
                const newUnit = interaction.guild.roles.cache.find(role => role.name === units[enlistee.unit]["unit role"]);
                const newUnitExtras = interaction.guild.roles.cache.find(role => role.name in units[enlistee.unit]["extra roles"]);
                const newCareer = interaction.guild.roles.cache.find(role => role.name === careers[enlistee.career]["career role"]);
                const newCareerExtras = interaction.guild.roles.cache.find(role => role.name in careers[enlistee.career]["extra roles"]);
                const employee = interaction.guild.roles.cache.find(role => role.name === settings["employee role"]);
                const civ = interaction.guild.roles.cache.find(role => role.name === settings["civilian role"]);

                if (!newRank || !newUnit || !newCareer || !civ || !employee) {
                    await interaction.editReply("You are missing one of the roles, check with the /show command");
                    return;
                }

                user.roles.add(newRank);
                user.roles.add(newRankExtras);
                user.roles.add(newUnit);
                user.roles.add(newUnitExtras);
                user.roles.add(newCareer);
                user.roles.add(newCareerExtras);
                user.roles.add(employee);
                user.roles.remove(civ);

                await user.setNickname(units[enlistee.unit]["unit tag"] + ' ' + ranks[enlistee.rank]["rank tag"] + ' ' + enlistee.nickname);

                updateMessage(interaction);

                userConfirmation.update({
                    content: `Enlisted <@${enlisteeId}>.`,
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