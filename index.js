// pages/index.js
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import './index.css';

export default function Home() {
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showCSVForm, setShowCSVForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState('');
  const [receiptResponse, setReceiptResponse] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const fullText = "Welcome to SmartSpend";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowInfoCard(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      const res = await fetch("http://localhost:8000/upload/csv/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setCsvMessage(data.message || 'Upload success!');
    } catch (err) {
      setCsvMessage("❌ Upload failed: " + err.message);
    }
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile) return;
    const formData = new FormData();
    formData.append("file", receiptFile);
    try {
      const res = await fetch("http://localhost:8000/upload/receipt/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setReceiptResponse(data);
    } catch (err) {
      setReceiptResponse({ error: err.message });
    }
  };

  return (
    <div className="wrapper">
       <nav className="navbar">
        <div className="logo">💸 SmartSpend</div>
        <div className="navLinks">
          <Link href="/" className="link">🏠 Home</Link>
          <Link href="/upload-csv" className="link">📂 CSV</Link>
          <Link href="/upload-receipt" className="link">🧾 Receipt</Link>
          <Link href="/view-data" className="link">📊 Past</Link>

<div className="dropdownContainer">
  <div
    className="link dropdown-toggle"
    onClick={() => setShowDropdown(!showDropdown)}
  >
    📈 Insights ▾
  </div>

  {showDropdown && (
    <div className="dropdownMenu">
      <Link href="/visualizations?type=category" className="dropdownItem">
        📊 Category Breakdown
      </Link>
      <Link href="/visualizations?type=weekday" className="dropdownItem">
        🗓️ Weekday vs Weekend
      </Link>
      <Link href="/visualizations?type=predictions" className="dropdownItem">
        🔮 Predictions
      </Link>
    </div>
  )}
</div>

        </div>
      </nav>

      <main className="mainContent">
        <h1 className="heading">{typedText}</h1>
        <p className="subheading">Your intelligent finance analyzer 🧠</p>
        <div className="buttonGroup">
          <button className="button" onClick={() => setShowCSVForm(!showCSVForm)}>
            📂 Upload CSV
          </button>
          {showCSVForm && (
            <form onSubmit={handleCSVUpload} className="uploadForm">
              <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
              <button type="submit" className="smallButton">Upload</button>
              {csvMessage && <p>{csvMessage}</p>}
            </form>
          )}

          <button className="button" onClick={() => setShowReceiptForm(!showReceiptForm)}>
            🧾 Upload Receipt
          </button>
{showReceiptForm && (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
    <form onSubmit={handleReceiptUpload} className="uploadForm">
      <input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files[0])} />
      <button type="submit" className="smallButton">Upload</button>
    </form>

    {receiptResponse && receiptResponse.items && (
      <div className="receiptPopup">
        <h3>🧾 Receipt Details:</h3>
        <p className="receiptDate">📅 Date: {receiptResponse.date}</p>
        <ul>
          {receiptResponse.items.map((item, idx) => (
            <li key={idx}>
              {item.name} - ₹{item.price}
              <span className={`categoryLabel ${item.category.toLowerCase()}`}>{item.category}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}


          <Link href="/view-data">
            <button className="secondaryButton">📊 View Past Data</button>
          </Link>
        </div>
      </main>

      {showInfoCard && (
        <div className="infoCard">
          <h2>✨ What is SmartSpend?</h2>
          <p>
            SmartSpend helps you analyze expenses, scan receipts, and visualize financial health with ease!
          </p>
        </div>
      )}

      
    </div>
  );
}
