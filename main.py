from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
import pytesseract
from PIL import Image
import io
import os
import re
import csv
import cv2
import numpy as np

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to save to unified CSV
def append_to_expense_log(date, desc, amount, category):
    file_path = os.path.join(UPLOAD_DIR, "expense_log.csv")
    with open(file_path, mode='a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([date, desc, amount, category])

@app.get("/ping")
def ping():
    return {"message": "Server is up!"}

# 1. Upload CSV
@app.post("/upload/csv/")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df['Category'] = df['Description'].apply(categorize_text)
    for _, row in df.iterrows():
        append_to_expense_log(row['Date'], row['Description'], row['Amount'], row['Category'])
    return {"message": "CSV uploaded and processed successfully."}

# ⬅️ Image Preprocessing Function
def preprocess_image(image: Image.Image) -> Image.Image:
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    processed = cv2.bitwise_not(thresh)
    return Image.fromarray(processed)

# 2. Upload Receipt Image
@app.post("/upload/receipt/")
async def upload_receipt(file: UploadFile = File(...)):
    print("➡️ Upload received")
    image_data = await file.read()

    try:
        image = Image.open(io.BytesIO(image_data))
        print("🖼️ Original Image loaded")

        # Apply preprocessing
        image = preprocess_image(image)
        print("🧪 Image preprocessed")

        # OCR
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.:/$ '
        text = pytesseract.image_to_string(image, config=custom_config)

        print("🔍 Raw OCR Text:\n", text)

        items = extract_items_from_text(text)
        print("📦 Items parsed:", items)

        for item in items:
            append_to_expense_log("Receipt", item['name'], item['price'], item['category'])

        return {"message": "Receipt processed successfully.", "items": items}

    except Exception as e:
        print("❌ ERROR:", str(e))
        return {"error": str(e)}

# Item + Price extraction logic
def extract_items_from_text(text):
    lines = text.split("\n")
    results = []

    skip_keywords = [
        "suite", "palo alto", "terminal", "order id", "order number",
        "merchant", "approval code", "transaction id", "grand total", 
        "subtotal", "tip", "signature", "card type", "visa", "response",
        "amount", "entry mode", "number", "local business"
    ]

    for line in lines:
        line = line.strip()
        if not line or len(line) < 4:
            continue

        if any(k in line.lower() for k in skip_keywords):
            continue

        match = re.match(r"(.+?)[\s\.]*[\$₹]?\s*(\d{1,5}(?:\.\d{2})?)\s*$", line)
        if match:
            name = match.group(1).strip()
            price = float(match.group(2))

            # 🛑 NEW FILTER: Remove IDs, phone-like
            if re.search(r"\d{2,}-?\d{2,}", line):
                print("🚫 Skipped (Phone-like):", line)
                continue

            if name.replace(" ", "").isdigit() or len(name) < 2:
                print("🚫 Skipped (Name is just digits):", name)
                continue

            if price > 100000 and name.lower() not in ['rent', 'flight', 'insurance']:
                print("🚫 Skipped (Price too high for food):", price)
                continue

            results.append({
                "name": name,
                "price": price,
                "category": categorize_text(name)
            })
        else:
            print("🚫 Skipped (No Match or Blocked):", line)

    return results



# Categorization
def categorize_text(text):
    text = text.lower()
    if any(x in text for x in ['uber', 'ola', 'taxi']):
        return 'Transport'
    if any(x in text for x in ['food', 'restaurant', 'burger', 'coffee', 'pie', 'brownie', 'dessert']):
        return 'Food'
    if any(x in text for x in ['grocery', 'supermarket']):
        return 'Groceries'
    return 'Other'
