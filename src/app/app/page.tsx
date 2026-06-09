import type { Metadata } from "next";
import { BackOfficeApp } from "@/components/sb/backoffice-app";

export const metadata: Metadata = {
  title: "Back-office — Structure B SA",
  robots: { index: false, follow: false },
};

export default function AppPage() {
  return <BackOfficeApp />;
}
