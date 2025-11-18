import React from "react";
import Footer from "./Footer";
import "./Layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}
