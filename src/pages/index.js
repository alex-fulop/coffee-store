import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import Banner from "../../components/banner";
import Image from "next/image";
import Card from "../../components/card";
import {fetchCoffeeStores} from "../../lib/coffee-store";
import useTrackLocation from "../../hooks/use-track-location";
import {useContext, useEffect, useState} from "react";
import {ACTION_TYPES, StoreContext} from "../../store/store-context";

export async function getStaticProps() {
    const coffeeStores = await fetchCoffeeStores();
    return {
        props: {
            coffeeStores
        }
    }
}

export default function Home(props) {
    const {handleTrackLocation, locationErrorMsg, isFindingLocation} = useTrackLocation();
    const [coffeeStoresError, setCoffeeStoresError] = useState(null);
    const {dispatch, state} = useContext(StoreContext);
    const {coffeeStores, latLong} = state;
    function renderCoffeeStores(coffeeStores) {
        return <>
            {coffeeStores.length > 0 && (
                <div className={styles.sectionWrapper}>
                    <h2 className={styles.heading2}>Stores near me</h2>
                    <div className={styles.cardLayout}>
                        {coffeeStores.map(coffeeStore => {
                            return (
                                <Card key={coffeeStore.id}
                                      className={styles.card}
                                      name={coffeeStore.name}
                                      imgUrl={coffeeStore.imgUrl}
                                      href={`/coffee-store/${coffeeStore.id}`}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </>;
    }
    async function setCoffeeStoresByLocation() {
        if (latLong) {
            try {
                const response = await fetch(`/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=30`);
                const coffeeStores = response.json();
                dispatch({
                    type: ACTION_TYPES.SET_COFFEE_STORES,
                    payload: { coffeeStores }
                });
                setCoffeeStoresError('')
            } catch (err) {
                console.error({ err });
                setCoffeeStoresError(err);
            }
        }
    }
    useEffect(() => { setCoffeeStoresByLocation(); }, [dispatch, latLong]);
    const handleOnBannerBtnClick = () => {
        handleTrackLocation()
    }

    return (
        <>
            <Head>
                <title>Coffee Connoisseur</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <Banner buttonText={isFindingLocation ? 'Loading..' : 'View stores nearby'}
                        handleOnClick={handleOnBannerBtnClick}/>
                {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
                {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
                <div className={styles.heroImage}>
                    <Image alt='hero image' src="/static/hero-image.png" width={700} height={400}/>
                </div>
                {renderCoffeeStores(coffeeStores)}
                {renderCoffeeStores(props.coffeeStores)}
            </main>
        </>
    )
}
