export const memoryTips = [
  {
    id: 1,
    title: 'Nồng độ cồn',
    content: [
      { type: 'text', value: 'Người điều khiển xe mô tô, ô tô, máy kéo trên đường mà trong máu hoặc hơi thở có nồng độ cồn: Bị nghiêm cấm.' }
    ]
  },
  {
    id: 2,
    title: 'Khoảng cách an toàn tối thiểu',
    content: [
      { type: 'list', items: [
        '35m nếu vận tốc lưu hành V = 60 km/h',
        '55m nếu 60 < V ≤ 80',
        '70m nếu 80 < V ≤ 100',
        '100m nếu 100 < V ≤ 120',
        'Dưới 60km/h: chủ động và đảm bảo khoảng cách'
      ] }
    ]
  },
  {
    id: 3,
    title: 'Các hạng GPLX (tổng quan)',
    content: [
      { type: 'list', items: [
        'Hạng A1: mô tô đến 125 cm³ hoặc đến 11 kW',
        'Hạng A: mô tô trên 125 cm³',
        'Hạng B: ô tô con đến 08 chỗ, tải đến 3.500 kg',
        'Hạng C1/C: ô tô tải trên 3.500 kg',
        'Hạng D1/D: ô tô khách theo số chỗ',
        'Hạng BE/CE/DE: kèm rơ moóc'
      ] }
    ]
  },
  {
    id: 4,
    title: 'Hỏi về tuổi',
    content: [
      { type: 'text', value: 'Độ tuổi tối đa người lái xe ô tô trên 29 chỗ: nam 57 tuổi và nữ 55 tuổi.' },
      { type: 'list', items: [
        'Xe dưới 50cm³: 16 tuổi',
        'Hạng A1, A, B1, B, C1: 18 tuổi',
        'Hạng C, BE: 21 tuổi',
        'Hạng D1, D2, C1E, CE: 24 tuổi',
        'Hạng D, D1E, D2E, DE: 27 tuổi'
      ] }
    ]
  },
  {
    id: 5,
    title: 'Quy tắc cấm trên đường đặc biệt',
    content: [
      { type: 'list', items: [
        'Trên đường cao tốc, trong đường hầm, đường vòng, đầu dốc, nơi tầm nhìn hạn chế: không quay đầu, không lùi, không vượt',
        'Không được vượt trên cầu hẹp có một làn xe',
        'Không được quay đầu xe ở phần đường dành cho người đi bộ qua đường',
        'Cấm lùi xe ở khu vực cấm dừng và nơi đường bộ giao nhau'
      ] }
    ]
  }
];

export default memoryTips;
