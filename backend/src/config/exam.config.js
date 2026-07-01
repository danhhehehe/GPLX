export const EXAM_TOPIC_KEYS = [
  'rules',
  'critical',
  'culture',
  'technique',
  'construction',
  'signs',
  'situations'
];

export const examConfig = {
  A1: {
    label: 'Hạng A1',
    bankSize: 250,
    totalQuestions: 25,
    durationMinutes: 19,
    passScore: 21,
    quota: {
      rules: 8,
      critical: 1,
      culture: 1,
      techniqueOrConstruction: 1,
      signs: 8,
      situations: 6
    }
  },
  A: {
    label: 'Hạng A',
    bankSize: 250,
    totalQuestions: 25,
    durationMinutes: 19,
    passScore: 23,
    quota: {
      rules: 8,
      critical: 1,
      culture: 1,
      techniqueOrConstruction: 1,
      signs: 8,
      situations: 6
    }
  },
  B1: {
    label: 'Hạng B1',
    bankSize: 300,
    totalQuestions: 25,
    durationMinutes: 19,
    passScore: 23,
    quota: {
      rules: 8,
      critical: 1,
      culture: 1,
      techniqueOrConstruction: 1,
      signs: 8,
      situations: 6
    }
  },
  B: {
    label: 'Hạng B',
    bankSize: 600,
    totalQuestions: 30,
    durationMinutes: 20,
    passScore: 27,
    quota: {
      rules: 8,
      critical: 1,
      culture: 1,
      technique: 1,
      construction: 1,
      signs: 9,
      situations: 9
    }
  },
  C1: {
    label: 'Hạng C1',
    bankSize: 600,
    totalQuestions: 35,
    durationMinutes: 22,
    passScore: 32,
    quota: {
      rules: 10,
      critical: 1,
      culture: 1,
      technique: 2,
      construction: 1,
      signs: 10,
      situations: 10
    }
  },
  C: {
    label: 'Hạng C',
    bankSize: 600,
    totalQuestions: 40,
    durationMinutes: 24,
    passScore: 36,
    quota: {
      rules: 10,
      critical: 1,
      culture: 1,
      technique: 2,
      construction: 1,
      signs: 14,
      situations: 11
    }
  },
  D: {
    label: 'Hạng D1, D2, D',
    bankSize: 600,
    totalQuestions: 45,
    durationMinutes: 26,
    passScore: 41,
    quota: {
      rules: 10,
      critical: 1,
      culture: 1,
      technique: 2,
      construction: 1,
      signs: 16,
      situations: 14
    }
  },
  E: {
    label: 'BE, C1E, CE, D1E, D2E, DE',
    bankSize: 600,
    totalQuestions: 45,
    durationMinutes: 26,
    passScore: 41,
    quota: {
      rules: 10,
      critical: 1,
      culture: 1,
      technique: 2,
      construction: 1,
      signs: 16,
      situations: 14
    }
  }
};

const D_LICENSES = new Set(['D1', 'D2', 'D']);
const E_LICENSES = new Set(['BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE']);

export const normalizeLicenseType = (licenseType = 'A1') => String(licenseType || 'A1').trim().toUpperCase();

export const getExamConfigKey = (licenseType = 'A1') => {
  const normalized = normalizeLicenseType(licenseType);
  if (D_LICENSES.has(normalized)) return 'D';
  if (E_LICENSES.has(normalized)) return 'E';
  return examConfig[normalized] ? normalized : 'A1';
};

export const getExamConfig = (licenseType = 'A1') => ({
  ...examConfig[getExamConfigKey(licenseType)],
  licenseType: normalizeLicenseType(licenseType),
  configKey: getExamConfigKey(licenseType)
});

export const getLicenseQuestionDefaults = (licenseType = 'A1') => {
  const config = getExamConfig(licenseType);
  return {
    questionCount: config.totalQuestions,
    passingScore: config.passScore,
    durationMinutes: config.durationMinutes
  };
};

export const topicLabels = {
  rules: 'Quy định chung và quy tắc giao thông',
  critical: 'Câu điểm liệt',
  culture: 'Văn hóa giao thông',
  technique: 'Kỹ thuật lái xe',
  construction: 'Cấu tạo và sửa chữa',
  signs: 'Biển báo',
  situations: 'Sa hình và xử lý tình huống'
};
