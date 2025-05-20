import React from 'react';

function NutritionModal({ nutrition, recipeName, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content nutrition-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{recipeName}의 영양 정보</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="nutrition-content">
          <div className="nutrition-item main-nutrition">
            <div className="nutrition-value">{nutrition.calories}</div>
            <div className="nutrition-label">칼로리 (kcal)</div>
          </div>
          
          <div className="nutrition-row">
            <div className="nutrition-item">
              <div className="nutrition-value">{nutrition.carbohydrate}g</div>
              <div className="nutrition-label">탄수화물</div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">{nutrition.protein}g</div>
              <div className="nutrition-label">단백질</div>
            </div>
            <div className="nutrition-item">
              <div className="nutrition-value">{nutrition.fat}g</div>
              <div className="nutrition-label">지방</div>
            </div>
          </div>
          
          <div className="nutrition-details">
            <h4>상세 영양 정보</h4>
            <table>
              <tbody>
                <tr>
                  <td>당류</td>
                  <td>{nutrition.sugar}g</td>
                </tr>
                <tr>
                  <td>나트륨</td>
                  <td>{nutrition.sodium}mg</td>
                </tr>
                <tr>
                  <td>포화지방</td>
                  <td>{nutrition.saturatedFat}g</td>
                </tr>
                <tr>
                  <td>트랜스지방</td>
                  <td>{nutrition.transFat}g</td>
                </tr>
                <tr>
                  <td>콜레스테롤</td>
                  <td>{nutrition.cholesterol}mg</td>
                </tr>
                {nutrition.dietaryFiber && (
                  <tr>
                    <td>식이섬유</td>
                    <td>{nutrition.dietaryFiber}g</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {(nutrition.vitaminA || nutrition.vitaminC || nutrition.calcium || nutrition.iron) && (
            <div className="nutrition-vitamins">
              <h4>비타민 및 미네랄</h4>
              <div className="vitamin-bars">
                {nutrition.vitaminA && (
                  <div className="vitamin-bar">
                    <div className="vitamin-name">비타민 A</div>
                    <div className="vitamin-bar-container">
                      <div className="vitamin-bar-fill" style={{ width: `${nutrition.vitaminA}%` }}></div>
                    </div>
                    <div className="vitamin-value">{nutrition.vitaminA}%</div>
                  </div>
                )}
                {nutrition.vitaminC && (
                  <div className="vitamin-bar">
                    <div className="vitamin-name">비타민 C</div>
                    <div className="vitamin-bar-container">
                      <div className="vitamin-bar-fill" style={{ width: `${nutrition.vitaminC}%` }}></div>
                    </div>
                    <div className="vitamin-value">{nutrition.vitaminC}%</div>
                  </div>
                )}
                {nutrition.calcium && (
                  <div className="vitamin-bar">
                    <div className="vitamin-name">칼슘</div>
                    <div className="vitamin-bar-container">
                      <div className="vitamin-bar-fill" style={{ width: `${nutrition.calcium}%` }}></div>
                    </div>
                    <div className="vitamin-value">{nutrition.calcium}%</div>
                  </div>
                )}
                {nutrition.iron && (
                  <div className="vitamin-bar">
                    <div className="vitamin-name">철분</div>
                    <div className="vitamin-bar-container">
                      <div className="vitamin-bar-fill" style={{ width: `${nutrition.iron}%` }}></div>
                    </div>
                    <div className="vitamin-value">{nutrition.iron}%</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NutritionModal;