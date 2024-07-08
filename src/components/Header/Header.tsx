// src/components/Header.tsx
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  MouseEvent as ReactMouseEvent,
  useMemo,
} from "react";

import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

import styles from "./Header.module.scss";

import FavIcon from "@/assets/underwei_name.svg";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";

const Header: React.FC = () => {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { open, close } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  function handleConnect() {
    console.log("Connect");
    open();
  }

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  // Render
  return (
    <header className={styles.header}>
      <Link className={styles.logo} href={"/"}>
        <Image src={FavIcon} height={40} alt="Logo of the project" />
      </Link>
      <div className={styles.menu}>
        <Link
          className={`${styles.itemMenu}
          ${isActive("/") ? styles.current : ""}
          `}
          href={"/"}
        >
          Bridge
        </Link>
        <Link
          className={`${styles.itemMenu}
          ${isActive("/offers") ? styles.current : ""}
          `}
          href={"/offers"}
        >
          My offers
        </Link>
      </div>
      {!isConnected ? (
        <div className={styles.connect} onClick={handleConnect}>
          Connect
        </div>
      ) : (
        <div className={styles.connect} onClick={() => disconnect()}>
          {address?.slice(0, 5) + "..." + address?.slice(-3)}
        </div>
      )}
    </header>
  );
};

export default Header;
