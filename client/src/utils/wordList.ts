// Bộ từ vựng luyện tập cho VocaType (Chỉ hỗ trợ Tiếng Anh và các hàng phím)

export interface LessonData {
  id: string;
  name: string;
  category: 'rows' | 'english';
  words: string[];
}

// Từ điển Anh - Việt tĩnh dùng làm fallback dự phòng
export const englishVietnameseDict: Record<string, string> = {
  'hello': 'xin chào',
  'apple': 'quả táo',
  'book': 'quyển sách',
  'family': 'gia đình',
  'school': 'trường học',
  'happy': 'vui vẻ, hạnh phúc',
  'water': 'nước',
  'friend': 'người bạn',
  'travel': 'du lịch, đi lại',
  'weather': 'thời tiết',
  'language': 'ngôn ngữ',
  'journey': 'hành trình, chuyến đi',
  'famous': 'nổi tiếng',
  'beautiful': 'đẹp, xinh đẹp',
  'decide': 'quyết định',
  'achieve': 'đạt được, hoàn thành',
  'behavior': 'hành vi, cách ứng xử',
  'challenge': 'thách thức, thử thách',
  'encourage': 'khuyến khích, động viên',
  'influence': 'ảnh hưởng, tác động',
  'prevent': 'ngăn chặn, phòng ngừa',
  'require': 'yêu cầu, đòi hỏi',
  'accurate': 'chính xác, xác đáng',
  'beneficial': 'có lợi, hữu ích',
  'consequence': 'hậu quả, hệ quả',
  'diversity': 'sự đa dạng',
  'essential': 'thiết yếu, cần thiết',
  'guarantee': 'bảo hành, cam đoan',
  'inevitable': 'không thể tránh khỏi',
  'advocate': 'ủng hộ, người ủng hộ',
  'ambiguous': 'mơ hồ, nước đôi',
  'cognitive': 'thuộc về nhận thức',
  'diligent': 'siêng năng, cần cù',
  'feasible': 'khả thi, thực hiện được',
  'pragmatic': 'thực tế, thực dụng',
  'vulnerable': 'dễ bị tổn thương',
  'anomaly': 'sự dị thường, bất thường',
  'ephemeral': 'phù du, chóng tàn',
  'gregarious': 'thích đàn đúm, thích giao du',
  'idiosyncrasy': 'đặc tính, phong cách riêng biệt',
  'juxtapose': 'đặt cạnh nhau (để đối chiếu)',
  'sycophant': 'kẻ nịnh hót, xu nịnh',
  'zenith': 'cực điểm, đỉnh cao'
};

export const lessons: LessonData[] = [
  // 1. Luyện tập theo hàng phím (Keyboard Rows)
  {
    id: 'home-row-basic',
    name: 'Home Row cơ bản (a s d f j k l ;)',
    category: 'rows',
    words: [
      'ask', 'dad', 'sad', 'fad', 'lad', 'as', 'all', 'fall', 'alas', 'salad',
      'flask', 'glass', 'jald', 'kafka', 'kaka', 'lall', 'fads', 'lads', 'sads', 'asks'
    ]
  },
  {
    id: 'home-row-extended',
    name: 'Home Row mở rộng (a s d f g h j k l ;)',
    category: 'rows',
    words: [
      'gash', 'dash', 'lash', 'flash', 'slash', 'glad', 'had', 'has', 'hag', 'lag',
      'flag', 'half', 'half', 'flags', 'shags', 'sagas', 'gall', 'galls', 'shash'
    ]
  },
  {
    id: 'top-row',
    name: 'Hàng phím trên (q w e r t y u i o p)',
    category: 'rows',
    words: [
      'type', 'write', 'row', 'top', 'power', 'quiet', 'route', 'tower', 'root', 'tree',
      'wire', 'port', 'prior', 'proper', 'pour', 'poetry', 'pope', 'uproot', 'weep', 'worry'
    ]
  },
  {
    id: 'bottom-row',
    name: 'Hàng phím dưới (z x c v b n m , . /)',
    category: 'rows',
    words: [
      'zinc', 'cab', 'van', 'ban', 'man', 'box', 'vibe', 'zone', 'cone', 'bone',
      'comb', 'buzz', 'zero', 'cave', 'wave', 'move', 'come', 'none', 'name', 'mine'
    ]
  },

  // 2. Luyện tập Tiếng Anh theo Level (Dữ liệu thực tế sẽ được nạp động từ API)
  {
    id: 'en-a1',
    name: 'Từ vựng Level A1 (Cơ bản nhất)',
    category: 'english',
    words: ['hello', 'apple', 'book', 'family', 'school', 'happy', 'water', 'friend']
  },
  {
    id: 'en-a2',
    name: 'Từ vựng Level A2 (Sơ cấp)',
    category: 'english',
    words: ['travel', 'weather', 'language', 'journey', 'famous', 'beautiful', 'decide']
  },
  {
    id: 'en-b1',
    name: 'Từ vựng Level B1 (Trung cấp)',
    category: 'english',
    words: ['achieve', 'behavior', 'challenge', 'encourage', 'influence', 'prevent', 'require']
  },
  {
    id: 'en-b2',
    name: 'Từ vựng Level B2 (Trung cấp khá)',
    category: 'english',
    words: ['accurate', 'beneficial', 'consequence', 'diversity', 'essential', 'guarantee', 'inevitable']
  },
  {
    id: 'en-c1',
    name: 'Từ vựng Level C1 (Cao cấp)',
    category: 'english',
    words: ['advocate', 'ambiguous', 'cognitive', 'diligent', 'feasible', 'pragmatic', 'vulnerable']
  },
  {
    id: 'en-c2',
    name: 'Từ vựng Level C2 (Thành thạo)',
    category: 'english',
    words: ['anomaly', 'ephemeral', 'gregarious', 'idiosyncrasy', 'juxtapose', 'sycophant', 'zenith']
  }
];

// Lấy ngẫu nhiên N từ trong danh sách từ
export const getRandomWords = (words: string[], count: number): string[] => {
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  const selected: string[] = [];
  while (selected.length < count) {
    selected.push(...shuffled);
  }
  return selected.slice(0, count);
};
