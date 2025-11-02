import Link from 'next/link';
import styles from './Navigation.module.css';

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          TisOps Hub
        </Link>
        <ul className={styles.links}>
          <li>
            <Link href="/" className={styles.link}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/tasks" className={styles.link}>
              Tasks
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
