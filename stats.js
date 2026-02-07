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
        
        const filters = ["Sergeant", "Corporal"]
        const exludedUnits = ["Motala Helicopter Squadron, 1st", "Motala Helicopter Squadron, 2nd"]
        const exludedCareers = ["Aircrew Specialist"]

        let message = ""

        const reformatted = Object.entries(enlisted).map(arr => {arr[1].id = arr[0]; return arr[1]})

        for (const unit of Object.keys(units).filter(unit => !exludedUnits.includes(unit))) {
            message += `# ${unit}\n`

            const platoon = reformatted.filter(enlistee => enlistee.unit === unit);
            const ncos = platoon.filter(enlistee => filters.includes(enlistee.rank))
            const rest = platoon.filter(enlistee => !filters.includes(enlistee.rank))

            message += "## Non-Commissioned Officers \n"
            for (const filter of filters) {
                for (const person of ncos.filter(enlistee => enlistee.rank === filter)) {
                    message += `<@${person.id}> \n`
                }
            }

            for (const career of Object.keys(careers).filter(career => !exludedCareers.includes(career))) {
                people = rest.filter(enlistee => enlistee.career===career)

                message += `## ${career}: ${people.length}\n`;

                for (person of people) {
                    message += `- <@${person.id}> \n`
                }
            }

        }


        // const grouped = {}

        // for (const unit of Object.keys(units)) {
        //     grouped[unit] = Object.values(enlisted).filter(enlistee => enlistee.unit==unit)
        // }

        // console.log(grouped);

        // let message = ""

        // for (const [name, list] of Object.entries(grouped)) {
        //     message += `\n\n${name}:`
        //     for (const rank of Object.keys(ranks)) {
        //         const amount = Object.values(list).filter(enlistee => enlistee.career==c=areeer);
        //         if (amount) message += `\n- ${rank}: ${amount}`
        //     }
        // }

// message = `Sergeants ${Object.values(enlisted).filter(enlistee => enlistee.rank=="Sergeant").length}/x\n \
// Corporals x/x\n \
// \n \
// Riflemen x/x\n \
// Marksmen x/x\n \
// \n \
// Personnel x/x\n \
// \n \
// Unit Y\n \
// Aircrew specailists x/x\n`

        interaction.reply({ content: message, flags: MessageFlags.Ephemeral }); 
		
	}
}