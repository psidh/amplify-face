import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plus_sans_jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Amplify - Next.js",
  description: "aws-amplify next.js for face-liveliness",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${plus_sans_jakarta.className}`}>{children}</body>
    </html>
  );
}
