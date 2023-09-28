export default class EmpireNameGenerator {

    static generateEmpireName() {
	  const vowels = 'aeiou';
	  const consonants = 'bcdfghjklmnpqrstvwxyz';
	  const nameLength = Math.floor(Math.random() * 5) + 4;
	  let name = '';
	  const even = Math.floor(Math.random(2));

	  for (let i = 0; i < nameLength; i++) {
		if (i % 2 == even) {
		  name += consonants[Math.floor(Math.random() * consonants.length)];
		} else {
		  name += vowels[Math.floor(Math.random() * vowels.length)];
		}
		if(i == 0) {
			name = name.toUpperCase();
		}
	  }

	  return name;
    }
}