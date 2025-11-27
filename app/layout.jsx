import "../styles/globals.css";
import AuthHeader from "../components/AuthHeader";

export const metadata = {
  title: "U - Your Story Begins",
  description: "A platform to read and write real stories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 text-slate-900">
        <AuthHeader />
        {children}
      </body>
    </html>
  );
}
