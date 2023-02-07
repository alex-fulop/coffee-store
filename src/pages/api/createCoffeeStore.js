import {coffeeStoresTable, getMinifiedRecords} from "../../../lib/airtable";

const createCoffeeStore = async (req, res) => {
    const {id, name, address, neighborhood, voting, imgUrl} = req.body;
    // find a record
    try {
        if (id) {
            const findCoffeeStoreRecords = await coffeeStoresTable.select({filterByFormula: `id="${id}"`}).firstPage();
            if (findCoffeeStoreRecords.length !== 0) res.json(getMinifiedRecords(findCoffeeStoreRecords));
             else {
                // create a record
                if (name) {
                    const createRecord = await coffeeStoresTable.create([{
                        fields: {id, name, address, neighborhood, voting, imgUrl}
                    }]);
                    res.json({message: 'create a record', records: getMinifiedRecords(createRecord)});
                } else {
                    res.status(400);
                    res.json({message: 'Name is missing'})
                }
            }
        } else {
            res.status(400);
            res.json({message: 'Id is missing'})
        }
    } catch (err) {
        console.error('Error creating or finding a store', err);
        res.json({message: 'Error creating or finding a store', err})
        res.status(500);
    }
}

export default createCoffeeStore;