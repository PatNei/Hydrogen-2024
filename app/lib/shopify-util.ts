export const getNumFromShopifyId = (input: string) => {
	return input.substring(input.lastIndexOf("/") + 1);
};
