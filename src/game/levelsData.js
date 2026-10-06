/**
 * DỮ LIỆU TOÀN DIỆN MÔN HỌC HCM202 CHO MINI-GAME
 * "ĐỜI SINH VIÊN: HARD MODE — BẠN SẼ CHỌN GÌ?"
 * Bám sát giáo trình Tư tưởng Hồ Chí Minh (Bộ GD&ĐT)
 */

export const INITIAL_STATS = {
  docLap: 50,    // 🎯 Độc lập - Tự chủ, sáng tạo
  doanKet: 50,   // 🤝 Đại đoàn kết, dân chủ, phê bình
  daoDuc: 50,    // ⚖️ Đạo đức: Cần - Kiệm - Liêm - Chính - Chí công vô tư
  viDan: 50,     // 👥 Vì Nhân dân, lấy dân làm gốc, phục vụ tập thể
  hocLam: 50,    // 💡 Học đi đôi với hành, lý luận gắn thực tiễn
};

export const STAT_CONFIG = {
  docLap: {
    label: 'Độc lập – Tự chủ',
    icon: '🎯',
    desc: 'Tự lực, sáng tạo, không giáo điều phụ thuộc',
    color: '#3b82f6',
    gradient: 'linear-gradient(90deg, #1d4ed8, #60a5fa)',
  },
  doanKet: {
    label: 'Đại đoàn kết',
    icon: '🤝',
    desc: 'Hợp lực tập thể, dân chủ, chân thành giúp nhau',
    color: '#10b981',
    gradient: 'linear-gradient(90deg, #047857, #34d399)',
  },
  daoDuc: {
    label: 'Đạo đức cách mạng',
    icon: '⚖️',
    desc: 'Cần – Kiệm – Liêm – Chính – Chí công vô tư',
    color: '#f59e0b',
    gradient: 'linear-gradient(90deg, #b45309, #fbbf24)',
  },
  viDan: {
    label: 'Vì nhân dân',
    icon: '👥',
    desc: 'Xuất phát từ thực tế, phục vụ cộng đồng',
    color: '#ec4899',
    gradient: 'linear-gradient(90deg, #be185d, #f472b6)',
  },
  hocLam: {
    label: 'Học đi đôi với hành',
    icon: '💡',
    desc: 'Vận dụng lý luận vào đời sống thực tế',
    color: '#8b5cf6',
    gradient: 'linear-gradient(90deg, #6d28d9, #a78bfa)',
  },
};

export const NPC_PROFILES = {
  minh: {
    name: 'Minh Deadline',
    role: 'Thành viên nhóm (Thực tế & Hay lo deadline)',
    avatar: '👨‍💻',
  },
  lan: {
    name: 'Lan Nguyên Tắc',
    role: 'Nhóm phó (Chu đáo, vì tập thể)',
    avatar: '👩‍🎓',
  },
  tuan: {
    name: 'Tuấn Đi Tắt',
    role: 'Thành viên nhóm (Thích giải pháp nhanh / copy)',
    avatar: '😎',
  },
  teacher: {
    name: 'Giảng viên HCM202',
    role: 'Cố vấn chuyên môn',
    avatar: '👩‍🏫',
  },
};

export const KNOWLEDGE_NODES = {
  node_doclap_tuchu: {
    id: 'node_doclap_tuchu',
    chapter: 'Chương 2: Độc lập dân tộc & CNXH',
    title: 'Độc lập, Tự chủ & Sáng tạo',
    desc: 'Tư tưởng Hồ Chí Minh nhấn mạnh: Độc lập tự chủ không có nghĩa là biệt lập, mà là tiếp thu có chọn lọc tinh hoa nhân loại và vận dụng sáng tạo vào điều kiện cụ thể của Việt Nam.',
    unlocked: false,
  },
  node_doanket_tapthe: {
    id: 'node_doanket_tapthe',
    chapter: 'Chương 4: Đại đoàn kết toàn dân tộc',
    title: 'Đại đoàn kết & Sức mạnh tập thể',
    desc: 'Đoàn kết không phải là sự cào bằng hay bao che, mà là tập hợp sức mạnh trên cơ sở mục tiêu chung, phát huy tính chủ động của từng cá nhân trong sự phối hợp nhịp nhàng.',
    unlocked: false,
  },
  node_phebinh_xaydung: {
    id: 'node_phebinh_xaydung',
    chapter: 'Chương 4: Đại đoàn kết toàn dân tộc',
    title: 'Tự phê bình & Phê bình chân thành',
    desc: 'Hồ Chí Minh coi tự phê bình và phê bình như “rửa mặt mỗi ngày” để giúp nhau cùng tiến bộ, củng cố sự đoàn kết thống nhất thực chất từ bên trong.',
    unlocked: false,
  },
  node_kiem_liem: {
    id: 'node_kiem_liem',
    chapter: 'Chương 6: Đạo đức cách mạng',
    title: 'Phẩm chất Kiệm & Liêm',
    desc: 'Kiệm là sử dụng hợp lý thời gian, công sức và tiền của, tránh hoang phí xa xỉ. Liêm là trong sạch, không tham lam của công, không xâm phạm tài sản tập thể.',
    unlocked: false,
  },
  node_chicong_votu: {
    id: 'node_chicong_votu',
    chapter: 'Chương 6: Đạo đức cách mạng',
    title: 'Chí công vô tư & Đức - Tài',
    desc: 'Chí công vô tư là khi làm bất cứ việc gì cũng đừng nghĩ đến mình trước, phải công bằng, ngay thẳng, đặt lợi ích chung lên trên lợi ích riêng.',
    unlocked: false,
  },
  node_vi_nhandan: {
    id: 'node_vi_nhandan',
    chapter: 'Chương 3: Đảng & Nhà nước của dân, do dân, vì dân',
    title: 'Quan điểm Lấy dân làm gốc',
    desc: 'Mọi chủ trương, hoạt động phải xuất phát từ nhu cầu, lợi ích chính đáng và nguyện vọng của quần chúng nhân dân, chứ không phải từ ý muốn chủ quan hay hình thức phô trương.',
    unlocked: false,
  },
  node_hoc_di_doi_hanh: {
    id: 'node_hoc_di_doi_hanh',
    chapter: 'Chương 5: Văn hóa, đạo đức & con người',
    title: 'Học đi đôi với Hành',
    desc: 'Học để làm việc, làm người, làm cán bộ. Học mà không hành thì vô ích, hành mà không học thì không trôi chảy. Lý luận phải luôn gắn liền với thực tiễn sinh động.',
    unlocked: false,
  },
};

