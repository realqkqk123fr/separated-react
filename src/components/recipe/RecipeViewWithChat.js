import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { recipeAPI } from '../../services/api';
import RecipeChat from '../chat/RecipeChat';
import NutritionModal from '../recipe/modals/NutritionModal';
import CookingAssistant from '../recipe/modals/CookingAssistant';
import SatisfactionModal from '../recipe/modals/SatisfactionModal';
import SubstituteIngredientModal from '../recipe/SubstituteIngredientModal';
import './RecipeViewWithChat.css';

const LOCAL_STORAGE_RECIPE_KEY = 'current_recipe_data';

const RecipeViewWithChat = ({ user, isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // 성공 메시지 상태 추가
  const [showNutrition, setShowNutrition] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState(null);
  const [satisfactionSubmitted, setSatisfactionSubmitted] = useState(false);

  // 레시피 데이터 초기화 - 새로고침 대응 로직 추가
  useEffect(() => {
    const loadRecipeData = async () => {
      setLoading(true);
      
      try {
        // 1. location.state에서 레시피 데이터 확인
        if (location.state?.generatedRecipe) {
          console.log('레시피 데이터 확인 (라우터 state):', location.state.generatedRecipe);
          const recipeData = location.state.generatedRecipe;
          
          // 레시피 데이터를 로컬 스토리지에 저장
          localStorage.setItem(LOCAL_STORAGE_RECIPE_KEY, JSON.stringify(recipeData));
          
          setRecipe(recipeData);
          setError(null);
          
          // state를 URL 히스토리에서 제거 (새로고침 시 중복 표시 방지)
          window.history.replaceState({}, document.title);
        } 
        // 2. 로컬 스토리지에서 저장된 레시피 데이터 복원 시도
        else {
          const savedRecipeData = localStorage.getItem(LOCAL_STORAGE_RECIPE_KEY);
          
          if (savedRecipeData) {
            console.log('저장된 레시피 데이터 복원 (로컬 스토리지)');
            const recipeData = JSON.parse(savedRecipeData);
            setRecipe(recipeData);
            setError(null);
          } 
          // 3. 레시피 ID가 URL에 있다면 API로 데이터 가져오기 시도
          else if (location.search) {
            const params = new URLSearchParams(location.search);
            const recipeId = params.get('id');
            
            if (recipeId) {
              console.log(`레시피 ID로 데이터 요청: ${recipeId}`);
              
              try {
                // API를 통해 레시피 데이터 가져오기 (필요시 구현)
                // const response = await recipeAPI.getRecipeById(recipeId);
                // setRecipe(response.data);
                // setError(null);
                
                // 지금은 API가 없으므로 오류 표시
                setError('API를 통한 레시피 조회가 구현되지 않았습니다.');
              } catch (err) {
                console.error('레시피 데이터 가져오기 오류:', err);
                setError('레시피 데이터를 가져오는 중 오류가 발생했습니다.');
              }
            } else {
              setError('유효한 레시피 ID가 없습니다.');
            }
          } else {
            setError('레시피 데이터를 찾을 수 없습니다.');
          }
        }
      } catch (err) {
        console.error('레시피 데이터 처리 오류:', err);
        setError('레시피 데이터 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [location]);

  // 영양 정보 가져오기
  const fetchNutrition = async () => {
    if (!recipe || !recipe.id) {
      setError('레시피 ID를 찾을 수 없습니다.');
      return;
    }
    
    // 모달 먼저 표시
    setShowNutrition(true);
    // 로딩 상태 설정
    setNutritionLoading(true);
    setNutritionError(null);

    try {
      console.log(`영양 정보 요청 - 레시피 ID: ${recipe.id}`);

      // 영양 정보 API 호출
      const response = await recipeAPI.getNutrition(recipe.id);
      console.log('영양 정보 응답:', response.data);

      // 여기에 디버깅 로그 추가
      console.log('응답 데이터 타입:', typeof response.data);
      console.log('응답 데이터 내용:', JSON.stringify(response.data));

      // 명시적으로 로딩 상태 종료
      setNutritionLoading(false);
        
      if (response.data && response.data) {
        // 응답 데이터를 직접 설정 (객체 복사 방식 사용)
        const data = response.data;
        setNutritionData({
          calories: data.calories || 0,
          carbohydrate: data.carbohydrate || 0,
          protein: data.protein || 0,
          fat: data.fat || 0,
          sugar: data.sugar || 0,
          sodium: data.sodium || 0,
          saturatedFat: data.saturatedFat || 0,
          transFat: data.transFat || 0,
          cholesterol: data.cholesterol || 0
        });
        console.log("영양 정보 업데이트 완료");
      } else {
        // 응답은 성공했지만 데이터가 없는 경우
        setNutritionError('영양 정보가 제공되지 않았습니다');
        // 기본 영양 정보로 설정
        setNutritionData({
          calories: 500,
          carbohydrate: 30,
          protein: 25,
          fat: 15,
          sugar: 5,
          sodium: 400,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 50
        });
      }
    } catch (err) {
      console.error('영양 정보 가져오기 오류:', err);
      
      // 명시적으로 로딩 상태 종료
      setNutritionLoading(false);

      // 오류가 발생해도 기본 영양 정보로 모달 표시
      setNutritionData({
        calories: 500,
        carbohydrate: 30,
        protein: 25,
        fat: 15,
        sugar: 5,
        sodium: 400,
        saturatedFat: 3,
        transFat: 0,
        cholesterol: 50
      });
      
      setError('영양 정보를 가져오는데 실패했습니다. 기본값을 표시합니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 만족도 제출 성공 처리
  const handleSatisfactionSuccess = () => {
    setSatisfactionSubmitted(true);
    setSuccessMessage('만족도 평가가 성공적으로 제출되었습니다!');
    
    // 3초 후 성공 메시지 자동 제거
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  // 대체 레시피 생성 성공 시, 로컬 스토리지 업데이트 (강화된 버전)
  const handleSubstituteSuccess = (substituteResult) => {
    console.log('대체 재료 콜백 수신:', substituteResult);

    if (substituteResult && substituteResult.success !== false) {
      console.log('대체 재료 성공, 레시피 업데이트:', substituteResult);
      
      // 현재 레시피를 새로운 대체 레시피로 업데이트
      const updatedRecipe = {
        ...recipe,
        id: substituteResult.id || recipe.id,
        name: substituteResult.name || recipe.name,
        description: substituteResult.description || recipe.description,
        ingredients: substituteResult.ingredients || recipe.ingredients,
        instructions: substituteResult.instructions || recipe.instructions
      };
      
      // 레시피 상태 업데이트
      setRecipe(updatedRecipe);
      
      // 로컬 스토리지도 업데이트
      localStorage.setItem(LOCAL_STORAGE_RECIPE_KEY, JSON.stringify(updatedRecipe));
      
      // 기존 오류 메시지 클리어
      setError('');
      
      // 성공 메시지 표시
      const originalIngredient = substituteResult.substitutionInfo?.original || '재료';
      const substituteIngredient = substituteResult.substitutionInfo?.substitute || '대체재료';
      const successMsg = `✅ 레시피가 성공적으로 업데이트되었습니다! ${originalIngredient}를 ${substituteIngredient}로 변경했습니다.`;
      
      setSuccessMessage(successMsg);
      
      // 5초 후 성공 메시지 자동 제거
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      console.log('레시피 업데이트 완료:', updatedRecipe);
      
      // 영양 정보 갱신 요청 (새로 추가된 부분)
      refreshNutritionInfo(updatedRecipe.id);
    } else {
      // 실패한 경우 오류 메시지 표시
      const errorMessage = substituteResult?.message || '대체 재료 처리에 실패했습니다.';
      console.log('대체 재료 실패:', errorMessage);
      
      setError(errorMessage);
      
      // 5초 후 오류 메시지 자동 제거
      setTimeout(() => {
        setError('');
      }, 5000);
    }
    
    // 모달 닫기
    setShowSubstitute(false);
  };

  // 영양 정보 갱신 함수 (새로 추가)
  const refreshNutritionInfo = async (recipeId) => {
    if (!recipeId) {
      console.warn('영양 정보 갱신 실패: 레시피 ID가 없습니다.');
      return;
    }
    
    try {
      console.log(`영양 정보 갱신 요청 - 레시피 ID: ${recipeId}`);
      
      // 새로운 API 엔드포인트 호출
      const response = await recipeAPI.refreshNutrition(recipeId);
      console.log('영양 정보 갱신 응답:', response.data);
      
      // 갱신된 영양 정보 상태 업데이트
      setNutritionData(response.data);
      
      // 영양 정보가 갱신되었음을 사용자에게 알림
      const currentSuccessMsg = successMessage;
      setSuccessMessage(currentSuccessMsg + " 영양 정보도 갱신되었습니다.");
      
    } catch (err) {
      console.error('영양 정보 갱신 오류:', err);
      // 실패해도 사용자 경험에 영향을 주지 않기 위해 조용히 실패
    }
  };

  // 성공/오류 메시지 자동 제거 Effect
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 로딩 중 상태 표시
  if (loading) {
    return <div className="loading-recipe">레시피 정보를 불러오는 중...</div>;
  }

  // 오류 상태 표시
  if (error && !recipe) {
    return <div className="error-message">{error}</div>;
  }

  // 레시피가 없는 경우
  if (!recipe) {
    return (
      <div className="error-message">
        레시피를 찾을 수 없습니다.
        <button 
          onClick={() => navigate('/recipe/upload')} 
          className="return-button"
          style={{ marginLeft: '15px', padding: '8px 15px' }}
        >
          레시피 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-view-container">
      <div className="recipe-view-left-panel">
        <div className="recipe-view-header">
          <h2>{recipe.name || '이름 없는 레시피'}</h2>
          <p>{recipe.description || '설명이 없습니다.'}</p>
        </div>

        <div className="recipe-content">
          {/* 성공 메시지 표시 영역 */}
          {successMessage && (
            <div className="success-notification" role="alert">
              {successMessage}
            </div>
          )}

          {/* 오류 메시지 표시 영역 (레시피가 있을 때만) */}
          {error && (
            <div className="error-notification" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="recipe-ingredients">
            <h3>재료</h3>
            <ul className="ingredients-list">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ingredient-name">{ingredient.name}</span>
                  <span className="ingredient-amount">{ingredient.amount || '적당량'}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="recipe-steps">
            <h3>조리 방법</h3>
            <ol>
              {Array.isArray(recipe.instructions) && recipe.instructions.map((step, idx) => (
                <li key={idx}>
                  {step.instruction || step.text || '조리 단계'}
                </li>
              ))}
            </ol>
          </div>
          
          <div className="recipe-actions">
            <button 
              onClick={fetchNutrition}
              className="recipe-button nutrition-button"
            >
              영양 정보
            </button>
            
            <button 
              onClick={() => setShowAssistance(true)}
              className="recipe-button assistance-button"
            >
              요리 어시스턴스
            </button>
            
            <button 
              onClick={() => setShowSatisfaction(true)}
              className={`recipe-button satisfaction-button ${satisfactionSubmitted ? 'submitted' : ''}`}
              disabled={satisfactionSubmitted}
            >
              {satisfactionSubmitted ? '평가 완료' : '레시피 평가'}
            </button>
            
            <button 
              onClick={() => setShowSubstitute(true)}
              className="recipe-button substitute-button"
            >
              대체 재료
            </button>
          </div>
        </div>
        
        {/* 영양 정보 모달 - 로딩 상태 처리 */}
        {showNutrition && (
          <NutritionModal 
            nutrition={nutritionData} 
            recipeName={recipe.name}
            onClose={() => setShowNutrition(false)} 
            loading={nutritionLoading}
            error={nutritionError}
          />
        )}
        
        {/* 요리 어시스턴스 모달 */}
        {showAssistance && (
          <CookingAssistant 
            recipe={recipe}
            onClose={() => setShowAssistance(false)} 
          />
        )}
        
        {/* 만족도 평가 모달 */}
        {showSatisfaction && (
          <SatisfactionModal
            recipeId={recipe.id}
            recipeName={recipe.name}
            onClose={() => setShowSatisfaction(false)}
            onSubmitSuccess={handleSatisfactionSuccess}
          />
        )}
        
        {/* 대체 재료 모달 */}
        {showSubstitute && (
          <SubstituteIngredientModal
            recipeId={recipe.id}
            recipeName={recipe.name}
            onClose={() => setShowSubstitute(false)}
            onSuccess={handleSubstituteSuccess}
          />
        )}
      </div>
      
      <div className="recipe-view-right-panel">
        <RecipeChat 
          user={user} 
          isAuthenticated={isAuthenticated} 
          initialRecipe={recipe}
          compactMode={true}
        />
      </div>
    </div>
  );
};

export default RecipeViewWithChat;