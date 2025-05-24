// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 서버 URL, 필요에 따라 변경하세요

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      // 헤더에서 토큰 추출 시도
      const authHeader = response.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        localStorage.setItem('accessToken', token);
      } 
      // 응답 본문에서 토큰 추출 시도
      else if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 회원가입
  register: async (userData) => {
    try {
      return await api.post('/api/auth/register', userData);
    } catch (error) {
      throw error;
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
  },

  // 현재 사용자 정보 가져오기
  getMyProfile: async () => {
    try {
      return await api.get('/api/mypage');
    } catch (error) {
      throw error;
    }
  },

  // 사용자 정보 업데이트
  updateProfile: async (userData) => {
    try {
      return await api.post('/api/mypage', userData);
    } catch (error) {
      throw error;
    }
  }
};

// 레시피 관련 API
export const recipeAPI = {
  // 레시피 생성
  generateRecipe: async (image, instructions) => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('instructions', instructions);
    
    try {
      return await api.post('/api/recipe/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw error;
    }
  },

  // 영양 정보 가져오기
  getNutrition: async (recipeId) => {
    try {
      return await api.get(`/api/recipe/${recipeId}/nutrition`);
    } catch (error) {
      // 오류 발생 시 기본 영양 정보 반환
      return {
        data: {
          calories: 500,
          carbohydrate: 30,
          protein: 25,
          fat: 15,
          sugar: 5,
          sodium: 400,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 50
        }
      };
    }
  },

  // 만족도 평가 제출
  submitSatisfaction: async (recipeId, satisfactionData) => {
    try {
      return await api.post(`/api/recipe/${recipeId}/satisfaction`, satisfactionData);
    } catch (error) {
      throw error;
    }
  },

  // 대체 재료 요청
  substituteIngredient: async (substituteData) => {
    try {
      return await api.post('/api/recipe/substitute', substituteData);
    } catch (error) {
      throw error;
    }
  },

  refreshNutrition: async (recipeId) => {
    try {
      return await api.get(`/api/recipe/${recipeId}/refresh-nutrition`);
    } catch (error) {
      console.error('영양 정보 갱신 API 오류:', error);
      throw error;
    }
  }
};

export default api;