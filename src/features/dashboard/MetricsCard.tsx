import styles from './MetricsCard.module.scss';

interface MetricsCardProps {
  title: string;
  value: number | string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'gray';
}

export const MetricsCard = ({ title, value, color }: MetricsCardProps) => {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.value}>{value}</p>
    </div>
  );
};