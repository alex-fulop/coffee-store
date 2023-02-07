import {fetchCoffeeStores} from "../../../lib/coffee-store";

const getCoffeeStoresByLocation = async (req, res) => {

    try {
        const {latLong, limit} = req.query;
        const response = await fetchCoffeeStores(latLong, limit);
        res.status(200).json(response);
    } catch (err) {
        console.error('There is an error', err);
        res.status(500).json({message: 'Oh no! Something went wrong'});
    }

}

export default getCoffeeStoresByLocation