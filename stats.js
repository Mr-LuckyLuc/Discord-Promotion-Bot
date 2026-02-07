const {SlashCommandBuilder, MessageFlags} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('See the stats'),
        
	async execute(interaction) {

        const client = interaction.client;
        const enlisted = client.enlisted;
        const ranks = client.ranks;
        const units = client.units;
        const careers = client.careers;
        
        const me = "540576751005466637"
        const companyLeaderFilter = ["Captain"]
        const companyStaffFilter = ["First Sergeant"]
        const platoonLeaderFilter = ["Lieutenant"]
        const platoonStaffFilter = ["Sergeant", "Corporal"]
        const seperatedUnits = ["Motala Helicopter Squadron, 1st", "Motala Helicopter Squadron, 2nd"]
        const seperatedCareers = ["Aircrew Specialist"]

        let message = "# 1st Light Cavalry Company \n"
        message += "__**Order of Battle**__ \n"

        const reformatted = Object.entries(enlisted).map(arr => {arr[1].id = arr[0]; return arr[1]})
        
        const companyLeader = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank))
        const companyStaff = reformatted.filter(enlistee => companyLeaderFilter.includes(enlistee.rank)) //juck hardcoded

        for (const filter of companyLeaderFilter) {
            for (const person of companyLeader.filter(enlistee => enlistee.rank === filter)) {
                message += `**Company C.O: **<@${person.id}> \n\n`
            }
        }

        message += "**Company Staff** \n"
        message += `<@${me}> \n`
        for (const filter of companyStaffFilter) {
            for (const person of companyStaff.filter(enlistee => enlistee.rank === filter)) {
                message += `<@${person.id}> \n`
            }
        }

        for (const unit of Object.keys(units).filter(unit => !seperatedUnits.includes(unit))) {
            message += `## ${unit}\n`
            
            const platoon = reformatted.filter(enlistee => enlistee.unit === unit && !(enlistee.id === me));
            const platoonLeader = platoon.filter(enlistee => platoonLeaderFilter.includes(enlistee.rank))
            const platoonStaff = platoon.filter(enlistee => platoonStaffFilter.includes(enlistee.rank))
            const rest = platoon.filter(enlistee => !companyLeaderFilter.includes(enlistee.rank) && !platoonLeaderFilter.includes(enlistee.rank) && !platoonStaffFilter.includes(enlistee.rank))
            
            for (const filter of platoonLeaderFilter) {
                for (const person of platoonLeader.filter(enlistee => enlistee.rank === filter)) {
                    message += `**Platoon C.O:** <@${person.id}> \n\n`
                }
            }

            message += "**Platoon Staff** \n"
            for (const filter of platoonStaffFilter) {
                for (const person of platoonStaff.filter(enlistee => enlistee.rank === filter)) {
                    message += `<@${person.id}> \n`
                }
            }

            for (const career of Object.keys(careers).filter(career => !seperatedCareers.includes(career))) {
                people = rest.filter(enlistee => enlistee.career===career)

                message += `### ${career}: ${people.length}\n`;

                for (person of people) {
                    message += `- <@${person.id}> \n`
                }
            }

        }

        for (const unit of Object.keys(units).filter(unit => seperatedUnits.includes(unit))) {
            message += `## ${unit}\n`

            const platoon = reformatted.filter(enlistee => enlistee.unit === unit && !(enlistee.id === me));

            for (const career of Object.keys(careers).filter(career => seperatedCareers.includes(career))) {
                people = platoon.filter(enlistee => enlistee.career===career)

                message += `### ${career}: ${people.length}\n`;

                for (person of people) {
                    console.log(person.id)
                    message += `- <@${person.id}> \n`
                }
            }

        }

        interaction.reply({ content: message, flags: MessageFlags.Ephemeral }); 
		
	}
}