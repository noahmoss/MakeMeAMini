import styles from "./Logo.module.css";

function LogoLetter({ letter }: { letter: string }) {
  return (
    <span className={styles.letterSquare}>
      <span className={styles.letter}>{letter}</span>
    </span>
  );
}

function LogoSpace() {
  return <span className={styles.blackSquare} />;
}

function Logo() {
  return (
    <div className={styles.logoWrapper}>
      <div className={styles.logo}>
        <LogoLetter letter="M" />
        <LogoLetter letter="A" />
        <LogoLetter letter="K" />
        <LogoLetter letter="E" />
        <LogoSpace />

        <LogoLetter letter="M" />
        <LogoLetter letter="E" />

        <LogoLetter letter="A" />
        <LogoSpace />

        <LogoLetter letter="M" />
        <LogoLetter letter="I" />
        <LogoLetter letter="N" />
        <LogoLetter letter="I" />
        <LogoSpace />
      </div>
    </div>
  );
}

export default Logo;
