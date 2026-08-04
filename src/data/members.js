// 멤버 정보를 여기에 추가/수정하세요.
// - photo는 없으면 이니셜 아바타로 자동 표시됩니다.
// - number는 등번호 없는 멤버는 null로 둡니다.
// - birthYear로 나이를 저장하면 매년 다시 계산할 필요 없이 자동으로 현재 나이가 표시됩니다 (src/utils/age.js, 한국식 나이).
// - positions는 여러 포지션을 겸할 수 있어 배열로 관리합니다 (예: ['MF', 'FW']).
// - tier는 S~D, rank는 같은 티어 안에서의 등수입니다 (낮을수록 상위). 전체 순위는 티어 → rank 순으로 매겨집니다.
// - stats는 0~99 사이 값이며, 6개 스탯의 단순 평균으로 종합 능력치(OVR)가 계산됩니다 (포지션 가중치 없음).
// - intro는 카드에는 안 보이고 클릭했을 때 상세보기에서만 보입니다.
// GK 골키퍼, DF 수비수, MF 미드필더, FW 공격수
//
// stats 총점은 티어/등수별 기준선을 유지합니다 (S 1위=570→평균95, 같은 티어 등수마다 OVR -1(총점 -6),
// S→A 사이는 OVR -4(총점 -24), 그 외 티어 경계(A→B, B→C, C→D)는 OVR -2(총점 -12)).
// 그 총점을 아래 "능력치 세부 순위"에 따라 6개 스탯에 차등 분배했습니다 (총점 자체는 유지, 분포만 세분화).
//
// 능력치 세부 순위 (2026-08-04, 팀 자체 평가로 직접 매긴 순서)
// 범례: 왼쪽일수록 해당 멤버 안에서 더 높은 능력치. `,`=거의 비슷 · `-`=조금 차이 · `>`=많이 차이(더 넓게 벌림)
//
// [S] 고태현 패스,활동량,슛,수비,드리블-피지컬 / 김다훈 패스,드리블,슛,수비,활동량-피지컬 /
//     최현규 수비,활동량,피지컬>슛,패스,드리블 / 한상혁 패스,드리블,활동량,슛,수비>피지컬 /
//     송정성 수비,활동량,피지컬>패스,슛,드리블 / 송지우 슛,드리블>활동량,패스,수비,피지컬
// [A] 진시영 슛,피지컬,드리블,활동량,수비>패스 / 박주성 패스,수비,활동량>슛,드리블,피지컬 /
//     김진호 슛,드리블,활동량-패스,피지컬,수비 / 안무힐 슛,드리블,패스>피지컬,수비,활동량 /
//     찬영 수비-패스-활동량,슛,피지컬,드리블 / 김진웅 슛,활동량,드리블,피지컬,패스,수비
// [B] 이승준 슛,패스,드리블>활동량,피지컬,수비 / 서승찬 드리블,슛,피지컬,수비-패스,활동량 /
//     최종범 패스,수비>활동량,드리블,피지컬,슛 / 장천명 패스,드리블>수비,활동량-피지컬,슛 /
//     준서 패스>수비,활동량,슛,피지컬,드리블 / 윤준영 슛,활동량>드리블,패스,수비,피지컬
// [C] 편현재 슛,활동량,수비,패스,피지컬,드리블 / 한민석 패스>드리블,피지컬,슛,활동량,수비 /
//     이민녕 슛,활동량,수비-패스,피지컬,드리블 / 박형진 드리블,활동량>슛,수비,피지컬,패스 /
//     김형석 패스-드리블>수비,슛,피지컬,활동량 / 장경우 수비,활동량,피지컬,패스>슛,드리블
// [D] 조병찬 수비>슛,패스,드리블,피지컬,활동량 / 탁성원 수비>슛,패스,드리블,피지컬,활동량
export const members = [
  // S 티어
  { id: 1, name: '고태현', number: 7, birthYear: 1999, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 1, photo: '', intro: 'GOATㅐ현', stats: { passing: 98, dribbling: 94, physical: 90, defense: 95, stamina: 97, finishing: 96 } },
  { id: 2, name: '김다훈', number: 17, birthYear: 1999, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 2, photo: '', intro: '같은 팀하고 싶은 남자 1위', stats: { passing: 97, dribbling: 96, physical: 89, defense: 94, stamina: 93, finishing: 95 } },
  { id: 3, name: '최현규', number: 6, birthYear: 1998, positions: ['MF', 'DF'], tier: 'S', rank: 3, photo: '', intro: '뚫을 수 없는 남자', stats: { passing: 87, dribbling: 87, physical: 98, defense: 99, stamina: 99, finishing: 88 } },
  { id: 4, name: '한상혁', number: 8, birthYear: 1998, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 4, photo: '', intro: '육각형 플레이어', stats: { passing: 96, dribbling: 95, physical: 82, defense: 92, stamina: 94, finishing: 93 } },
  { id: 5, name: '송정성', number: 21, birthYear: 1998, positions: ['DF'], tier: 'S', rank: 5, photo: '', intro: '수비의 천재', stats: { passing: 86, dribbling: 84, physical: 96, defense: 98, stamina: 97, finishing: 85 } },
  { id: 6, name: '송지우', number: 11, birthYear: 2000, positions: ['FW', 'GK'], tier: 'S', rank: 6, photo: '', intro: '미친 골 결정능력 보유자', stats: { passing: 87, dribbling: 97, physical: 84, defense: 86, stamina: 88, finishing: 98 } },

  // A 티어
  { id: 7, name: '진시영', number: 1, birthYear: 1999, positions: ['FW'], tier: 'A', rank: 1, photo: '', intro: '주사위형 플레이어', stats: { passing: 76, dribbling: 88, physical: 89, defense: 86, stamina: 87, finishing: 90 } },
  { id: 8, name: '박주성', number: 10, birthYear: 1999, positions: ['MF', 'DF'], tier: 'A', rank: 2, photo: '', intro: 'S급 서포터', stats: { passing: 92, dribbling: 79, physical: 78, defense: 91, stamina: 90, finishing: 80 } },
  { id: 9, name: '김진호', number: 66, birthYear: 1999, positions: ['MF', 'FW'], tier: 'A', rank: 3, photo: '', intro: '성장형 괴물', stats: { passing: 82, dribbling: 87, physical: 81, defense: 80, stamina: 86, finishing: 88 } },
  { id: 10, name: '안무힐', number: null, birthYear: 1999, positions: ['FW'], tier: 'A', rank: 4, photo: '', intro: '이름부터 무힐 ㄷㄷ', stats: { passing: 88, dribbling: 89, physical: 78, defense: 77, stamina: 76, finishing: 90 } },
  { id: 11, name: '찬영', number: 3, birthYear: 1999, positions: ['DF'], tier: 'A', rank: 5, photo: '', intro: '수비? 쉽다..', stats: { passing: 85, dribbling: 78, physical: 79, defense: 88, stamina: 82, finishing: 80 } },
  { id: 12, name: '김진웅', number: 13, birthYear: 2003, positions: ['MF', 'FW'], tier: 'A', rank: 6, photo: '', intro: '성장형 괴물 추격자', stats: { passing: 79, dribbling: 82, physical: 80, defense: 78, stamina: 83, finishing: 84 } },

  // B 티어
  { id: 13, name: '이승준', number: null, birthYear: 1999, positions: ['FW'], tier: 'B', rank: 1, photo: '', intro: '예술가', stats: { passing: 85, dribbling: 84, physical: 73, defense: 72, stamina: 74, finishing: 86 } },
  { id: 14, name: '서승찬', number: null, birthYear: 1998, positions: ['MF'], tier: 'B', rank: 2, photo: '', intro: '다리가 정말 길다', stats: { passing: 75, dribbling: 82, physical: 79, defense: 78, stamina: 74, finishing: 80 } },
  { id: 15, name: '최종범', number: null, birthYear: 1999, positions: ['MF'], tier: 'B', rank: 3, photo: '', intro: '중원의 정령', stats: { passing: 85, dribbling: 74, physical: 73, defense: 84, stamina: 75, finishing: 71 } },
  { id: 16, name: '장천명', number: 0, birthYear: 1999, positions: ['DF'], tier: 'B', rank: 4, photo: '', intro: '자아를 찾아가는자', stats: { passing: 85, dribbling: 84, physical: 70, defense: 75, stamina: 73, finishing: 69 } },
  { id: 17, name: '준서', number: 9, birthYear: 2003, positions: ['MF'], tier: 'B', rank: 5, photo: '', intro: '플레이메이커', stats: { passing: 85, dribbling: 71, physical: 72, defense: 75, stamina: 74, finishing: 73 } },
  { id: 18, name: '윤준영', number: 27, birthYear: 2000, positions: ['MF', 'GK'], tier: 'B', rank: 6, photo: '', intro: '사춘기 아이', stats: { passing: 71, dribbling: 72, physical: 68, defense: 70, stamina: 81, finishing: 82 } },

  // C 티어
  { id: 19, name: '편현재', number: 4, birthYear: 1999, positions: ['MF'], tier: 'C', rank: 1, photo: '', intro: '그의 슛을 조심해', stats: { passing: 71, dribbling: 69, physical: 70, defense: 73, stamina: 74, finishing: 75 } },
  { id: 20, name: '한민석', number: 5, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 2, photo: '', intro: '개그맨', stats: { passing: 81, dribbling: 71, physical: 70, defense: 67, stamina: 68, finishing: 69 } },
  { id: 21, name: '이민녕', number: null, birthYear: 1999, positions: ['MF'], tier: 'C', rank: 3, photo: '', intro: 'SRG-FC 유니콘', stats: { passing: 68, dribbling: 66, physical: 67, defense: 72, stamina: 73, finishing: 74 } },
  { id: 22, name: '박형진', number: null, birthYear: 1998, positions: ['MF'], tier: 'C', rank: 4, photo: '', intro: '성실한 플레이어', stats: { passing: 63, dribbling: 77, physical: 65, defense: 66, stamina: 76, finishing: 67 } },
  { id: 23, name: '김형석', number: 26, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 5, photo: '', intro: '1게임은 잘함', stats: { passing: 78, dribbling: 75, physical: 63, defense: 66, stamina: 62, finishing: 64 } },
  { id: 24, name: '장경우', number: 77, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 6, photo: '', intro: '탁병과는 다른 티어', stats: { passing: 69, dribbling: 59, physical: 70, defense: 73, stamina: 71, finishing: 60 } },

  // D 티어
  { id: 25, name: '조병찬', number: 22, birthYear: 1999, positions: ['GK', 'DF'], tier: 'D', rank: 1, photo: '', intro: '골키퍼는 기가막힘', stats: { passing: 64, dribbling: 63, physical: 62, defense: 75, stamina: 61, finishing: 65 } },
  { id: 26, name: '탁성원', number: 99, birthYear: 1999, positions: ['DF'], tier: 'D', rank: 2, photo: '', intro: '99번 절대적 플레이어', stats: { passing: 63, dribbling: 62, physical: 61, defense: 74, stamina: 60, finishing: 64 } },
]
