// src/api/enrollments.js
import api from './index';

const enrollmentsApi = {
  getMyEnrollments: async () => {
    const res = await api.get('/api/enrollments/me');
    return res.data;
  },

  enrollInCourse: async (courseId) => {
    const res = await api.post(`/api/courses/${courseId}/enroll`);
    return res.data;
  }
};

export default enrollmentsApi;
