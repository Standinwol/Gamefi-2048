import Head from 'next/head';
import styles from '@/styles/index.module.css';
import Board from '@/components/board';
import Score from '@/components/score';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>2048 Game</title>
        <meta name="description" content="Classic 2048 puzzle game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="favicon.ico" />
      </Head>

      <div className={styles.content}>
        <div className={styles.gameContainer}>
          <div className={styles.gameHeader}>
            <h1>2048</h1>
            <Score />
          </div>
          <main className={styles.gameMain}>
            <Board />
          </main>
        </div>
      </div>
    </div>
  );
}
