import {useRouter} from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import styles from '../../styles/coffee-store.module.css'
import React, {useContext, useEffect, useState} from "react";
import cls from "classnames";
import {fetchCoffeeStores} from "../../../lib/coffee-store";
import {StoreContext} from '../../../store/store-context';
import {isEmpty} from "../../../utils";
import useSWR from 'swr';

export async function getStaticProps(staticProps) {
    const params = staticProps.params;
    const coffeeStoresData = await fetchCoffeeStores();
    const findCoffeeStoreById = coffeeStoresData.find((coffeeStore) => {
        return coffeeStore.id.toString() === params.id;
    });
    return {
        props: {
            coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {}
        },
    };
}

export async function getStaticPaths() {
    const coffeeStoresData = await fetchCoffeeStores();

    const paths = coffeeStoresData.map(coffeeStore => {
        return {
            params: {
                id: coffeeStore.id.toString()
            }
        }
    })
    return {
        paths, fallback: true
    }
}

const CoffeeStore = (initialProps) => {
    const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore || {});
    const [votingCount, setVotingCount] = useState(1);

    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>
    }

    const id = router.query.id;

    const {
        state: {coffeeStores}
    } = useContext(StoreContext);

    const handleCreateCoffeeStore = async (coffeeStore) => {
        try {
            const {id, name, address, imgUrl, neighborhood, voting} = coffeeStore;
            await fetch('/api/createCoffeeStore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id, name, imgUrl, address: address || '', neighborhood: neighborhood || '', voting: 0
                })
            });
        } catch (err) {
            console.error('Error creating coffee store', err);
        }
    }

    useEffect(() => {
        if (isEmpty(initialProps.coffeeStore)) {
            if (coffeeStores.length > 0) {
                const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
                    return coffeeStore.id.toString() === id;
                });
                if (coffeeStoreFromContext) {
                    setCoffeeStore(coffeeStoreFromContext);
                    handleCreateCoffeeStore(coffeeStoreFromContext);
                }
            }
        } else {
            //SSG
            handleCreateCoffeeStore(initialProps.coffeeStore);
        }
    }, [id, initialProps, initialProps.coffeeStore, coffeeStores]);

    const {address, name, neighborhood, imgUrl} = coffeeStore;
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const {data, error} = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

    useEffect(() => {
        if (data && data.length > 0) {
            console.log(data);
            setCoffeeStore(data[0]);
            setVotingCount(data[0].voting)
        }
    }, [data]);

    const handleUpvoteButton = async () => {
        console.log('handle upvotes');

        try {
            const response = await fetch('/api/favoriteCoffeeStoreById', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            });

            const dbCoffeeStore = await response.json();

            if (dbCoffeeStore && dbCoffeeStore.length > 0) {
                let count = votingCount + 1;
                setVotingCount(count);
            }
        } catch (err) {
            console.error('Error upvoting the coffee store', err);
        }
    }

    if (error) {
        return <div>Something went wrong retrieving coffee store page</div>
    }

    return (<div className={styles.layout}>
        <Head>
            <title>{name}</title>
        </Head>
        <div className={styles.container}>
            <div className={styles.col1}>
                <div className={styles.backToHomeLink}>
                    <Link href='/'>Back to home</Link>
                </div>
                <div className={styles.nameWrapper}>
                    <h1 className={styles.name}>{name}</h1>
                </div>
                <Image className={styles.storeImg} alt={name} src={imgUrl} width={600} height={360}/>
            </div>

            <div className={cls("glass", styles.col2)}>
                {address &&
                    <div className={styles.iconWrapper}>
                        <Image alt='icon' src="/static/icons/places.svg" width='24' height='24'/>
                        <p className={styles.text}>{address}</p>
                    </div>
                }
                {neighborhood &&
                    <div className={styles.iconWrapper}>
                        <Image alt='icon' src="/static/icons/nearMe.svg" width='24' height='24'/>
                        <p className={styles.text}>{neighborhood}</p>
                    </div>
                }
                <div className={styles.iconWrapper}>
                    <Image alt='icon' src="/static/icons/star.svg" width='24' height='24'/>
                    <p className={styles.text}>{votingCount}</p>
                </div>

                <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
                    Up vote!
                </button>
            </div>
        </div>
    </div>);
}
export default CoffeeStore;