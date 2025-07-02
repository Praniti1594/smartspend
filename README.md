Deployed link of project: https://smartspend-frontend-rkv8.vercel.app/

drive link of video: https://drive.google.com/file/d/11OH4kpfLGYneOyDUTHmXBrRFeLr3GoVS/view?usp=drivesdk


---

🧠 **SmartSpend: Intelligent Personal Finance Analyzer**

SmartSpend is a full-stack web application that intelligently extracts, categorizes, and analyzes your spending from **bank statements (CSV)** and **receipt images**. It helps users gain financial awareness through visual analytics and spending predictions — all without manual data entry.

---

🚀 **Features**

* 📂 Upload bank statements in CSV format
* 🧾 Upload scanned receipts to extract item names, prices, and purchase date
* 🧠 Automatic expense categorization using rule-based logic (or optional ML classifier)
* 📊 Visualize spending across time and categories
* 📈 Analyze trends: weekly patterns, weekend vs weekday, category breakdown
* 🔮 Predict upcoming month's spending based on historical data

---

⚙️ **Tech Stack**

| Layer       | Technology                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------- |
| Frontend    | [Next.js](https://nextjs.org/) + CSS Modules                                                |
| Backend     | [FastAPI](https://fastapi.tiangolo.com/)                                                    |
| OCR         | [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) + [OpenCV](https://opencv.org/) |
| NLP & Regex | Python's `re`, text heuristics, and parsing logic                                           |
| Database    | CSV-based logging (can be extended to MySQL/PostgreSQL)                                     |
| Data Viz    | Chart.js / Recharts (Next.js side)                                                          |

---

🛠️ **How It Works**

**1. Uploading a Bank Statement (CSV)**
Users upload a `.csv` file containing transaction data.
The backend parses each row (Date, Description, Amount).
A categorization function tags each transaction as Food, Transport, Groceries, etc.
All data is logged into a central expense file for analysis.

**2. Uploading a Receipt Image**
Users upload a photo or scan of a receipt.
The image is preprocessed using OpenCV (grayscale, thresholding).
Tesseract OCR extracts all visible text.
Regular expressions parse out:

* Item names (e.g., "Burger", "Coffee")
* Prices (e.g., ₹89.00, \$3.50)
* Date of transaction (e.g., "04/10/2024")

Parsed items are saved along with the inferred category and date.

**3. Frontend Visualizations (Next.js)**
Beautiful interactive charts display:

* Top categories by spending
* Line graphs of daily/weekly spending
* Prediction vs actual expense graphs

Users get insights like:

* "Your highest spending was on Friday evenings"
* "Food was 35% of your total expenses last month"