export const ACHIEVEMENTS = [
  {
    id: 'ach_no_copy',
    name: '🏅 KHÔNG COPY',
    desc: 'Vượt qua tất cả các thử thách mà không một lần chọn phương án sao chép máy móc.',
    icon: '🛡️',
  },
  {
    id: 'ach_mediator',
    name: '🏅 NGƯỜI HÒA GIẢI',
    desc: 'Giải quyết xuất sắc các xung đột nhóm bằng tinh thần dân chủ và chân thành.',
    icon: '🕊️',
  },
  {
    id: 'ach_selfless',
    name: '🏅 CHÍ CÔNG VÔ TƯ',
    desc: 'Đưa ra quyết định công tâm, không để tình cảm riêng chi phối lợi ích chung.',
    icon: '⚖️',
  },
  {
    id: 'ach_self_correct',
    name: '🏅 BIẾT TỰ SỬA MÌNH',
    desc: 'Nhận diện sai sót và chọn phương án tự phê bình mang tính xây dựng.',
    icon: '🔄',
  },
  {
    id: 'ach_dialectical',
    name: '🏅 NHÀ BIỆN CHỨNG TRẺ',
    desc: 'Mở khóa Secret Ending: Vận dụng tư tưởng Hồ Chí Minh sâu sắc, không máy móc giáo điều.',
    icon: '🌟',
  },
];

