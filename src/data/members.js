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
// stats는 아직 임의로 채운 임시값입니다 (같은 티어 안에서는 등수마다 1씩, 티어가 바뀔 때는 2씩 차이). tier/rank/positions는 실제 값으로 반영됨.
export const members = [
  // S 티어
  { id: 1, name: '고태현', number: 7, birthYear: 1999, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 1, photo: '', intro: '포지션 3개? 그냥 다 잘함', stats: { passing: 85, dribbling: 85, physical: 85, defense: 85, stamina: 85, finishing: 85 } },
  { id: 2, name: '김다훈', number: 17, birthYear: 1999, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 2, photo: '', intro: '어디 세워놔도 MOM 각', stats: { passing: 84, dribbling: 84, physical: 84, defense: 84, stamina: 84, finishing: 84 } },
  { id: 3, name: '최현규', number: 6, birthYear: 1998, positions: ['MF', 'DF'], tier: 'S', rank: 3, photo: '', intro: '중원부터 뒷문까지 혼자 다 잠금', stats: { passing: 83, dribbling: 83, physical: 83, defense: 83, stamina: 83, finishing: 83 } },
  { id: 4, name: '한상혁', number: 8, birthYear: 1998, positions: ['MF', 'FW', 'DF'], tier: 'S', rank: 4, photo: '', intro: '능력치 그래프가 그냥 원임', stats: { passing: 82, dribbling: 82, physical: 82, defense: 82, stamina: 82, finishing: 82 } },
  { id: 5, name: '송정성', number: 21, birthYear: 1998, positions: ['DF'], tier: 'S', rank: 5, photo: '', intro: '뚫리면 그날은 우리 팀 잘못', stats: { passing: 81, dribbling: 81, physical: 81, defense: 81, stamina: 81, finishing: 81 } },
  { id: 6, name: '송지우', number: 11, birthYear: 2000, positions: ['FW', 'GK'], tier: 'S', rank: 6, photo: '', intro: '공격도 골키퍼도 다 함, 반칙 아님?', stats: { passing: 80, dribbling: 80, physical: 80, defense: 80, stamina: 80, finishing: 80 } },

  // A 티어
  { id: 7, name: '김진호', number: 66, birthYear: 1999, positions: ['MF', 'FW'], tier: 'A', rank: 3, photo: '', intro: '공 잡으면 일단 재밌는 일이 생김', stats: { passing: 78, dribbling: 78, physical: 78, defense: 78, stamina: 78, finishing: 78 } },
  { id: 8, name: '진시영', number: null, birthYear: 1999, positions: ['FW'], tier: 'A', rank: 1, photo: '', intro: '골 냄새 하나는 확실히 맡음', stats: { passing: 77, dribbling: 77, physical: 77, defense: 77, stamina: 77, finishing: 77 } },
  { id: 9, name: '박주성', number: 10, birthYear: 1999, positions: ['MF', 'DF'], tier: 'A', rank: 2, photo: '', intro: '궂은일 담당, 근데 잘함', stats: { passing: 76, dribbling: 76, physical: 76, defense: 76, stamina: 76, finishing: 76 } },
  { id: 10, name: '안무힐', number: null, birthYear: 1999, positions: ['FW'], tier: 'A', rank: 4, photo: '', intro: '이름부터 무힐, 상대 수비는 무너짐', stats: { passing: 75, dribbling: 75, physical: 75, defense: 75, stamina: 75, finishing: 75 } },
  { id: 11, name: '찬영', number: 3, birthYear: 1999, positions: ['DF'], tier: 'A', rank: 5, photo: '', intro: '짧고 굵게, 실점은 안 굵게', stats: { passing: 74, dribbling: 74, physical: 74, defense: 74, stamina: 74, finishing: 74 } },
  { id: 12, name: '김진웅', number: 13, birthYear: 2003, positions: ['MF', 'FW'], tier: 'A', rank: 6, photo: '', intro: '박스 안팎 어디든 출몰', stats: { passing: 73, dribbling: 73, physical: 73, defense: 73, stamina: 73, finishing: 73 } },

  // B 티어
  { id: 13, name: '서승찬', number: null, birthYear: 1998, positions: ['MF'], tier: 'B', rank: 1, photo: '', intro: '밸런스형 미드필더, 티 안 나게 잘함', stats: { passing: 71, dribbling: 71, physical: 71, defense: 71, stamina: 71, finishing: 71 } },
  { id: 14, name: '최종범', number: null, birthYear: 1999, positions: ['MF'], tier: 'B', rank: 2, photo: '', intro: '묵묵히 중원 정리, 근데 존재감은 큼', stats: { passing: 70, dribbling: 70, physical: 70, defense: 70, stamina: 70, finishing: 70 } },
  { id: 15, name: '장천명', number: 0, birthYear: 1999, positions: ['DF'], tier: 'B', rank: 3, photo: '', intro: '0번 달고 존재감은 0이 아님', stats: { passing: 69, dribbling: 69, physical: 69, defense: 69, stamina: 69, finishing: 69 } },
  { id: 16, name: '이승준', number: null, birthYear: 1999, positions: ['FW'], tier: 'B', rank: 4, photo: '', intro: '타이밍 하나로 먹고사는 스타일', stats: { passing: 68, dribbling: 68, physical: 68, defense: 68, stamina: 68, finishing: 68 } },
  { id: 17, name: '준서', number: 9, birthYear: 2003, positions: ['MF'], tier: 'B', rank: 5, photo: '', intro: '이름만 봐도 든든한 중원', stats: { passing: 67, dribbling: 67, physical: 67, defense: 67, stamina: 67, finishing: 67 } },
  { id: 18, name: '윤준영', number: 27, birthYear: 2000, positions: ['MF', 'GK'], tier: 'B', rank: 6, photo: '', intro: '미드도 골키퍼도, 팀에 없으면 안 되는 사람', stats: { passing: 66, dribbling: 66, physical: 66, defense: 66, stamina: 66, finishing: 66 } },

  // C 티어
  { id: 19, name: '편현재', number: 4, birthYear: 1999, positions: ['MF'], tier: 'C', rank: 1, photo: '', intro: '성실함으로 자리를 만드는 타입', stats: { passing: 64, dribbling: 64, physical: 64, defense: 64, stamina: 64, finishing: 64 } },
  { id: 20, name: '한민석', number: 5, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 2, photo: '', intro: '말없이 뒤에서 다 막아주는 스타일', stats: { passing: 63, dribbling: 63, physical: 63, defense: 63, stamina: 63, finishing: 63 } },
  { id: 21, name: '이민녕', number: null, birthYear: 1999, positions: ['MF'], tier: 'C', rank: 3, photo: '', intro: '패스 한 번에 분위기가 바뀜', stats: { passing: 62, dribbling: 62, physical: 62, defense: 62, stamina: 62, finishing: 62 } },
  { id: 22, name: '김형석', number: 26, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 4, photo: '', intro: '포지션은 수비, 마인드는 주장', stats: { passing: 61, dribbling: 61, physical: 61, defense: 61, stamina: 61, finishing: 61 } },
  { id: 23, name: '박형진', number: null, birthYear: 1998, positions: ['MF'], tier: 'C', rank: 5, photo: '', intro: '체력으로 승부하는 정직한 스타일', stats: { passing: 60, dribbling: 60, physical: 60, defense: 60, stamina: 60, finishing: 60 } },
  { id: 24, name: '장경우', number: 77, birthYear: 1999, positions: ['DF'], tier: 'C', rank: 6, photo: '', intro: '77번 달고 묵직하게 자리 지킴', stats: { passing: 59, dribbling: 59, physical: 59, defense: 59, stamina: 59, finishing: 59 } },

  // D 티어
  { id: 25, name: '조병찬', number: 22, birthYear: 1999, positions: ['GK', 'DF'], tier: 'D', rank: 1, photo: '', intro: '골키퍼 겸 수비수, 몸이 두 개였으면', stats: { passing: 57, dribbling: 57, physical: 57, defense: 57, stamina: 57, finishing: 57 } },
  { id: 26, name: '탁성원', number: 99, birthYear: 1999, positions: ['DF'], tier: 'D', rank: 2, photo: '', intro: '99번 달고 자리는 늘 지킴', stats: { passing: 56, dribbling: 56, physical: 56, defense: 56, stamina: 56, finishing: 56 } },
]
