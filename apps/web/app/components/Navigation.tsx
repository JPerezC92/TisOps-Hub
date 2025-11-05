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
          <li>
            <Link href="/imports" className={styles.link}>
              File Imports
            </Link>
          </li>
          <li>
            <Link href="/request-relationships" className={styles.link}>
              Request Relationships
            </Link>
          </li>
          <li>
            <Link href="/error-categorization" className={styles.link}>
              Error Categorization
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
