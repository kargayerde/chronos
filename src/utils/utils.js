export const shortenName = (name) => {
	let splitName = name.split(" ");
	return splitName[splitName.length - 2] === "of" || splitName[splitName.length - 2] === "İbn"
		? name
		: splitName.pop();
};
