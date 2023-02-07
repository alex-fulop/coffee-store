import {createApi} from "unsplash-js";

const unsplash = createApi({
    accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
})

const getCoffeeStoresUrl = (query, latLong, limit) => {
    return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latLong}&limit=${limit}`
}

const getPhotosForCoffeeStores = async () => {
    const photos = await unsplash.search.getPhotos({
        query: 'coffee store',
        page: 1,
        perPage: 40,
        orientation: 'landscape'
    })
    return photos.response.results.map(results => results.urls['small'])

}

export const fetchCoffeeStores = async (latLong = '47.06723165224449%2C21.911663103047097', limit = 6) => {
    const photos = await getPhotosForCoffeeStores();

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
        }
    };

    const response = await fetch(getCoffeeStoresUrl('coffee', latLong, limit), options);
    const data = await response.json();

    return data.results.map((result, i) => {
        return {
            id: result.fsq_id,
            name: result.name,
            address: result.location.address || ' ',
            neighborhood: result.location.formatted_address,
            imgUrl: photos.length > 0 ? photos[i] : null
        };
    });
}
