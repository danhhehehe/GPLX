# Ôn thi GPLX

Dự án full-stack cho website ôn thi GPLX. Frontend chỉ gọi backend; backend chịu trách nhiệm seed, normalize, chống trùng, thống kê, tạo đề thi và chấm điểm.

## Stack

- Frontend: React, Vite, Axios, React Router DOM
- Backend: Node.js, Express, Mongoose
- Database local: `mongodb://127.0.0.1:27017/gplx_db`

## Nguồn dữ liệu

```txt
https://onthigplx.edu.vn/data/a-a1-questions/a-a1-questions.json
https://onthigplx.edu.vn/data/questions/all-questions.json
https://onthigplx.edu.vn/traffic-signs.html
https://onthigplx.edu.vn/js/traffic-signs-data.js
https://onthigplx.edu.vn/data/b1-question-config.js?v=20250803
```

Backend không fetch thư mục ảnh `/data/images/n600/` vì thư mục này bị 403. Ảnh câu hỏi chỉ lấy từ field `image` trong JSON và được normalize thành URL đầy đủ.

## Cài Đặt

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env

npm install
npm run install:all
```

## Seed Và Sửa Dữ Liệu

```bash
cd backend
npm run seed
npm run fix:duplicates
npm run seed:traffic-signs
npm run seed:licenses
npm run seed:exam-sets
```

- `npm run seed`: import câu hỏi A/A1 và all, tạo `questionHash` bằng SHA256, merge câu trùng theo nội dung câu hỏi + đáp án, merge `sourceTypes`, `licenseTypes`, `topics`, giữ ảnh và trạng thái điểm liệt.
- `npm run fix:duplicates`: dọn dữ liệu trùng đã tồn tại trong MongoDB, merge bản tốt nhất và xóa bản dư.
- `npm run seed:traffic-signs`: lấy dữ liệu thật từ `traffic-signs-data.js`, normalize ảnh biển báo và seed collection `traffic_signs`.
- `npm run seed:licenses`: fetch/parse config hạng bằng lái, lưu collection `license_classes`; nếu config chỉ có B1 hoặc không parse được thì merge fallback để web vẫn có đủ hạng.
- `npm run seed:exam-sets`: tạo 20 bộ đề cố định cho từng hạng có dữ liệu câu hỏi.

Số liệu kiểm tra hiện tại:

```txt
questions: 600
A/A1: 250
all: 600
câu điểm liệt: 60
câu có ảnh: 318
traffic_signs: 231
nhóm biển báo: 5
license_classes: 15
```

## Chạy Dev

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Mặc định:

```txt
Backend:  http://localhost:5000
Frontend: http://localhost:5173
```

## API Chính

Questions:

```txt
GET /api/questions?page=1&limit=20&licenseType=B&category=...&isPointDeduction=true&keyword=...&mode=practice
GET /api/questions/a1
GET /api/questions/all
GET /api/questions/:id
GET /api/questions/license/:type
GET /api/questions/categories
GET /api/questions/point-deduction
GET /api/questions/with-images
GET /api/questions/no-images
GET /api/questions/image-check
GET /api/questions/statistics
```

Exam:

```txt
GET  /api/exam/a1
GET  /api/exam/:licenseType
GET  /api/exam/sets?licenseType=A1
POST /api/exam/create
POST /api/exam/submit
```

Traffic signs:

```txt
GET /api/traffic-signs?page=1&limit=50&group=...&keyword=...
GET /api/traffic-signs/groups
GET /api/traffic-signs/statistics
GET /api/traffic-signs/:code
GET /api/traffic-signs/group/:groupSlug
```

Licenses:

```txt
GET  /api/licenses
GET  /api/licenses/statistics
GET  /api/licenses/:code
POST /api/licenses/refresh
```

## Frontend Routes

```txt
/
/licenses
/questions
/questions?licenseType=B
/questions-with-images
/practice/a1
/exam
/exam/:licenseType
/exam/:licenseType/session
/exam/result
/point-deduction
/traffic-signs
/statistics
```

`/questions` và `/point-deduction` cho phép chọn đáp án trực tiếp trên từng câu, báo đúng/sai, hiển thị đáp án đúng và giải thích. `/exam` cho chọn hạng bằng lái trước khi thi, còn `/exam/B`, `/exam/C1`, `/exam/C` tạo đề theo hạng tương ứng.
