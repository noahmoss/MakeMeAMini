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
        <LogoLetter letter="C" />
        <LogoLetter letter="R" />
        <LogoLetter letter="A" />
        <LogoLetter letter="F" />
        <LogoLetter letter="T" />
        <LogoSpace />
        <LogoLetter letter="A" />
        <LogoSpace />
        <LogoLetter letter="C" />
        <LogoLetter letter="R" />
        <LogoLetter letter="O" />
        <LogoLetter letter="S" />
        <LogoLetter letter="S" />
      </div>
    </div>
  );
}

export default Logo;
