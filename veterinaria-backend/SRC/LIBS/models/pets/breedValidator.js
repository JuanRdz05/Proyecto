const SPECIES_BY_CATEGORY = {
	mammal: ["cat", "dog", "rabbit", "guinea pig", "hamster", "ferret"],
	bird: ["parrot", "canary", "parakeet", "cockatiel"],
	reptile: ["turtle", "lizard", "snake", "iguana"],
	fish: ["goldfish", "betta", "tropical"],
	other: ["other"],
};

const validateBreed = function (species) {
	const category = this.speciesCategory;
	if (!category || !SPECIES_BY_CATEGORY[category]) {
		return false;
	}
	return SPECIES_BY_CATEGORY[category].includes(species);
};

export default validateBreed;
