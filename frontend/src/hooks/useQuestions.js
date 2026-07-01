import { useEffect, useState } from 'react';
import { questionApi } from '../api/questionApi.js';

export const useQuestions = (params = {}, mode = 'all') => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const request = mode === 'a1'
      ? questionApi.getA1Questions(params)
      : mode === 'point'
        ? questionApi.getPointDeduction(params)
        : mode === 'images'
          ? questionApi.getWithImages(params)
          : questionApi.getQuestions(params);

    request
      .then((response) => {
        if (!active) return;
        setData(response.data || []);
        setPagination(response.pagination || { page: 1, totalPages: 1, total: 0, limit: 12 });
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [JSON.stringify(params), mode]);

  return { data, pagination, loading, error };
};
