// const reformatted = Object.entries(enlised).map(arr => {arr[1].id = arr[0]; return arr[1]})
// const filters = ["Sergeant", "Corporal"]
// const filtererd = reformatted.filter(enlistee => enlistee.rank in filters)
// const rest = reformatted.filter(enlistee => !(enlistee.rank in filters))

// let message = ""

// message += "Non-Commissioned Officers \n"
// for (const filter of filters) {
//     for (const person of filtererd.filter(enlistee => enlistee.rank = filter)) {

//         message += `<@${person.id}> \n `
//     }
// }

// `${unit} \n \
// Platoon C.O: @mooredoorsplease \n \
// Platoon X.O: N/A. \n \
// Non-Commissioned Officers \n \
// [Bot tags Sergeants and Corporals first according to rank hierarchy, secondly according to who was promoted to said rank first. Se example 1 below] \n \
//  \n \
// ${career} \n \
// ${list.length} out of 10. \n \
// <@${person.id}> \n \
// <@${person.id}> \n \
// <@${person.id}> \n \
//  \n \
// Riflemen \n \
// [Amount of people ranking Private to Lance corporal with this career role] out of 15. \n \
// [Bot mentions anyone ranked private to lance corporal with this career role, based on who was assigned to the unit first, not based on rank.] \n \
// @Person A \n \
// @person B \n \
// @person C \n \
//  \n \
// SAW Gunners \n \
// [Amount of people ranking Private to Lance corporal with this career role] out of 3. \n \
// [Bot mentions anyone ranked private to lance corporal with this career role, based on who was assigned to the unit first, not based on rank.] \n \
// @Person A \n \
// @person B \n \
// @person C \n \
//  \n \
// Marksmen \n \
// [Amount of people ranking Private to Lance corporal with this career role] out of 3. \n \
// [Bot mentions anyone ranked private to lance corporal with this career role, based on who was assigned to the unit first, not based on rank.] \n \
// @Person A \n \
// @person B \n \
// @person C \n \
//  \n \
// Example 1:  \n \
// @Sgt A (became sergeant on the 5th) \n \
// @Sgt B (Became sergeant on the 8th) \n \
// @CPL X (became corporal on the 1st  \n \
// @cpl Y (became corporal on the 6th) \n \
// (the brackets and their contents should not be displayed in the message, it's just explanation for you)  \n \
// Motala Helicopter Squadron \n \
// Supervised and managed by I3 Command. \n \
//  \n \
// 1st Flight \n \
// Flight C.O: @person \n \
//  \n \
// Aircrew Specialists \n \
// [Amount] out of 8 positions filled. \n \
// [Bot tags people based on how long they've been in the unit.] \n \
// @person a \n \
// @person B \n \
// @person c`