export const LEVELS = [
  /* =========================================================================
     LEVEL 1: TỰ CHỦ HAY PHỤ THUỘC?
     ========================================================================= */
  {
    id: 'level-1',
    levelNum: 1,
    levelTag: 'LEVEL 1 — KHỞI ĐỘNG DỰ ÁN',
    title: '“Tôi có thể tự làm được không?”',
    situationTime: '📍 PHÒNG TỰ HỌC — TUẦN 2',
    situationHeadline: 'Nhóm trưởng Tuấn gửi tài liệu mẫu trên mạng: “Cứ làm y hệt thế này là xong!”',
    situationDesc: 'Bạn đang làm đồ án môn học. Tuấn gửi một bài của sinh viên khóa trước trên mạng và giục: “Người ta làm được điểm cao rồi, mình chỉ cần thay số và copy vào thôi cho nhanh!”. Bạn nhận ra vấn đề thực tế của nhóm mình có nhiều điểm khác biệt.',
    npc: {
      id: 'tuan',
      quote: '“Mẫu có sẵn ngon thế này không dùng thì phí! Tội gì phải vắt óc nghĩ cho mệt bro ơi!”',
    },
    knowledgeKey: 'node_doclap_tuchu',
    options: [
      {
        id: '1a',
        code: 'A',
        icon: '📋',
        text: 'Copy nguyên cách giải quyết có sẵn vì đó là phương án đã được chứng minh hiệu quả.',
        subtext: 'Tiết kiệm thời gian, bám sát mẫu an toàn.',
        deltas: { docLap: -15, hocLam: -10 },
        tag: 'copy_choice',
        feedback: {
          title: 'SAO CHÉP MÁY MÓC — ĐÁNH MẤT TÍNH TỰ CHỦ',
          quote: '“Học người khác không có nghĩa là copy nguyên xi cái vỏ của họ.”',
          detail: 'Khi nộp đề tài, giảng viên chỉ hỏi một câu về bối cảnh thực tế là cả nhóm lúng túng. Bạn đã bỏ lỡ cơ hội rèn luyện tư duy độc lập.',
          type: 'warning',
        },
      },
      {
        id: '1b',
        code: 'B',
        icon: '🔍',
        text: 'Tham khảo tài liệu mẫu, nhưng tự phân tích xem điểm nào phù hợp, điểm nào cần sáng tạo lại cho nhóm.',
        subtext: 'Kế thừa có chọn lọc và điều chỉnh theo bối cảnh thực tế.',
        deltas: { docLap: +15, hocLam: +10 },
        tag: 'independent_choice',
        feedback: {
          title: '🧠 TỰ CHỦ & TIẾP THU CÓ CHỌN LỌC',
          quote: '“Không máy móc, không phụ thuộc — Vận dụng sáng tạo vào điều kiện cụ thể.”',
          detail: 'Bạn giữ lại cấu trúc logic của tài liệu nhưng giải quyết vấn đề bằng số liệu thực của nhóm. Bài làm vừa chuyên nghiệp vừa mang dấu ấn riêng!',
          type: 'positive',
        },
      },
      {
        id: '1c',
        code: 'C',
        icon: '🙈',
        text: 'Không cần suy nghĩ thêm, trưởng nhóm bảo sao thì làm y hệt vậy.',
        subtext: 'Tránh tranh cãi, trao toàn quyền quyết định cho người khác.',
        deltas: { docLap: -10, doanKet: -5 },
        tag: 'passive_choice',
        feedback: {
          title: 'THỤ ĐỘNG & Ỷ LẠI',
          quote: '“Trách nhiệm tập thể bắt đầu từ sự tự giác của từng thành viên.”',
          detail: 'Bạn chọn phương án an toàn nhất cho cá nhân mình, nhưng lại làm suy yếu sức mạnh phản biện của cả nhóm.',
          type: 'neutral',
        },
      },
      {
        id: '1d',
        code: 'D',
        icon: '🙅‍♂️',
        text: 'Tự làm hoàn toàn từ con số 0, bác bỏ toàn bộ tài liệu tham khảo.',
        subtext: 'Thể hiện cá tính, độc lập tuyệt đối không nhìn tài liệu ai.',
        deltas: { docLap: +5, hocLam: -10 },
        tag: 'isolated_choice',
        feedback: {
          title: 'ĐỘC LẬP CỰC ĐOAN',
          quote: '“Độc lập không có nghĩa là tự đóng cửa phủ nhận tri thức nhân loại.”',
          detail: 'Bạn mất 5 ngày để tự phát minh lại cái bánh xe trong khi người khác đã giải quyết xong từ lâu. Tự chủ cần đi kèm với học hỏi có chọn lọc.',
          type: 'funny',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Nguồn gốc & Bản chất Tư tưởng Hồ Chí Minh',
      content: 'Tư tưởng Hồ Chí Minh là sản phẩm của sự kết hợp nhuần nhuyễn giữa chủ nghĩa Mác - Lênin với truyền thống dân tộc và tinh hoa văn hóa nhân loại. Người luôn nhấn mạnh: “Học tập kinh nghiệm của các nước nhưng không được rập khuôn, máy móc; phải độc lập, tự chủ, sáng tạo, xuất phát từ thực tiễn Việt Nam”.',
    },
  },

  /* =========================================================================
     LEVEL 2: ĐỘC LẬP NHƯNG KHÔNG CÔ LẬP
     ========================================================================= */
  {
    id: 'level-2',
    levelNum: 2,
    levelTag: 'LEVEL 2 — XUNG ĐỘT PHƯƠNG PHÁP',
    title: '“Độc lập nhưng không cô lập”',
    situationTime: '📍 CUỘC HỌP NHÓM ĐẦU TIÊN',
    situationHeadline: 'Hai thành viên trong nhóm tuyên bố: “Mỗi người tự làm phần mình, không cần họp hành!”',
    situationDesc: 'Bạn là nhóm trưởng. Một bạn bảo: “Tôi thích tự do làm việc của tôi, đến hạn tôi nộp”. Một bạn khác đáp: “Tôi cũng chẳng cần nghe ai góp ý”. Nhóm có nguy cơ bị phân mảnh thành những mảnh ghép rời rạc không ăn khớp.',
    npc: {
      id: 'minh',
      quote: '“Mỗi người làm một phách thế này thì lúc ghép slide kiểu gì cũng lệch tông cho xem, toang chắc rồi!”',
    },
    knowledgeKey: 'node_doanket_tapthe',
    options: [
      {
        id: '2a',
        code: 'A',
        icon: '🤷‍♂️',
        text: 'Đồng ý để mỗi người tự làm theo ý mình vì ai cũng có quyền tự do cá nhân.',
        subtext: 'Không can thiệp, chờ đến sát deadline mới ghép bài.',
        deltas: { doanKet: -15, docLap: -5 },
        tag: 'fragment_choice',
        feedback: {
          title: 'TỰ DO VÔ TỔ CHỨC',
          quote: '“Tự do của cá nhân phải gắn liền với kỷ luật và mục tiêu chung của tập thể.”',
          detail: 'Đến hạn chót, bài của 4 người có 4 định dạng khác nhau, nội dung đá nhau chan chát. Nhóm mất cả đêm để sửa chữa trong hoảng loạn.',
          type: 'warning',
        },
      },
      {
        id: '2b',
        code: 'B',
        icon: '👑',
        text: 'Dùng quyền nhóm trưởng ép buộc mọi người phải làm chính xác theo mệnh lệnh của bạn.',
        subtext: 'Chuyên quyền, ra lệnh tuyệt đối.',
        deltas: { doanKet: -15, viDan: -10 },
        tag: 'authoritarian_choice',
        feedback: {
          title: 'ĐỘC ĐOÁN & QUAN LIÊU',
          quote: '“Dân chủ là của báu quý nhất. Lãnh đạo không phải là đè đầu cưỡi cổ người khác.”',
          detail: 'Các thành viên cảm thấy không được tôn trọng, làm việc đối phó và bầu không khí nhóm trở nên ngột ngạt, ức chế.',
          type: 'alarm',
        },
      },
      {
        id: '2c',
        code: 'C',
        icon: '🤝',
        text: 'Tổ chức buổi trao đổi dân chủ, thống nhất mục tiêu chung và phân công dựa trên thế mạnh của từng người.',
        subtext: 'Phát huy tính chủ động cá nhân trong sự phối hợp ăn ý của tập thể.',
        deltas: { doanKet: +15, docLap: +10, viDan: +5 },
        tag: 'democratic_choice',
        feedback: {
          title: 'KẾT HỢP SỨC MẠNH CÁ NHÂN VÀ TẬP THỂ',
          quote: '“Một cây làm chẳng nên non — Ba cây chụm lại nên hòn núi cao.”',
          detail: 'Bạn tạo điều kiện để ai cũng được phát huy sở trường (người giỏi nghiên cứu tài liệu, người thiết kế slide đẹp), bài tập nhóm đạt chất lượng vượt bậc!',
          type: 'positive',
        },
      },
      {
        id: '2d',
        code: 'D',
        icon: '🧑‍💻',
        text: 'Nhận làm hết tất cả các phần khó nhất để tránh tranh cãi mất lòng nhau.',
        subtext: 'Âm thầm gánh team một mình.',
        deltas: { doanKet: -5, hocLam: -10 },
        tag: 'carry_alone_choice',
        feedback: {
          title: 'GÁNH THAY KHÔNG PHẢI LÀ ĐOÀN KẾT',
          quote: '“Đoàn kết là cùng nhau gánh vác, chứ không phải một người gánh thay tất cả.”',
          detail: 'Bạn kiệt sức sau 3 đêm thức trắng, trong khi các bạn khác không học hỏi được gì và hình thành thói quen ỷ lại tiêu cực.',
          type: 'neutral',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Đại đoàn kết toàn dân tộc',
      content: 'Hồ Chí Minh khẳng định: Đại đoàn kết là vấn đề sống còn. Đoàn kết phải trên cơ sở dân chủ, tôn trọng lợi ích chính đáng của các cá nhân nhưng hướng về mục tiêu chung. Độc lập, tự chủ của mỗi bộ phận không tách rời khỏi sức mạnh khối đại đoàn kết tập thể.',
    },
  },

  /* =========================================================================
     LEVEL 3: AI CHỊU TRÁCH NHIỆM?
     ========================================================================= */
  {
    id: 'level-3',
    levelNum: 3,
    levelTag: 'LEVEL 3 — KHỦNG HOẢNG DEADLINE',
    title: '“Group Project: Ai chịu trách nhiệm?”',
    situationTime: '⏰ 22:00 — CÒN 2 TIẾNG NỘP BÀI',
    situationHeadline: 'Thành viên phụ trách tổng hợp slide chưa hoàn thành và bỗng dưng không phản hồi.',
    situationDesc: 'Bạn tìm hiểu và biết bạn ấy bị hỏng máy tính và gia đình có việc đột xuất. Nếu không nộp đủ bài trước 23:59, cả nhóm sẽ bị 0 điểm quá trình môn này.',
    npc: {
      id: 'lan',
      quote: '“Tớ biết bạn ấy đang rất bối rối. Nếu giờ chúng ta xúm vào chỉ trích thì bài cũng không tự xong được đâu!”',
    },
    knowledgeKey: 'node_phebinh_xaydung',
    options: [
      {
        id: '3a',
        code: 'A',
        icon: '😡',
        text: '“Gạch tên bạn ấy ra khỏi danh sách nộp bài và méc giảng viên để khỏi bị trừ điểm chung!”',
        subtext: 'Bảo vệ quyền lợi của những người đã làm, trừng phạt người chậm trễ.',
        deltas: { doanKet: -20, daoDuc: -5 },
        tag: 'punish_choice',
        feedback: {
          title: 'THIẾU SỰ THẤU HIỂU & TÌNH ĐỒNG ĐỘI',
          quote: '“Đoàn kết phải xuất phát từ lòng thương yêu, khoan dung và độ lượng với đồng chí, đồng bào.”',
          detail: 'Hành động lạnh lùng làm rạn nứt hoàn toàn mối quan hệ bạn bè trong lớp. Bạn đã bảo vệ điểm số nhưng đánh mất tinh thần tương thân tương ái.',
          type: 'warning',
        },
      },
      {
        id: '3b',
        code: 'B',
        icon: '🤝',
        text: 'Chủ động liên hệ hỗ trợ: Cả nhóm chia nhau mỗi người gánh 2 slide, sau đó ngồi lại rút kinh nghiệm với bạn.',
        subtext: 'Vừa hoàn thành mục tiêu tập thể, vừa chân thành giúp đỡ bạn vượt qua khó khăn.',
        deltas: { doanKet: +15, daoDuc: +10, hocLam: +10 },
        tag: 'support_feedback_choice',
        feedback: {
          title: 'TÌNH ĐỒNG CHÍ & TINH THẦN TRÁCH NHIỆM CAO',
          quote: '“Phải có tình đồng chí thương yêu lẫn nhau, cùng giúp nhau tiến bộ.”',
          detail: 'Bài tập được nộp lúc 23:45 trọn vẹn. Ngày hôm sau bạn ấy chân thành cảm ơn nhóm và chủ động xin nhận phần việc nặng hơn ở bài thuyết trình tiếp theo!',
          type: 'positive',
        },
      },
      {
        id: '3c',
        code: 'C',
        icon: '🤫',
        text: 'Làm thay luôn toàn bộ và giấu giảng viên, xem như bạn ấy đã làm tốt phần của mình.',
        subtext: 'Bao che cho bạn, sợ bạn bị điểm kém.',
        deltas: { doanKet: -5, daoDuc: -15 },
        tag: 'cover_up_choice',
        feedback: {
          title: 'BAO CHE SAI LẦM KHÔNG PHẢI LÀ ĐOÀN KẾT',
          quote: '“Bao che khuyết điểm là làm hại người khác chứ không phải thương người.”',
          detail: 'Bác Hồ dạy: Yêu thương đồng chí là phải chỉ ra cái sai để cùng sửa chữa. Bao che biến sự lười biếng hoặc thiếu kỹ năng thành thói quen cố tật.',
          type: 'alarm',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Đạo đức cách mạng & Đại đoàn kết',
      content: 'Trong Di chúc, Bác Hồ căn dặn: “Trong Đảng thực hành dân chủ rộng rãi, thường xuyên và nghiêm chỉnh tự phê bình và phê bình là cách tốt nhất để củng cố và phát triển sự đoàn kết và thống nhất... Phải có tình đồng chí thương yêu lẫn nhau”. Đoàn kết chân chính phải dựa trên nguyên tắc và sự chân thành giúp nhau hoàn thiện.',
    },
  },

  /* =========================================================================
     LEVEL 4: 500.000 ĐỒNG CỦA NHÓM
     ========================================================================= */
  {
    id: 'level-4',
    levelNum: 4,
    levelTag: 'LEVEL 4 — QUẢN LÝ QUỸ CHUNG',
    title: '“500.000 Đồng của nhóm”',
    situationTime: '💵 SAU KHI HOÀN THÀNH DỰ ÁN',
    situationHeadline: 'Khoa cấp 500.000đ kinh phí làm mô hình. Sau khi mua vật liệu còn dư đúng 170.000đ.',
    situationDesc: 'Tuấn nhanh nhảu đề xuất: “Khoa duyệt chi rồi, không ai kiểm tra lại đâu! Chia nhau mỗi đứa 40k uống trà sữa đi, tiền của nhóm mình mà!”.',
    npc: {
      id: 'tuan',
      quote: '“Có 170k bọ, trả lại khoa thì thủ tục rườm rà lắm! Đi liên hoan một bữa cho phấn khởi bro ơi!”',
    },
    knowledgeKey: 'node_kiem_liem',
    options: [
      {
        id: '4a',
        code: 'A',
        icon: '🧋',
        text: 'Chia đều 170k cho các thành viên hoặc kéo nhau đi ăn uống xả láng.',
        subtext: 'Tiền đã rót về túi thì tận hưởng, không cần khai báo.',
        deltas: { daoDuc: -20, viDan: -10 },
        tag: 'embezzle_choice',
        feedback: {
          title: 'CHIẾM DỤNG CỦA CÔNG — VI PHẠM CHỮ “LIÊM”',
          quote: '“Một hạt gạo, một đồng tiền của công đều là mồ hôi nước mắt của nhân dân.”',
          detail: 'Thói quen biển thủ từ những món tiền nhỏ nhặt thời sinh viên chính là mầm mống của thói tham ô, lãng phí sau này.',
          type: 'alarm',
        },
      },
      {
        id: '4b',
        code: 'B',
        icon: '📜',
        text: 'Ghi chép hóa đơn minh bạch, lập báo cáo tài chính và hoàn trả số tiền dư theo đúng quy định của Khoa.',
        subtext: 'Minh bạch, tôn trọng kỷ luật tài chính và của công.',
        deltas: { daoDuc: +20, hocLam: +10 },
        tag: 'transparent_choice',
        feedback: {
          title: 'CHÍNH TRỰC & LIÊM KHIẾT',
          quote: '“Liêm là trong sạch, không tham lam. Của công phải giữ gìn cẩn thận.”',
          detail: 'Nhóm bạn được tuyên dương trước lớp vì sự minh bạch và chuyên nghiệp. Khoa đánh giá rất cao tinh thần trách nhiệm của nhóm!',
          type: 'positive',
        },
      },
      {
        id: '4c',
        code: 'C',
        icon: '🤐',
        text: 'Để nhóm trưởng giữ quỹ riêng, ai cần gì sau này thì tự chi mà không cần ghi chép sổ sách.',
        subtext: 'Mập mờ thu chi, không có kiểm soát.',
        deltas: { daoDuc: -10, doanKet: -5 },
        tag: 'secret_fund_choice',
        feedback: {
          title: 'THIẾU MINH BẠCH TÀI CHÍNH',
          quote: '“Mập mờ tài chính là nguồn cơn của mọi nghi ngờ và mất đoàn kết nội bộ.”',
          detail: 'Vài tuần sau, các thành viên bắt đầu râm ran nghi ngờ nhóm trưởng tiêu lạm vào tiền quỹ. Sự thiếu công khai đã giết chết niềm tin.',
          type: 'warning',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Đạo đức cách mạng (Cần, Kiệm, Liêm, Chính)',
      content: 'Hồ Chí Minh định nghĩa: “Liêm là trong sạch, không tham lam... Không tham địa vị. Không tham tiền tài. Không tham sung sướng”. Kiệm là biết sử dụng nguồn lực hợp lý, không lãng phí của công. Liêm là giữ gìn tài sản của tập thể, nhân dân, tuyệt đối không biến của công thành của tư dù chỉ là một cây kim sợi chỉ.',
    },
  },

  /* =========================================================================
     LEVEL 5: BẠN ĐƯỢC ƯU TIÊN
     ========================================================================= */
  {
    id: 'level-5',
    levelNum: 5,
    levelTag: 'LEVEL 5 — QUYẾT ĐỊNH CÔNG TÂM',
    title: '“Bạn được ưu tiên chọn người”',
    situationTime: '📍 PHÒNG HỘI THẢO — ĐẠI DIỆN KHOA',
    situationHeadline: 'Bạn là nhóm trưởng, được quyền chọn 1 người đại diện thuyết trình trước hội đồng trường.',
    situationDesc: 'Có hai ứng viên: Một là bạn thân của bạn (thuyết trình mức khá, rất muốn lên sân khấu để lấy điểm rèn luyện), hai là một thành viên ít nói trong nhóm nhưng có chất giọng và tư duy phản biện cực kỳ xuất sắc.',
    npc: {
      id: 'lan',
      quote: '“Cơ hội này sẽ ảnh hưởng trực tiếp đến giải thưởng của toàn nhóm trước ban giám khảo trường đấy!”',
    },
    knowledgeKey: 'node_chicong_votu',
    options: [
      {
        id: '5a',
        code: 'A',
        icon: '🫂',
        text: 'Chọn bạn thân vì tình cảm gắn bó lâu năm và muốn giúp bạn mình tỏa sáng.',
        subtext: 'Đặt tình cảm cá nhân lên trên sự lựa chọn khách quan.',
        deltas: { daoDuc: -20, viDan: -10, doanKet: -5 },
        tag: 'nepotism_choice',
        feedback: {
          title: 'THIÊN VỊ CÁ NHÂN — VI PHẠM “CHÍ CÔNG VÔ TƯ”',
          quote: '“Khi việc công lẫn việc tư thì việc công sẽ bị hỏng.”',
          detail: 'Bạn thân của bạn bị khớp trên sân khấu lớn, bài thuyết trình không truyền tải hết tâm huyết của nhóm. Cả nhóm tiếc nuối vì tuột mất giải Nhất.',
          type: 'warning',
        },
      },
      {
        id: '5b',
        code: 'B',
        icon: '⚖️',
        text: 'Chọn bạn có năng lực thuyết trình tốt nhất, đồng thời phân công bạn thân phụ trách phần slide và demo để cả hai cùng tỏa sáng.',
        subtext: 'Công tâm, dùng người đúng sở trường vì mục tiêu chung của tập thể.',
        deltas: { daoDuc: +20, docLap: +10, doanKet: +10 },
        tag: 'merit_choice',
        feedback: {
          title: 'CHÍ CÔNG VÔ TƯ & DÙNG NGƯỜI ĐÚNG CHỖ',
          quote: '“Dụng nhân như dụng mộc — Người có tài nào thì dùng vào việc ấy.”',
          detail: 'Buổi bảo vệ thành công rực rỡ! Hội đồng khen ngợi nhóm vừa có người trình bày lôi cuốn, vừa có đội ngũ hỗ trợ kỹ thuật cực kỳ ăn ý.',
          type: 'positive',
        },
      },
      {
        id: '5c',
        code: 'C',
        icon: '🎲',
        text: 'Bốc thăm may rủi để khỏi mang tiếng thiên vị ai.',
        subtext: 'Né tránh trách nhiệm lựa chọn của người đội trưởng.',
        deltas: { docLap: -10, hocLam: -5 },
        tag: 'gambling_choice',
        feedback: {
          title: 'TRỐN TRÁNH TRÁCH NHIỆM LÃNH ĐẠO',
          quote: '“Người cán bộ phải có bản lĩnh nhìn nhận đúng người, đúng việc chứ không phó mặc cho may rủi.”',
          detail: 'Bốc thăm biến một quyết định chiến lược thành trò chơi may rủi, thể hiện sự thiếu bản lĩnh trong quản trị nhân lực.',
          type: 'neutral',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Đạo đức cách mạng & Công tác cán bộ',
      content: 'Chủ tịch Hồ Chí Minh dạy: “Chí công vô tư là đem lòng chí công xử sự đối với người, đối với việc... Khi làm việc gì cũng đừng nghĩ đến mình trước, phải vì việc chung”. Trong dùng người, Bác nhấn mạnh “phải cất nhắc những người có tài, có đức, không được vì quen thân mà dùng người kém cỏi”.',
    },
  },

  /* =========================================================================
     LEVEL 6: AI LÀ NGƯỜI QUAN TRỌNG NHẤT?
     ========================================================================= */
  {
    id: 'level-6',
    levelNum: 6,
    levelTag: 'LEVEL 6 — VÌ LỢI ÍCH SINH VIÊN',
    title: '“Ai là người quan trọng nhất?”',
    situationTime: '📍 BAN CHẤP HÀNH ĐOÀN — HỘI SINH VIÊN',
    situationHeadline: 'Bạn được giao thiết kế chương trình chào đón tân sinh viên với ngân sách có hạn.',
    situationDesc: 'Có hai luồng ý kiến: Ban tổ chức muốn thuê ca sĩ nổi tiếng, dựng backdrop khổng lồ để “lên hình thật hoành tráng cho ban giám hiệu xem”. Nhưng khảo sát cho thấy 85% tân sinh viên đang bơ vơ, lo lắng về nhà trọ, phương pháp học đại học và cần workshop chia sẻ kỹ năng thực tế.',
    npc: {
      id: 'teacher',
      quote: '“Một chương trình thành công được đo bằng giá trị thực sự mang lại cho sinh viên, hay bằng sự hào nhoáng trong vài bức ảnh báo cáo?”',
    },
    knowledgeKey: 'node_vi_nhandan',
    options: [
      {
        id: '6a',
        code: 'A',
        icon: '🎉',
        text: 'Dồn toàn bộ tiền thuê âm thanh ánh sáng khủng, làm sân khấu rực rỡ để lãnh đạo thấy hoành tráng.',
        subtext: 'Hình thức đẹp mắt, phục vụ báo cáo thành tích bên trên.',
        deltas: { viDan: -20, hocLam: -10, daoDuc: -10 },
        tag: 'show_off_choice',
        feedback: {
          title: 'BỆNH HÌNH THỨC & QUAN LIÊU',
          quote: '“Làm việc vì thành tích bề nổi là xa rời quần chúng nhân dân.”',
          detail: 'Sự kiện ồn ào trôi qua trong 2 tiếng, tân sinh viên ra về với sự hụt hẫng và những nỗi lo thường nhật về học tập, sinh hoạt vẫn không có lời giải đáp.',
          type: 'warning',
        },
      },
      {
        id: '6b',
        code: 'B',
        icon: '💡',
        text: 'Thiết kế chuỗi hoạt động hỗ trợ thiết thực: Cẩm nang nhà trọ an toàn, gian hàng định hướng học tập và kết nối anh chị cố vấn.',
        subtext: 'Lấy nhu cầu thực tế của sinh viên làm trung tâm hành động.',
        deltas: { viDan: +20, hocLam: +15, daoDuc: +10 },
        tag: 'people_centric_choice',
        feedback: {
          title: 'LẤY NGƯỜI DÂN / SINH VIÊN LÀM GỐC',
          quote: '“Việc gì lợi cho dân, ta phải hết sức làm. Việc gì hại đến dân, ta phải hết sức tránh.”',
          detail: 'Chương trình nhận được hàng ngàn phản hồi xúc động và biết ơn từ các bạn tân sinh viên và phụ huynh. Đó mới chính là thành công đích thực!',
          type: 'positive',
        },
      },
      {
        id: '6c',
        code: 'C',
        icon: '🥱',
        text: 'Copy lại y nguyên mẫu chương trình của năm ngoái cho đỡ phải suy nghĩ nhiều.',
        subtext: 'Lối mòn, không quan tâm bối cảnh tân sinh viên năm nay đã thay đổi.',
        deltas: { docLap: -10, viDan: -10 },
        tag: 'routine_choice',
        feedback: {
          title: 'BỆNH BẢO THỦ & TRÌ TRỆ',
          quote: '“Thực tiễn luôn vận động biến đổi, phương pháp làm việc cũng phải luôn đổi mới.”',
          detail: 'Chương trình cũ kỹ, tẻ nhạt khiến hội trường vắng ngắt chỉ sau 30 phút khai mạc.',
          type: 'funny',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Nhà nước của nhân dân, do nhân dân, vì nhân dân',
      content: 'Tư tưởng Hồ Chí Minh luôn đặt Nhân dân ở vị trí tối thượng: “Dân là gốc của nước”. Người căn dặn cán bộ, đảng viên phải là “người đày tớ thật trung thành của nhân dân”. Mọi chính sách, hoạt động phong trào phải xuất phát từ đời sống thực tế, giải quyết đúng tâm tư nguyện vọng của quần chúng, kiên quyết chống bệnh hình thức, phô trương lãng phí.',
    },
  },

  /* =========================================================================
     LEVEL 7: BẠN ĐƯỢC PHÉP PHÊ BÌNH
     ========================================================================= */
  {
    id: 'level-7',
    levelNum: 7,
    levelTag: 'LEVEL 7 — VĂN HÓA PHÊ BÌNH',
    title: '“Bạn được phép phê bình”',
    situationTime: '📍 PHÒNG HỌP TỔNG KẾT ĐỀ TÀI',
    situationHeadline: 'Nhóm trưởng Tuấn liên tục mắc lỗi trễ hạn và phân chia công việc bất hợp lý.',
    situationDesc: 'Nhiều thành viên ức chế nhưng không ai dám lên tiếng vì sợ “mất hòa khí”. Tuấn lại là người có cái tôi rất cao và dễ tự ái khi bị nhắc nhở.',
    npc: {
      id: 'minh',
      quote: '“Thôi tao nhịn cho êm chuyện, chứ nói ra nó giận rồi nhóm toang luôn thì mệt lắm!”',
    },
    knowledgeKey: 'node_phebinh_xaydung',
    options: [
      {
        id: '7a',
        code: 'A',
        icon: '🤐',
        text: 'Im lặng hoàn toàn để giữ gìn “sự đoàn kết bề ngoài” và không làm mất mặt ai.',
        subtext: 'Bằng mặt nhưng không bằng lòng, dĩ hòa vi quý mù quáng.',
        deltas: { doanKet: -15, docLap: -10, daoDuc: -10 },
        tag: 'silence_choice',
        feedback: {
          title: 'ĐOÀN KẾT GIẢ TẠO & NÉ TRÁNH',
          quote: '“Im lặng trước khuyết điểm là đồng lõa với sự thụt lùi của tập thể.”',
          detail: 'Sự im lặng tích tụ thành nỗi bực bội ngầm. Dự án càng về sau càng rối ren vì những sai lầm cốt lõi không bao giờ được sửa chữa.',
          type: 'warning',
        },
      },
      {
        id: '7b',
        code: 'B',
        icon: '🗣️',
        text: 'Họp kín nhóm, góp ý thẳng thắn vào công việc cụ thể trên tinh thần chân thành, xây dựng và đề xuất giải pháp khắc phục.',
        subtext: 'Tự phê bình và phê bình với thái độ vì tập thể, có tình đồng chí.',
        deltas: { doanKet: +20, daoDuc: +15, docLap: +10 },
        tag: 'constructive_criticism_choice',
        feedback: {
          title: 'VŨ KHÍ SẮC BÉN: TỰ PHÊ BÌNH & PHÊ BÌNH',
          quote: '“Thuốc đắng dã tật, sự thật mất lòng. Phê bình đúng giúp nhau cùng hoàn thiện.”',
          detail: 'Nhóm trưởng nhận ra thiếu sót của mình, chân thành xin lỗi cả nhóm và thay đổi cách quản lý. Khối đoàn kết của nhóm trở nên bền chặt và vững vàng hơn bao giờ hết!',
          type: 'positive',
        },
      },
      {
        id: '7c',
        code: 'C',
        icon: '💣',
        text: 'Đăng đàn lên nhóm chat chung của cả lớp để chỉ trích cho hả giận.',
        subtext: 'Công kích cá nhân, hạ bệ uy tín đồng đội.',
        deltas: { doanKet: -25, daoDuc: -15 },
        tag: 'attack_choice',
        feedback: {
          title: 'CÔNG KÍCH CÁ NHÂN PHÁ HOẠI TẬP THỂ',
          quote: '“Phê bình để giúp nhau tiến bộ, không phải để bới lông tìm vết, vùi dập nhau.”',
          detail: 'Cả lớp chứng kiến cảnh đấu tố gay gắt. Nhóm tan rã hoàn toàn trong sự thù hằn và thất bại.',
          type: 'alarm',
        },
      },
    ],
    decode: {
      tag: 'GIẢI MÃ TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Tư tưởng về Xây dựng Đảng & Đại đoàn kết',
      content: 'Chủ tịch Hồ Chí Minh dạy: “Tự phê bình và phê bình là thứ vũ khí sắc bén nhất để sửa chữa khuyết điểm và phát triển ưu điểm... Phê bình việc chứ không phê bình người; phê bình phải thành khẩn, ráo riết, triệt để nhưng phải có tình đồng chí thương yêu lẫn nhau”. Tuyệt đối chống thái độ dĩ hòa vi quý hoặc lợi dụng phê bình để đả kích cá nhân.',
    },
  },

  /* =========================================================================
     LEVEL 8: FINAL BOSS — CHIẾN LƯỢC TOÀN DIỆN
     ========================================================================= */
  {
    id: 'level-8',
    levelNum: 8,
    levelTag: 'LEVEL 8 — FINAL BOSS: CON ĐƯỜNG BẠN CHỌN',
    title: '“Đứng trước ngã rẽ Dự án Tốt nghiệp”',
    situationTime: '🔥 BẢO VỆ ĐỀ TÀI CUỐI KỲ',
    situationHeadline: 'Bạn và nhóm chuẩn bị bước vào giai đoạn quyết định xây dựng giải pháp đổi mới sáng tạo.',
    situationDesc: 'Thay vì chỉ hỏi đúng sai, đây là bài kiểm tra tổng hợp tư duy của bạn. Hãy chọn CHIẾN LƯỢC HÀNH ĐỘNG toàn diện nhất phản ánh trọn vẹn tinh thần Tư tưởng Hồ Chí Minh:',
    npc: {
      id: 'teacher',
      quote: '“Hãy cho thầy cô thấy: Bạn đã thực sự biến những trang sách HCM202 thành kim chỉ nam hành động như thế nào!”',
    },
    knowledgeKey: 'node_hoc_di_doi_hanh',
    isBossLevel: true,
    options: [
      {
        id: '8a',
        code: 'A',
        icon: '⏩',
        text: 'CHIẾN LƯỢC ĂN XỔI: Tìm một đề tài đã có sẵn ở trường khác, chỉnh sửa 10% rồi nộp bài để đạt điểm an toàn nhanh nhất.',
        subtext: 'Ít rủi ro, ít tốn công nhưng rỗng tuếch về giá trị thực học.',
        deltas: { docLap: -20, hocLam: -20, daoDuc: -20 },
        tag: 'boss_shortcut',
        feedback: {
          title: 'CON ĐƯỜNG LỆ THUỘC & GIÁ TRỊ ẢO',
          quote: '“Học để lấy bằng cấp mà không có thực học thì ra đời như người mù đi đêm.”',
          detail: 'Bạn có thể qua môn với điểm 7, nhưng đã đánh mất cơ hội quý giá nhất của 4 năm đại học: Rèn luyện năng lực tư duy giải quyết vấn đề thực tế.',
          type: 'warning',
        },
      },
      {
        id: '8b',
        code: 'B',
        icon: '🌟',
        text: 'CHIẾN LƯỢC TOÀN DIỆN: Nghiên cứu lý luận nền tảng + Khảo sát nhu cầu thực tế của cộng đồng + Phát huy sức mạnh đoàn kết nhóm + Đổi mới sáng tạo độc lập.',
        subtext: 'Kết hợp hoàn hảo: Độc lập tự chủ + Đại đoàn kết + Đạo đức chính trực + Vì cộng đồng + Học đi đôi với hành.',
        deltas: { docLap: +25, doanKet: +25, daoDuc: +25, viDan: +25, hocLam: +25 },
        tag: 'boss_holistic',
        feedback: {
          title: '🏆 BẬC THẦY VẬN DỤNG TƯ TƯỞNG HỒ CHÍ MINH',
          quote: '“Lý luận gắn liền với thực tiễn — Hành động vì sự tiến bộ của con người và xã hội!”',
          detail: 'Dự án của nhóm bạn không chỉ đạt điểm A xuất sắc từ Hội đồng giám khảo mà còn được doanh nghiệp tài trợ triển khai ứng dụng thực tế vào đời sống!',
          type: 'positive',
        },
      },
      {
        id: '8c',
        code: 'C',
        icon: '🗿',
        text: 'CHIẾN LƯỢC ĐƠN ĐỘC: Tự giam mình trong phòng thí nghiệm, không tiếp xúc thực tế, tin rằng một mình mình đủ sức làm nên tất cả.',
        subtext: 'Chăm chỉ nhưng xa rời thực tiễn và sức mạnh cộng đồng.',
        deltas: { docLap: +10, doanKet: -15, viDan: -15, hocLam: -5 },
        tag: 'boss_isolated',
        feedback: {
          title: 'THÁP NGÀ TÁCH RỜI ĐỜI SỐNG',
          quote: '“Khoa học kỹ thuật nếu không phục vụ đời sống nhân dân thì chỉ là lý thuyết suông.”',
          detail: 'Mô hình bạn làm rất phức tạp nhưng không ai sử dụng được vì không giải quyết đúng bài toán người dùng đang cần.',
          type: 'neutral',
        },
      },
    ],
    decode: {
      tag: 'TỔNG KẾT TƯ TƯỞNG HỒ CHÍ MINH',
      chapter: 'Vận dụng Tư tưởng Hồ Chí Minh trong thời kỳ đổi mới',
      content: 'Tư tưởng Hồ Chí Minh là một hệ thống chỉnh thể, khoa học và cách mạng: Độc lập dân tộc gắn liền với CNXH; Đoàn kết là sức mạnh vô địch; Đạo đức cách mạng là cái gốc của con người; Lấy dân làm gốc là mục tiêu phục vụ; Học đi đôi với hành là phương pháp thực tiễn. Nắm vững tư tưởng Bác là nắm lấy phương pháp luận biện chứng để sống, học tập và cống hiến cho đất nước.',
    },
  },
];

/**
 * HỆ THỐNG ĐÁNH GIÁ PROFILE & 10+ ENDING
 */
export function evaluatePersonaProfile(stats, choiceHistory = []) {
  const { docLap, doanKet, daoDuc, viDan, hocLam } = stats;
  const avg = (docLap + doanKet + daoDuc + viDan + hocLam) / 5;

  const hasCopyChoice = choiceHistory.some((c) => c.tag === 'copy_choice' || c.tag === 'boss_shortcut');
  const isAllIndependent = choiceHistory.every((c) => c.tag !== 'copy_choice' && c.tag !== 'boss_shortcut');
  const hasSecretEnding = avg >= 78 && docLap >= 75 && doanKet >= 75 && daoDuc >= 75 && isAllIndependent;

  if (hasSecretEnding) {
    return {
      id: 'ending_secret',
      title: '🌟 BẬC THẦY BIỆN CHỨNG: BẠN KHÔNG CHƠI THEO ĐÁP ÁN',
      badge: 'SECRET ENDING UNLOCKED',
      color: '#ffd700',
      rankGrade: 'EX',
      quote: '“Bạn nhận ra rằng tư tưởng Hồ Chí Minh không phải là mớ công thức học thuộc, mà là phương pháp tư duy sống động để tự chủ, đoàn kết và phụng sự!”',
      desc: 'Bạn đã xuất sắc vượt qua mọi cái bẫy hình thức và giáo điều. Ở mỗi tình huống, bạn đều biết đặt lợi ích chung lên trên, tôn trọng sự thật và vận dụng lý luận một cách sáng tạo vào thực tiễn.',
      analysis: 'Hồ sơ của bạn đạt độ cân bằng tuyệt đối giữa 5 phẩm chất: Độc lập tự chủ (🎯), Đại đoàn kết (🤝), Đạo đức trong sáng (⚖️), Tinh thần vì nhân dân (👥) và Năng lực hành động thực tế (💡).',
    };
  }

  if (docLap >= 75 && hocLam >= 70) {
    return {
      id: 'ending_practitioner',
      title: '🎯 NGƯỜI VẬN DỤNG THỰC TIỄN',
      badge: 'TỰ CHỦ & ĐỔI MỚI SÁNG TẠO',
      color: '#3b82f6',
      rankGrade: 'S+',
      quote: '“Bạn không chỉ thuộc lý thuyết trên giảng đường — Bạn biết cách biến tri thức thành giải pháp trong cuộc sống thực tế.”',
      desc: 'Điểm mạnh nổi bật của bạn là tư duy phản biện độc lập và năng lực thực thi. Bạn không bao giờ thỏa hiệp với thói ỷ lại hay sao chép thụ động.',
      analysis: 'Chỉ số Độc lập – Tự chủ và Học & Làm của bạn rất cao. Hãy tiếp tục phát huy hơn nữa tinh thần tập hợp lực lượng và lắng nghe đồng đội.',
    };
  }

  if (doanKet >= 75 && viDan >= 70) {
    return {
      id: 'ending_connector',
      title: '🤝 NGƯỜI KẾT NỐI TẬP THỂ',
      badge: 'ĐẠI ĐOÀN KẾT & VÌ CỘNG ĐỒNG',
      color: '#10b981',
      rankGrade: 'S',
      quote: '“Bạn hiểu sâu sắc rằng: Muốn đi nhanh thì đi một mình, muốn đi xa phải đồng lòng đi cùng tập thể.”',
      desc: 'Bạn là chất keo kết dính mọi xung đột nhóm, luôn biết đặt mình vào vị trí của người khác và làm việc với cái tâm trong sáng vì cộng đồng.',
      analysis: 'Chỉ số Đại đoàn kết và Vì nhân dân của bạn dẫn đầu. Bạn sinh ra để trở thành người điều phối và lãnh đạo phục vụ truyền cảm hứng.',
    };
  }

  if (daoDuc >= 80) {
    return {
      id: 'ending_principled',
      title: '⚖️ NGƯỜI GIỮ VỮNG NGUYÊN TẮC',
      badge: 'CHÍNH TRỰC & LIÊM KHIẾT',
      color: '#f59e0b',
      rankGrade: 'S',
      quote: '“Cần – Kiệm – Liêm – Chính – Chí công vô tư không chỉ là khẩu hiệu, đó là danh dự và lối sống của bạn.”',
      desc: 'Trước mọi cám dỗ điểm số hay lợi ích cá nhân, bạn luôn giữ vững sự công tâm, trung thực và minh bạch.',
      analysis: 'Chỉ số Đạo đức cách mạng của bạn đạt điểm gần như tuyệt đối. Sự chính trực của bạn tạo dựng niềm tin vững chắc trong mắt thầy cô và bạn bè.',
    };
  }

  if (hasCopyChoice || docLap <= 35) {
    return {
      id: 'ending_copymachine',
      title: '📋 “MÁY COPY” ĐI TẮT ĐÓN ĐẦU',
      badge: 'CẦN RÈN LUYỆN TÍNH TỰ CHỦ',
      color: '#ec4899',
      rankGrade: 'C+',
      quote: '“Bạn có xu hướng chọn con đường nhanh nhất, nhưng con đường đi tắt thường không dẫn đến thực học đích thực.”',
      desc: 'Bạn vẫn còn thói quen phụ thuộc vào tài liệu mẫu và né tránh những thử thách đòi hỏi tư duy độc lập.',
      analysis: 'Hãy đọc kỹ lại chuyên đề: “Độc lập, tự chủ, sáng tạo trong Tư tưởng Hồ Chí Minh”. Điểm số có thể mua bằng sao chép, nhưng năng lực thì không!',
    };
  }

  return {
    id: 'ending_growing',
    title: '🌿 NGƯỜI ĐANG TRƯỞNG THÀNH',
    badge: 'TIỀM NĂNG BỨT PHÁ',
    color: '#8b5cf6',
    rankGrade: 'A',
    quote: '“Bạn đang trên hành trình khám phá và hoàn thiện bản thân qua từng quyết định đời sinh viên.”',
    desc: 'Bạn có nhận thức đúng đắn ở nhiều khía cạnh nhưng đôi khi còn dao động giữa lợi ích cá nhân và trách nhiệm tập thể.',
    analysis: 'Điểm trung bình của bạn ở mức khá tốt (' + Math.round(avg) + '/100). Hãy tiếp tục tôi luyện đức tính chí công vô tư và sự kiên trì bền bỉ.',
  };
}
