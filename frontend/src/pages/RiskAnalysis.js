import React, { useState, useEffect } from 'react';
import { useRiskContext } from '../contexts/RiskContext';
import { useWalletContext } from '../contexts/WalletContext';

const RiskAnalysis = () => {
  const { isAuthenticated } = useWalletContext();
  const { 
    loading, 
    error, 
    currentAnalysis, 
    riskFactors,
    analyzeTokenRisk, 
    getRiskFactors,
    clearAnalysis
  } = useRiskContext();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [showFactors, setShowFactors] = useState(false);
  
  // Load risk factors on component mount
  useEffect(() => {
    getRiskFactors();
  }, [getRiskFactors]);
  
  const handleAnalyzeToken = (e) => {
    e.preventDefault();
    if (tokenAddress.trim()) {
      analyzeTokenRisk(tokenAddress.trim());
    }
  };
  
  const handleClearAnalysis = () => {
    clearAnalysis();
    setTokenAddress('');
  };
  
  const toggleFactors = () => {
    setShowFactors(!showFactors);
  };
  
  // Helper function to get color based on risk score
  const getRiskColor = (score) => {
    if (score < 20) return 'green';
    if (score < 40) return 'lightgreen';
    if (score < 60) return 'orange';
    if (score < 80) return 'darkorange';
    return 'red';
  };
  
  return (
    <div className="risk-analysis-container">
      <h1>Token Risk Analysis</h1>
      
      {!isAuthenticated ? (
        <div className="auth-message">
          <p>Please connect your wallet to use the risk analysis tool.</p>
        </div>
      ) : (
        <>
          <div className="risk-form">
            <form onSubmit={handleAnalyzeToken}>
              <div className="form-group">
                <label htmlFor="tokenAddress">Token Address:</label>
                <input
                  type="text"
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter Solana token address"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={loading || !tokenAddress.trim()}>
                  {loading ? 'Analyzing...' : 'Analyze Risk'}
                </button>
                {currentAnalysis && (
                  <button type="button" onClick={handleClearAnalysis}>
                    Clear Analysis
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {currentAnalysis && (
            <div className="analysis-results">
              <h2>Risk Analysis Results</h2>
              
              <div className="risk-summary">
                <div className="risk-score" style={{ backgroundColor: getRiskColor(currentAnalysis.overallScore) }}>
                  <h3>{currentAnalysis.overallScore}</h3>
                  <p>Risk Score</p>
                </div>
                <div className="risk-category">
                  <h3>{currentAnalysis.riskCategory}</h3>
                  <p>Risk Category</p>
                </div>
              </div>
              
              <div className="risk-factors">
                <h3>Risk Factors <button onClick={toggleFactors}>{showFactors ? 'Hide' : 'Show'} Details</button></h3>
                
                {showFactors && (
                  <div className="factors-list">
                    {Object.entries(currentAnalysis.factors).map(([key, factor]) => (
                      <div key={key} className="factor-item">
                        <div className="factor-header">
                          <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                          <div className="factor-score" style={{ backgroundColor: getRiskColor(factor.score) }}>
                            {factor.score}
                          </div>
                          <div className="factor-weight">Weight: {factor.weight}%</div>
                        </div>
                        
                        {factor.details && (
                          <div className="factor-details">
                            <ul>
                              {Object.entries(factor.details).map(([detailKey, value]) => (
                                <li key={detailKey}>
                                  <strong>{detailKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>{' '}
                                  {typeof value === 'boolean' 
                                    ? (value ? 'Yes' : 'No') 
                                    : (value instanceof Date 
                                      ? value.toLocaleDateString() 
                                      : (Array.isArray(value) 
                                        ? value.join(', ') || 'None'
                                        : (typeof value === 'number' 
                                          ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                          : String(value))))}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <div className="recommendations">
                  <h3>Recommendations</h3>
                  <ul>
                    {currentAnalysis.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {!currentAnalysis && !loading && !error && (
            <div className="info-message">
              <h3>About Risk Analysis</h3>
              <p>
                Our risk analysis tool evaluates Solana tokens across multiple factors to provide a comprehensive risk assessment.
                Enter a token address above to get started.
              </p>
              
              {riskFactors.length > 0 && (
                <div className="risk-factors-info">
                  <h4>Risk Factors We Analyze:</h4>
                  <ul>
                    {riskFactors.map(factor => (
                      <li key={factor.id}>
                        <strong>{factor.name} ({factor.weight}%):</strong> {factor.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RiskAnalysis; 