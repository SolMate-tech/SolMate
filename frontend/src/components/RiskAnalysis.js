import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RiskAnalysis = ({ tokenAddress }) => {
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskFactors, setRiskFactors] = useState({
    liquidity: 0,
    codeQuality: 0,
    teamTransparency: 0,
    concentration: 0,
  });

  const analyzeRisk = async () => {
    if (!tokenAddress) return;
    
    setLoading(true);
    try {
      // In a real application, this would call a backend API
      // Simulated response for demonstration
      setTimeout(() => {
        const simulatedScore = Math.floor(Math.random() * 100);
        setRiskScore(simulatedScore);
        
        setRiskFactors({
          liquidity: Math.floor(Math.random() * 100),
          codeQuality: Math.floor(Math.random() * 100),
          teamTransparency: Math.floor(Math.random() * 100),
          concentration: Math.floor(Math.random() * 100),
        });
        
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error analyzing token risk:", error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Liquidity', 'Code Quality', 'Team Transparency', 'Concentration'],
    datasets: [
      {
        label: 'Risk Factors',
        data: [
          riskFactors.liquidity,
          riskFactors.codeQuality,
          riskFactors.teamTransparency,
          riskFactors.concentration,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="risk-analysis-container">
      <h2>SPL Token Risk Analysis</h2>
      
      <div className="token-input">
        <input 
          type="text" 
          placeholder="Enter token address" 
          value={tokenAddress} 
          readOnly
        />
        <button onClick={analyzeRisk} disabled={!tokenAddress || loading}>
          {loading ? 'Analyzing...' : 'Analyze Risk'}
        </button>
      </div>
      
      {riskScore !== null && (
        <div className="risk-results">
          <div className="risk-score">
            <h3>Overall Risk Score</h3>
            <div className={`score-value ${riskScore < 30 ? 'high-risk' : riskScore < 70 ? 'medium-risk' : 'low-risk'}`}>
              {riskScore}/100
            </div>
          </div>
          
          <div className="risk-breakdown">
            <h3>Risk Breakdown</h3>
            <div className="chart-container">
              <Doughnut data={chartData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis; 