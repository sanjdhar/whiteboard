import Whiteboard from "./components/Whiteboard";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Simple Online Whiteboard",
  description: "Simple Online Whiteboard",
};

export default function Home() {
  return <Whiteboard />;
}
