const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);

const coffeeStoresTable = base('coffee-stores')
const getMinifiedRecords = (records) => {
    return records.map(record => getMinifiedRecord(record));
}
const getMinifiedRecord = (record) => {
    return {
        recordId: record.id,
        ...record.fields
    }
}
const findRecordByFilter = async (id) => {
    const foundCoffeeStoreRecords = await coffeeStoresTable.select({
        filterByFormula: `id="${id}"`
    }).firstPage();

    return getMinifiedRecords(foundCoffeeStoreRecords);
}

export {coffeeStoresTable, getMinifiedRecords, findRecordByFilter}