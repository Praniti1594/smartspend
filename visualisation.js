// pages/visualizations/index.js
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './index.css';
import { useRouter } from 'next/router';



const COLORS = ['#0d6efd', '#6610f2', '#20c997', '#ffc107', '#dc3545'];

export default function VisualizationsPage() {
  const [popupType, setPopupType] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [weekdayData, setWeekdayData] = useState(null);
  const [predictionData, setPredictionData] = useState([]);

  
const router = useRouter();
const { type } = router.query;


  const fetchData = async (type) => {
    setPopupType(type);
    if (type === 'category' && categoryData.length === 0) {
      const res = await fetch('http://localhost:8000/analytics/category-breakdown');
      const data = await res.json();
      setCategoryData(data);
    }
    if (type === 'weekday' && !weekdayData) {
      const res = await fetch('http://localhost:8000/analytics/weekday-vs-weekend');
      const data = await res.json();
      setWeekdayData(data);
    }
    if (type === 'prediction' && predictionData.length === 0) {
      const res = await fetch('http://localhost:8000/analytics/predictions');
      const data = await res.json();
      setPredictionData(data);
    }
  };

  const closePopup = () => setPopupType(null);

  return (
    <div className="wrapper">
      <div className="mainContent">
        <h1 className="heading">📈 Insights Dashboard</h1>
        <div className="buttonGroup">
          <button className="button" onClick={() => fetchData('category')}>📊 Category Breakdown</button>
          <button className="button" onClick={() => fetchData('weekday')}>🗓️ Weekday vs Weekend</button>
          <button className="button" onClick={() => fetchData('prediction')}>🔮 Predictions</button>
        </div>

        {popupType && (
          <div className="popupOverlay" onClick={closePopup}>
            <div className="popupContent" onClick={(e) => e.stopPropagation()}>
              <span className="closeBtn" onClick={closePopup}>❌</span>

              {popupType === 'category' && (
                <>
                  <h2>📊 Category Breakdown</h2>
                  <PieChart width={400} height={300}>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </>
              )}

              {popupType === 'weekday' && weekdayData && (
                <>
                  <h2>🗓️ Weekday vs Weekend</h2>
                  <BarChart width={500} height={300} data={[
                    { name: 'Weekday', ...weekdayData.weekday },
                    { name: 'Weekend', ...weekdayData.weekend }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#0d6efd" name="Total Spending" />
                    <Bar dataKey="average" fill="#20c997" name="Average Spending" />
                  </BarChart>
                </>
              )}

              {popupType === 'prediction' && (
                <>
                  <h2>🔮 Category Predictions</h2>
                  <BarChart width={500} height={300} data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill="#6610f2" name="Actual" />
                    <Bar dataKey="predicted" fill="#ffc107" name="Predicted" />
                  </BarChart>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
