import mongoose from "mongoose";
import validateBreed from "../LIBS/models/breedValidator.js";

const petSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
		},
		birthday: {
			type: Date,
			required: true,
		},
		speciesCategory: {
			type: String,
			required: true,
			enum: ["mammal", "bird", "reptile", "fish", "other"],
		},
		species: {
			type: String,
			required: true,
			enum: [
				"dog",
				"cat",
				"rabbit",
				"hamster",
				"guinea pig",
				"ferret",
				"parrot",
				"canary",
				"cockatiel",
				"parakeet",
				"turtle",
				"lizard",
				"snake",
				"iguana",
				"goldfish",
				"betta",
				"tropical",
				"other",
			],
			validate: {
				validator: validateBreed,
				message: (props) =>
					`Species "${props.value}" is not valid for category "${props.instance.speciesCategory}"`,
			},
		},
		weight: {
			type: Number,
			required: true,
		},
		owner: {
			type: Number,
			required: true,
			ref: "users",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("pets", petSchema);
