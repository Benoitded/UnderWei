// import Navbar from "./navbar";
// import Footer from "./footer";
import Image from "next/image";
import { useBlockNumber } from "wagmi";

export default function Layout({ children }) {
  const { data, isError, isLoading } = useBlockNumber();

  return (
    <main
      style={{
        width: "calc(100vw - 4px)",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "space-between",
        height: "100%",
      }}
    >
      {children}
    </main>
  );
}
