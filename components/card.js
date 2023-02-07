import Link from "next/link";
import Image from "next/image";
import styles from './card.module.css';
import cls from "classnames";

const Card = (props) => {
    return (
        <Link className={cls("glass", styles.cardLink)} href={props.href}>
            <div className={styles.cardHeaderWrapper}>
                <h2 className={styles.cardHeader}>{props.name}</h2>
            </div>
            <div className={styles.cardImageWrapper}>
                <Image alt='coffee store image' className={styles.cardImage} src={props.imgUrl} width={260} height={160}/>
            </div>
        </Link>
    )
};

export default Card;