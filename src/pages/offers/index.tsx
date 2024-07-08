import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import PendingBridges from "@/components/PendingBridges/PendingBridges";
import PendingClaims from "@/components/PendingClaims/PendingClaims";

export default function Page() {
  const [selectedButton, setSelectedButton] = useState("pending");

  const handleButtonClick = (buttonType: string) => {
    setSelectedButton(buttonType);
  };

  return (
    <div className={styles.mainOffers}>
      <div className={styles.linePendingClaim}>
        <button
          className={
            selectedButton === "pending"
              ? `${styles.button} ${styles.selected}`
              : styles.button
          }
          onClick={() => handleButtonClick("pending")}
        >
          Pending Bridges
        </button>
        <button
          className={
            selectedButton === "claim"
              ? `${styles.button} ${styles.selected}`
              : styles.button
          }
          onClick={() => handleButtonClick("claim")}
        >
          Claim Bridges
        </button>
      </div>
      {selectedButton === "pending" ? <PendingBridges /> : <PendingClaims />}
    </div>
  );
}
